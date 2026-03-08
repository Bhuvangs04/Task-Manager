const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', 'backend-log.txt');

// Create/clear log file on startup
fs.writeFileSync(LOG_FILE, `=== Backend Server Started at ${new Date().toISOString()} ===\n\n`);

// Create a write stream for appending
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Helper to format log messages with timestamp
const formatLog = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}\n`;
};

// Override console methods to also write to file
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  logStream.write(formatLog('INFO', message));
  originalConsoleLog.apply(console, args);
};

console.error = (...args) => {
  const message = args.map(a => {
    if (a instanceof Error) return `${a.message}\n${a.stack}`;
    return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
  }).join(' ');
  logStream.write(formatLog('ERROR', message));
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  logStream.write(formatLog('WARN', message));
  originalConsoleWarn.apply(console, args);
};

console.info = (...args) => {
  const message = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))).join(' ');
  logStream.write(formatLog('INFO', message));
  originalConsoleInfo.apply(console, args);
};

// Export the stream for morgan
module.exports = { logStream, LOG_FILE };
