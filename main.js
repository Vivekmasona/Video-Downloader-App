const { app, BrowserWindow, ipcMain } = require('electron');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');


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
ipcMain.on('url', async(event, data, qualityLabel) => {
    const videoInfo = await ytdl.getInfo(data);
    const videoTitle = videoInfo.videoDetails.title;
    const videoUrl = data;
    console.log(videoUrl);
    console.log(qualityLabel);

    // get available video formats
    const videoFormats = ytdl.filterFormats(videoInfo.formats, 'videoonly');

    // get highest quality video format
    const videoFormat = videoFormats.find((f) => f.qualityLabel === qualityLabel);
    // console.log(videoFormat);

    if (!videoFormat) {
        console.log(`No video format found with quality label ${qualityLabel}`);
        return;
    }

    // get available audio formats
    const audioFormats = ytdl.filterFormats(videoInfo.formats, 'audioonly');

    // get highest quality audio format
    const audioFormat = audioFormats[0];
    // console.log(audioFormat);

    if (!audioFormat) {
        // console.log('No audio format found');
        return;
    }

    const videoOutputPath = path.join(__dirname, `${videoTitle}.mp4`);
    const audioOutputPath = path.join(__dirname, `${videoTitle}.mp3`);
    const mergedOutputPath = path.join(__dirname, `${videoTitle}_merged.mp4`);
    console.log(videoOutputPath);

    // download video and audio separately
    const videoStream = ytdl(videoUrl, {
        format: videoFormat,
    });
    console.log(videoStream);
    const audioStream = ytdl(videoUrl, {
        format: audioFormat,
    });
    // console.log(audioStream);

    const videoOutput = fs.createWriteStream(videoOutputPath);
    console.log(videoOutput);
    const audioOutput = fs.createWriteStream(audioOutputPath);
    // console.log(audioOutput + 'audioOutput');

    videoStream.pipe(videoOutput);
    // audioStream.pipe(audioOutput);

    videoOutput.on('finish', () => {
        console.log('Video output finished successfully.');

        audioOutput.on('finish', () => {
            console.log('Audio output finished successfully.');

            const ffmpegProcess = spawn(ffmpeg, [
                '-i', videoOutputPath,
                '-i', audioOutputPath,
                '-c:v', 'copy',
                '-c:a', 'aac',
                '-strict', 'experimental',
                '-map', '0:v:0',
                '-map', '1:a:0',
                mergedOutputPath,
            ]);
            console.log(ffmpegProcess);

            ffmpegProcess.on('exit', () => {
                console.log('FFmpeg process exited successfully.');
                console.log('Merging finished!');
            });

            ffmpegProcess.on('error', (err) => {
                console.error(`FFmpeg process error: ${err}`);
            });
        });
    })
})