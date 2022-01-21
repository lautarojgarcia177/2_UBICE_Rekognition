const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const aws = require('./aws.js');
const { Parser, parse } = require('json2csv');
const _ = require('lodash');

/* Load stored AWS Credentials */
const credentials = getAWSCredentials();
if (credentials?.accessKeyId && credentials?.secretAccessKey) {
  setAWSCredentials(credentials.accessKeyId, credentials.secretAccessKey);
}

function setAWSCredentials(accessKeyId, secretAccessKey) {
  window.localStorage.setItem('awsAccessKeyId', accessKeyId);
  window.localStorage.setItem('awsSecretAccessKey', secretAccessKey);
  process.env.AWS_ACCESS_KEY_ID = accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
}

function getAWSCredentials() {
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

/* API Accesible via window.electron */

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    selectDirectory() {
      ipcRenderer.send('select-directory');
    },
    showSaveDialogCSV() {
      ipcRenderer.send('open-dialog-export-CSV');
    },
  },
  aws: {
    getRekognitions() {
      return JSON.parse(window.localStorage.getItem('rekognitionResults'));
    },
    setCredentials(accessKeyId, secretAccessKey) {
      setAWSCredentials(accessKeyId, secretAccessKey);
    },
    getCredentials() {
      return getAWSCredentials();
    },
  },
});

ipcRenderer.on('directory-selected', (event, selectedDirectoryPath) => {
  selectedDirectoryPath = selectedDirectoryPath.shift();
  fs.readdir(selectedDirectoryPath, (err, allFileNames) => {
    const imageFileNames = allFileNames.filter(
      (filename) =>
        filename.endsWith('.JPG') ||
        filename.endsWith('.PNG') ||
        filename.endsWith('.JPEG') ||
        filename.endsWith('.jpg') ||
        filename.endsWith('.png') ||
        filename.endsWith('.jpeg')
    );
    if (imageFileNames.length > 0) {
      window.dispatchEvent(new Event('aws-rekognition__start'));
      let promises = [];
      let completed_count = 0;
      function notifyProgress() {
        completed_count++;
        const progress = completed_count / imageFileNames.length;
        window.dispatchEvent(
          new CustomEvent('rekognition-progress', {
            detail: { progress: progress },
          })
        );
      }
      for (let i = 0; i < imageFileNames.length; i++) {
        const imagePath = path.join(selectedDirectoryPath, imageFileNames[i]);
        const promise = aws
          .rekognize(imagePath)
          .then((result) => {
            notifyProgress();
            return {
              imageFilename: imageFileNames[i],
              findings: result,
            };
          })
          .catch((err) => {
            dispatchEventRekognitionFailed(err);
          });
        promises.push(promise);
      }
      Promise.all(promises)
        .then((results) => {
          if (
            Array.isArray(results) &&
            !results.every((rekognition) => rekognition === undefined)
          ) {
            window.localStorage.setItem(
              'rekognitionResults',
              JSON.stringify(results)
            );
            window.dispatchEvent(new Event('rekognition-finished'));
            new window.Notification('Se terminó de reconocer las imagenes', {
              body: 'El reporte de reconocimiento de números en las imágenes está listo',
            });
          } else {
            new window.Notification('Error al reconocer las imagenes', {
              body: 'El resultado del reconocimiento es inválido',
            });
          }
        })
        .catch((err) => {
          console.error('Error en promise all', err);
        });
    } else {
      window.dispatchEvent(new Event('directory-selected__no-images-error'));
    }
  });
});

ipcRenderer.on('set-aws-credentials', (event, ...args) => {
  window.dispatchEvent(new Event('set-aws-credentials'));
});

ipcRenderer.on('directory-selection-cancelled', (event, ...args) => {
  window.dispatchEvent(new Event('directory-selection-cancelled'));
});

ipcRenderer.on('directory-selected__export-CSV', (_, filePath) => {
  const csv = parse2CSV();
  fs.writeFile(filePath, csv, function (err, _) {
    shell.showItemInFolder(filePath);
    new window.Notification('Se generó el archivo CSV de resultados', {
      body: 'Se finalizo de generar el reporte en formato CSV, puede encontrarlo en el directorio seleccionado',
    });
  });
});

/* Utility functions */

const parse2CSV = () => {
  const json2csvParser = new Parser();
  const rekognitions = JSON.parse(
    window.localStorage.getItem('rekognitionResults')
  ).map((rekognition) => {
    let findings = '';
    for (let finding of rekognition.findings) {
      if (finding) {
        findings += finding + ', ';
      }
    }
    findings = findings.slice(0, -2);
    return {
      imageFilename: rekognition.imageFilename,
      findings: findings,
    };
  });
  return json2csvParser.parse(rekognitions);
};

let rekognitionFailedMessageDispatched = false;
function dispatchEventRekognitionFailed(err) {
  if (!rekognitionFailedMessageDispatched) {
    rekognitionFailedMessageDispatched = true;
    window.dispatchEvent(
      new CustomEvent('rekognition-failure', {
        detail: { error: err },
      })
    );
    /* Debounce this function call */
    setTimeout(() => {
      rekognitionFailedMessageDispatched = false;
    }, 5000);
  }
}
