/*
 * worker.js
 * creates the worker for message queue
 * uses rsmq-worker (https://github.com/mpneuried/rsmq-worker)
 */

const RSMQWorker = require('rsmq-worker');
const EventEmitter = require('events').EventEmitter;

class Worker extends EventEmitter {
  constructor(queue, options) {
    super();
    this.queue = queue;
    this.worker = new RSMQWorker(queue, options);

    let w = this.worker;
    w.on('error', (err, msg) => {
      console.log(`${this.queue} Error : ${msg.id} : ${err}`);
    });

    w.on('exceeded', (msg) => {
      console.log(`${this.queue} Exceeded : ${msg}`);
    });

    w.on('timeout', (err) => {
      console.log(`${this.queue} Timeout`);
    });
  }

  rsmq() {
    return this.worker._getRsmq();
  }

  send(message, cb) {
    return this.worker.send(message, cb);
  }

  start() {
    return this.worker.start();
  }

  quit() {
    return this.worker.quit();
  }

  delete(messageId) {
    return this.worker.delete(messageId);
  }

  size(cb) {
    return this.worker.size(cb);
  }

};

module.exports = Worker;