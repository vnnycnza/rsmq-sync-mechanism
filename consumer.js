/*
 * consumer.js
 * retrieves messages from broker
 * uses rsmq-worker (https://github.com/mpneuried/rsmq-worker)
 */

const fxn = '[Consumer Web Server]';

const path = require('path');
const _ = require('lodash');
const bodyParser = require('body-parser');

const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const cfg = require('./utils/config');
const Worker = require('./utils/worker');

// Setup listeners for broadcasting messages in queue
const npWorker = new Worker(cfg.queue.np.name, cfg.queue.np.settings);
const jWorker = new Worker(cfg.queue.j.name, cfg.queue.j.settings);
const rsmq = npWorker.rsmq();

const m = io.of('/jobs');

// Listener for job entries
npWorker.worker.on('message', (msg, next) => {
  m.emit('broadcast', msg);
  next();
});

// Listener for taken job entries to delete from list
jWorker.worker.on('message', (msg, next) => {
  m.emit('delete', msg);
  next();
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
 * Get Job Entries
 * GET /entries
 *
 * Retrieves list of job entries
 * @param {object} jobs Array of jobs
 *    @param {string} job.sender Name of sender
 *    @param {string} job.title Job Title
 *    @param {string} job.desc Job Description
 *    @param {string} job.id Job ID
 */

app.get('/entries', (req, res) => {
  console.log(`${fxn} Request ${req.method} ${req.url}`);

  const msgs = [];
  const pWorker = new Worker(cfg.queue.p.name, cfg.queue.p.settings);

  pWorker.size((err, size) => {
    pWorker.start();
    pWorker.worker.on('message', (msg, next, msgid) => {
      msgs.push({ ...JSON.parse(msg), ...{ id: msgid } });

      if (msgs.length !== size) next(false);
      else if (msgs.length === size) {
        pWorker.quit();
        return res.status(200).json({ jobs: _.uniqBy(msgs, 'id') });
      }
    });
  });
});

/*
 * Take Job Entry
 * POST /jobs
 *
 * Deletes job from queues and saves to queue to broadcast
 *
 * @param {object} id job_id of the job
 * @sampleRequest
 */

app.post('/jobs', (req, res) => {
  console.log(`${fxn} Request ${req.method} ${req.url}`);

  if (!req.body || !req.body.id) {
    return res.status(400).json({ error: 'Incomplete Parameters' });
  }

  rsmq.deleteMessage({ qname: cfg.queue.p.name, id: req.body.id }, (err, resp) => {
    if (resp === 1) {
      console.log(`${fxn} Job [${req.body.id}] is taken`);

      rsmq.sendMessage({ qname: cfg.queue.j.name, message: JSON.stringify({ del: req.body.id }) },
        () => res.status(200).json({ id: req.body.id }));
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
  });
});


/*
 * Renders jobs list page
 * GET /jobs
 *
 * Renders /views/consumer.html
 */

app.get('/jobs', (req, res) => {
  return res.sendFile(path.join(__dirname, 'views/consumer.html'));
});

// Start listeners
npWorker.start();
jWorker.start();

// Lift web server
server.listen(cfg.c_port, () => {
  console.log(`${fxn} Server Lifted at localhost:${cfg.c_port}`);
});
