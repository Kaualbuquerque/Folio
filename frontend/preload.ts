import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  openExternal: (url: string) => ipcRenderer.send('shell:openExternal', url),
});