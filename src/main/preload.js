const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    selectDirectory() {
      ipcRenderer.send('select-directory');
    }
  },
});

ipcRenderer.on('directory-selected', (event, selectedDirectoryPath) => {
  console.log(selectedDirectoryPath);
  
  window.dispatchEvent(new Event('rekognition-finished'));
  new window.Notification('Se terminó de reconocer las imagenes', {
    body: 'El reporte de reconocimiento de números en las imágenes esta listo'
  });
});

ipcRenderer.on('set-aws-credentials', (event, ...args) => {
  new window.Notification('set AWS CREDENTIASSD', {
    body: 'Efffffffffffffffffffffffff esta listo'
  });
});