// Author: Aditya | Module: Utils | CRM Platform v1.0

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const logger = {
  info: (message, meta = '') => {
    console.log(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.blue}INFO${colors.reset}  ${message}`,
      meta ? meta : ''
    );
  },

  success: (message, meta = '') => {
    console.log(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.green}OK${colors.reset}    ${message}`,
      meta ? meta : ''
    );
  },

  warn: (message, meta = '') => {
    console.warn(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.yellow}WARN${colors.reset}  ${message}`,
      meta ? meta : ''
    );
  },

  error: (message, error = null) => {
    console.error(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.red}ERROR${colors.reset} ${message}`
    );
    if (error?.stack) {
      console.error(`${colors.gray}${error.stack}${colors.reset}`);
    }
  },

  request: (method, url, statusCode, duration) => {
    const color = statusCode >= 400 ? colors.red : statusCode >= 300 ? colors.yellow : colors.green;
    console.log(
      `${colors.gray}[${getTimestamp()}]${colors.reset} ${colors.cyan}HTTP${colors.reset}  ${method} ${url} ${color}${statusCode}${colors.reset} ${colors.gray}${duration}ms${colors.reset}`
    );
  },
};

export default logger;
