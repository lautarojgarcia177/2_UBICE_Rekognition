const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const aws = require('./aws.js');
const { Parser, parse } = require('json2csv');

let rekognitionResults = [];

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
      return rekognitionResults;
    },
    setCredentials(accessKeyId, secretAccessKey) {
      process.env.AWS_ACCESS_KEY_ID = accessKeyId;
      process.env.AWS_SECRET_ACCESS_KEY = secretAccessKey;
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
          const promise = aws.rekognize(imagePath).then((result) => {
            notifyProgress();
            return {
              imageFilename: imageFileNames[i],
              findings: result,
            };
          });
        promises.push(promise);
      }
      Promise.all(promises).then((results) => {
        rekognitionResults = results;
        window.dispatchEvent(new Event('rekognition-finished'));
        new window.Notification('Se terminó de reconocer las imagenes', {
          body: 'El reporte de reconocimiento de números en las imágenes está listo',
        });
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

const parse2CSV = () => {
  const json2csvParser = new Parser();
  const rekognitions = rekognitionResults.map((rekognition) => ({
    imageFilename: rekognition.imageFilename[0],
    findings: rekognition.findings.reduce((prev, curr) => prev + ', ' + curr),
  }));
  return json2csvParser.parse(rekognitions);
};

ipcRenderer.on('directory-selected__export-CSV', (_, filePath) => {
  const csv = parse2CSV();
  fs.writeFile(filePath, csv, function (err, _) {
    shell.showItemInFolder(filePath);
    new window.Notification('Se generó el archivo CSV de resultados', {
      body: 'Se finalizo de generar el reporte en formato CSV, puede encontrarlo en el directorio seleccionado',
    });
  });
});
