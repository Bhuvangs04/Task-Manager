const fs = require('fs');
const path = require('path');

// Use /tmp on serverless (Vercel) since the main filesystem is read-only
const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const LOG_DIR = isServerless ? '/tmp' : path.join(__dirname, '..', '..');
const LOG_FILE = path.join(LOG_DIR, 'backend-log.txt');

// Create/clear log file on startup (gracefully handle read-only FS)
let loggingEnabled = true;
let logStream = null;

try {
    fs.writeFileSync(LOG_FILE, `=== Backend Server Started at ${new Date().toISOString()} ===\n\n`);
    logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
} catch {
    loggingEnabled = false;
}

// Helper to format log messages with timestamp
const formatLog = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}\n`;
};

// Safe write helper
const writeToLog = (level, message) => {
    if (loggingEnabled && logStream) {
        logStream.write(formatLog(level, message));
    }
};

// A passthrough stream for morgan (writes to file if enabled, otherwise drops)
const morganStream = {
    write: (message) => {
        if (loggingEnabled && logStream) {
            logStream.write(message);
        }
    },
};

// Override console methods to also write to file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    writeToLog('INFO', message);
  originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
  const message = args.map(a => {
    if (a instanceof Error) return `${a.message}\n${a.stack}`;
    return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
  }).join(' ');
    writeToLog('ERROR', message);
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    writeToLog('WARN', message);
  originalConsoleWarn.apply(console, args);
};

console.info = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
    writeToLog('INFO', message);
  originalConsoleInfo.apply(console, args);
};

// Export the morgan-compatible stream for morgan
module.exports = { logStream: morganStream, LOG_FILE };
