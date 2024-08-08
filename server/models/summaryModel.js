const { spawn } = require('child_process');
const sessionId = ''; // 실제 세션 ID로 교체해야 합니다

const pythonProcess = spawn('python', ['./summary.py', sessionId]);

pythonProcess.stdout.on('data', (data) => {
    try {
        const result = JSON.parse(data);
        // if (result.updated) {
        //     console.log('Summary updated:', result.summary);
        // } else {
        //     console.log('No update needed');
        // }
    } catch (error) {
        console.error('Error parsing Python output:', error);
    }
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
});

// pythonProcess.on('close', (code) => {
//     console.log(`Python process exited with code ${code}`);
// });
