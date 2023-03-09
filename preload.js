const { contextBridge, ipcMain, ipcRenderer } = require("electron");
let dataUrl = (data, qualityLabel) => {
    ipcRenderer.send("url", data, qualityLabel);
}

let update = (callback) => {
    ipcRenderer.on("update", callback)
}


contextBridge.exposeInMainWorld("Bridge", {
    dataUrl,
    update,

});