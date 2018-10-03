/*
 * producer.js
 * web server that sends message to broker
 */

const fxn = '[Producer Web Server]';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const cfg = require('./utils/config');
const Worker = require('./utils/worker');

// Create two queues
const pWorker = new Worker(cfg.queue.p.name, cfg.queue.p.settings);
const npWorker = new Worker(cfg.queue.np.name, cfg.queue.np.settings);

// Create web server & middlewares
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Add Job Entry
 * POST /entries
 *
 * Create job entry and saves in message queue
 *
 * @param {string} sender Name of sender
 * @param {string} title Job Title
 * @param {string} desc Job Description
 *
 */

app.post('/entries', (req, res) => {
  console.log(`${fxn} Request ${req.method} ${req.url}`);

  if (!req.body || !req.body.sender || !req.body.title || !req.body.desc) {
    return res.status(400).json({ error: 'Incomplete Parameters' });
  }

  const toSend = {
    sender: req.body.sender,
    title: req.body.title,
    desc: req.body.desc,
    name: 'app',
  };

  console.log(`${fxn} Send message to queue`);

  pWorker.send(JSON.stringify(toSend), (pErr, msgId) => {
    if (pErr) console.log(`${fxn} Error in saving to queue: ${cfg.queue.p.name}`);
    toSend.id = msgId;

    npWorker.send(JSON.stringify(toSend), (npErr) => {
      if (npErr) console.log(`${fxn} Error in saving to queue: ${cfg.queue.np.name}`);
      return res.json({ status: 'OK' });
    });
  });
});

/*
 * Extra: Add Job Entry Form
 * GET /
 *
 * Renders form to add job entries (views/producer.html)
 */

app.get('/', (req, res) => {
  console.log(`${fxn} Request ${req.method} ${req.url}`);
  return res.sendFile(path.join(__dirname, 'views/producer.html'));
});

// Lift web server
app.listen(cfg.p_port, () => {
  console.log(`${fxn} Server Lifted at localhost:${cfg.p_port}`);
});
