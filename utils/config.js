module.exports = {
  p_port: process.env.port || 3000,
  c_port: process.env.port || 3001,
  queue: {
    p: {
      name: 'app-msg-queue-p',
      settings: {
        timeout: 0,
        interval: 0.5,
        host: 'localhost',
        port: 6379,
        invisibletime: 0,
        customExceedCheck: (msg) => {
          var msg = (msg.message) ? JSON.parse(msg.message) : null;
          if (msg.name === 'app') return true;
          return false;
        }
      }
    },
    np: {
      name: 'app-msg-queue-np',
      settings: {
        timeout: 10000,
        interval: 0.5,
        invisibletime: 10,
        host: 'localhost',
        port: 6379
      }
    },
    j: {
      name: 'app-msg-queue-jobs',
      settings: {
        timeout: 10000,
        interval: 0.5,
        invisibletime: 10,
        host: 'localhost',
        port: 6379
      }
    }
  }
};
