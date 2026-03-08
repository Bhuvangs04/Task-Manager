import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, '..', 'frontend-log.txt');

// Initialize log file
fs.writeFileSync(LOG_FILE, `=== Frontend Dev Server Started at ${new Date().toISOString()} ===\n\n`);
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

const writeLog = (level, message) => {
  const line = `[${new Date().toISOString()}] [${level}] ${message}\n`;
  logStream.write(line);
};

// Override console to also write to log file
const origLog = console.log;
const origErr = console.error;
const origWarn = console.warn;

console.log = (...args) => {
  writeLog('INFO', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  origLog.apply(console, args);
};
console.error = (...args) => {
  writeLog('ERROR', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  origErr.apply(console, args);
};
console.warn = (...args) => {
  writeLog('WARN', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  origWarn.apply(console, args);
};

// Vite plugin for logging server activity
function fileLoggerPlugin() {
  return {
    name: 'file-logger',
    configureServer(server) {
      writeLog('INFO', 'Vite dev server starting...');

      // Log every incoming request
      server.middlewares.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          writeLog('HTTP', `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
        });
        next();
      });

      // Log HMR events
      server.ws.on('connection', () => {
        writeLog('HMR', 'Client connected via WebSocket');
      });
    },
    buildStart() {
      writeLog('INFO', 'Build started');
    },
    buildEnd() {
      writeLog('INFO', 'Build completed');
    },
    handleHotUpdate({ file }) {
      writeLog('HMR', `File changed: ${file}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), fileLoggerPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
