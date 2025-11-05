let ffmpeg;
let ffmpegReady = false;

async function initFFmpeg() {
    if (ffmpegReady) return;

    try {
        const FFmpegModule = await import('https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/esm/ffmpeg.js');
        const { FFmpeg: FFmpegClass, fetchFile } = FFmpegModule;
        ffmpeg = new FFmpegClass();

        ffmpeg.on('log', ({ type, message }) => {
            console.log(`[FFmpeg ${type}]`, message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            window.parent.postMessage({
                type: 'ffmpeg-progress',
                progress: progress
            }, '*');
        });

        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/esm';
        await ffmpeg.load({
            coreURL: await FFmpegClass.toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await FFmpegClass.toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        ffmpegReady = true;
        console.log('FFmpeg initialized successfully');
    } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
    }
}

async function convertVideo(inputData, inputName, outputName = 'output.mp4') {
    try {
        if (!ffmpegReady) {
            await initFFmpeg();
        }

        await ffmpeg.writeFile(inputName, inputData);

        await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', outputName]);

        const outputData = await ffmpeg.readFile(outputName);

        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);

        return new Blob([outputData.buffer], { type: 'video/mp4' });
    } catch (error) {
        console.error('Conversion error:', error);
        throw error;
    }
}

window.FFmpegWorker = {
    initFFmpeg,
    convertVideo
};