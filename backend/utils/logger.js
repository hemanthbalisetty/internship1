const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/system.log');

const log = (message) => {
  const timestamp = new Date().toISOString();
  const fullMessage = `[${timestamp}] ${message}\n`;

  fs.appendFileSync(logFilePath, fullMessage);
  console.log(fullMessage);
};

module.exports = log;