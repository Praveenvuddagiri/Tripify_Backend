const { spawn } = require('child_process');

async function runPythonFunction(filePath, functionName, parameter) {
  try {


    // Check if pip is installed
    const checkProcess = spawn('pip', ['--version']);
    const pipInstalled = await new Promise((resolve) => {
      checkProcess.on('close', (code) => {
        resolve(code === 0);
      });
    });

    // Install pip if it is not installed
    if (!pipInstalled) {
      console.log('Installing pip...');
      const installProcess = spawn('yum', ['install', '-y', 'python3-pip']);

      await new Promise((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code !== 0) {
            reject(`Pip install exited with code ${code}`);
          } else {
            resolve();
          }
        });
      });
    }

    // Install required libraries
    const installProcess = spawn('pip', ['install', '-r', 'chatbot/requirements.txt']);

    await new Promise((resolve, reject) => {
      installProcess.on('close', (code) => {
        if (code !== 0) {
          reject(`Pip install exited with code ${code}`);
        } else {
          resolve();
        }
      });
    });
  
    // Run Python function
    const scriptProcess = spawn('python3', [filePath, functionName, parameter]);

    let result = '';

    scriptProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    scriptProcess.stderr.on('data', (error) => {
      console.error(error.toString());
    });

    await new Promise((resolve) => {
      scriptProcess.on('close', () => {
        resolve();
      });
    });

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = runPythonFunction;