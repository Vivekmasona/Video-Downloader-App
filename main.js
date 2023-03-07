const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const hbjs = require('handbrake-js');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        contextIsolation: true,
        nodeIntegration: false,
        webPreferences: {
            contentSecurityPolicy: "default-src 'self'",
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('url', async(event, data) => {
    console.log(data);
    const videoUrl = `${data}`;
    const videoInfo = await ytdl.getInfo(videoUrl);
    console.log(videoInfo);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highest' });
    console.log("2222", videoFormat);
    const videoStream = ytdl(videoUrl, { format: videoFormat });
    console.log("1111", videoStream);
    const outputStream = fs.createWriteStream('my-video.mp4');
    videoStream.pipe(outputStream);

    outputStream.on('finish', () => {
        console.log('Video downloaded successfully.');
    });

});