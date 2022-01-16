const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const aws = require('./aws.js');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    selectDirectory() {
      ipcRenderer.send('select-directory');
    },
  },
});

ipcRenderer.on('directory-selected', (event, selectedDirectoryPath) => {
  fs.readdir(selectedDirectoryPath[0], (err, allFileNames) => {
    const imageFileNames = allFileNames.filter(
      (filename) =>
        filename.endsWith('.JPG') ||
        filename.endsWith('.PNG') ||
        filename.endsWith('.JPEG') ||
        filename.endsWith('.jpg') ||
        filename.endsWith('.png') ||
        filename.endsWith('.jpeg')
    );
    const _path = path.join(selectedDirectoryPath, imageFileNames[0]);
    console.log(_path);
    //  console.log(selectedDirectoryPath + imageFileNames[0]);
  });
  window.dispatchEvent(new Event('rekognition-finished'));
  new window.Notification('Se terminó de reconocer las imagenes', {
    body: 'El reporte de reconocimiento de números en las imágenes está listo',
  });
});

ipcRenderer.on('set-aws-credentials', (event, ...args) => {
  window.dispatchEvent(new Event('set-aws-credentials'));
});
