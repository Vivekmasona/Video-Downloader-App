const { contextBridge, ipcMain, ipcRenderer } = require("electron");
let dataUrl = (data) => {
    ipcRenderer.send("url", data);
}

let update = (callback) => {
    ipcRenderer.on("update", callback)
}

contextBridge.exposeInMainWorld("Bridge", {
    dataUrl,
    update
});