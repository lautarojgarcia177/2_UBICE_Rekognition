const { contextBridge, ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const UBICEAWSClient = require('./aws.js');
const { Parser, parse } = require('json2csv');
const { Observable, zip, from, tap, map, combineLatest, concat } = require("rxjs");
const { concatAll } = require('rxjs/operators');
const exiftool = require('./exiftool');
const _ = require('lodash');

const awsCredentials = {
    accessKeyId: window.localStorage.getItem('awsAccessKeyId'),
    secretAccessKey: window.localStorage.getItem('awsSecretAccessKey'),
};
if (!window.localStorage.getItem('awsAccessKeyId')) {
    window.localStorage.setItem('awsAccessKeyId', '');
}
if (!window.localStorage.getItem('awsSecretAccessKey')) {
    window.localStorage.setItem('awsSecretAccessKey', '');
}
const ubiceAwsClient = new UBICEAWSClient(awsCredentials);

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
            window.localStorage.setItem('awsAccessKeyId', accessKeyId);
            window.localStorage.setItem('awsSecretAccessKey', secretAccessKey);
            ubiceAwsClient.setCredentials({
                accessKeyId: window.localStorage.getItem('awsAccessKeyId'),
                secretAccessKey: window.localStorage.getItem('awsSecretAccessKey'),
            });
        },
        getCredentials() {
            return {
                accessKeyId: window.localStorage.getItem('awsAccessKeyId'),
                secretAccessKey: window.localStorage.getItem('awsSecretAccessKey'),
            };
        },
    },
});

ipcRenderer.on('directory-selected', (event, selectedDirectoryPath) => {
    selectedDirectoryPath = selectedDirectoryPath.shift();
    if (selectedDirectoryPath) {
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
            if (imageFileNames.length) {
                window.dispatchEvent(new Event('aws-rekognition__start'));
                let completed_count = 0;
                let rekognitionObservablesArray = [];

                function notifyProgress() {
                    completed_count++;
                    const progress = completed_count / imageFileNames.length;
                    window.dispatchEvent(
                        new CustomEvent('rekognition-progress', {
                            detail: { progress: progress },
                        })
                    );
                }

                function formatRekognizedNumbers(rekognizedNumbersArray) {
                    let formatedRekognizedNumbersArray = [];
                    if (!rekognizedNumbersArray.length) {
                        formatedRekognizedNumbersArray.push('#');
                    } else {
                        for (let rekognizedNumber of rekognizedNumbersArray) {
                            const formatedRekognizedNumber = _.padStart(String(rekognizedNumber), 5, '0');
                            formatedRekognizedNumbersArray.push(formatedRekognizedNumber);
                        }
                    }
                    return formatedRekognizedNumbersArray;
                }

                // Fill rekognition observables array
                for (let i = 0; i < imageFileNames.length; i++) {
                    const imagePath = path.join(selectedDirectoryPath, imageFileNames[i]);
                    const observable = from(ubiceAwsClient.rekognize(imagePath)).pipe(
                        map(res => ({
                            imageFilename: imageFileNames[i],
                            findings: res,
                        })),
                        tap(() => notifyProgress()),
                    );
                    rekognitionObservablesArray.push(observable);
                }

                // Subscribe to rekognition observables array
                zip(...rekognitionObservablesArray).subscribe({
                    next: results => {
                        if (Array.isArray(results) &&
                            !results.every((rekognition) => rekognition === undefined)) {

                            for (let result of results) {
                                result.findings = formatRekognizedNumbers((result.findings));
                            }

                            // Add keywords to images
                            for (let i = 0; i < results.length; i++) {
                                const imagePath = path.join(selectedDirectoryPath, results[i].imageFilename);
                                exiftool.addKeywords(imagePath, results[i].findings);
                            }
                            exiftool.endProcess();

                            window.localStorage.setItem(
                                'rekognitionResults',
                                JSON.stringify(results)
                            );

                            window.dispatchEvent(new Event('rekognition-finished'));
                            new window.Notification('Se terminó de reconocer las imagenes', {
                                body: 'El reporte de reconocimiento de números en las imágenes está listo',
                            });
                        }
                    },
                    error: error => dispatchEventRekognitionFailed(error),
                });

            } else {
                window.dispatchEvent(new Event('directory-selected__no-images-error'));
            }
        });
    }
});

ipcRenderer.on('set-aws-credentials', (event, ...args) => {
    window.dispatchEvent(new Event('set-aws-credentials'));
});
ipcRenderer.on('directory-selection-cancelled', (event, ...args) => {
    window.dispatchEvent(new Event('directory-selection-cancelled'));
});

ipcRenderer.on('directory-selected__export-CSV', (_, filePath) => {
    const csv = parse2CSV();
    fs.writeFile(filePath, csv, function(err, _) {
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

function dispatchEventRekognitionFailed(err) {
    window.dispatchEvent(
        new CustomEvent('rekognition-failure', {
            detail: { error: err },
        })
    );
    new window.Notification('Error al reconocer las imagenes', {
        body: 'El resultado del reconocimiento es inválido',
    });
}