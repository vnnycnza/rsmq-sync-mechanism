# rsmq-sync-mechanism

Simple app implementation of basic synchronization using message queues. It has two components: producer and consumer.
The producer saves the jobs in the queues. The consumer, as expected, consumes them.

## Tech Stack
- [Node.js v8+] (https://nodejs.org/en/blog/release/v8.12.0/)
- [Redis] (https://redis.io/)
- [Express] (https://expressjs.com/en/4x/api.html)
- [RSMQ] (https://github.com/smrchy/rsmq) 
- [RSMQ Worker] (https://github.com/mpneuried/rsmq-worker)
- [Socket.IO] (https://socket.io/)

## Producer

This script starts a web server that has an endpoint to save job entries to queue.
Added in an endpoint that renders an Add Job Form which calls the aforementioned endpoint on submit.

**POST /entries**

Create and save job entry

Parameters:

* `sender` (String): Name of sender
* `title` (String): Job Title
* `desc` (String): Job Description

Example:
```
POST /entries
Content-Type: application/json

{
  "sender": "Ginny",
  "title": "Unlock the chamber",
  "desc": "Follow instructions from the diary"
}
```
Response:
```
{"status": "OK"}
```

## Consumer

This script starts a web server that listens to the queues for broadcast. 
There are two endpoints available: (1) Get Job Entries which returns the current list of jobs saved, 
and (2) Take Job Entry which deletes a job from the queue.

**GET /entries**

Retrieves list of job entries

Example:
```
GET /entries
Content-Type: application/json
```
Response
```
[{
  "sender": "Harry",
  "title": "Kill Voldemort",
  "desc": "Find all horcruxes",
  "id": "ID-1"
},
{
  "sender": "Ron",
  "title": "Fly and Soar",
  "desc": "Find ways to fly",
  "id": "ID-2"
},
{
  "sender": "Hermione",
  "title": "Leviosa",
  "desc": "Teach Ron how to levitate",
  "id": "ID-3"
}]
```

**POST /jobs**

Deletes job from queues and saves to a message to new queue to broadcast deletion

Example:
```
POST /jobs
Content-Type: application/json
{
	"id": "ID-1" 
}
```
Response
```
{
	"id": "ID-1"
}
```

## Config

Settings are pretty straightforward. To configure, see `utils/config.js`.

## How to run

1. For both `producer.js` and `consumer.js`, make sure to install and use Node v8+.
2. Make sure to have a redis instance running. Apply configuration in `utils/config.js`.
Default host is `locahost` with port `6379`.
3. Run `npm install`
4. Run `node producer.js` to start web server and `node consumer.js` to start workers.
5. Open `http://localhost:3000/` in browser to add jobs.
6. Open `http://localhost:3001/jobs` in browser to consume jobs.

## Solution

For this app, there are 3 queues used to store jobs/messages:

#### app-msg-queue-np
- This queue saves the job entry sent through POST /entries in producer web server. When a client connects to the consumer web server,
it establishes a connection via socket and it starts to listen for jobs sent to this queue. Expected behavior is when a job entry is sent through
the producer, job is saved in this queue and each connected client in consumer web server receives the job.

#### app-msg-queue-p
- This is intended to be the persistent queue. Jobs saved in the previous queue are also saved here. The difference is this queue is intended
to save the jobs as long as it is not yet taken, as compared to the previous queue that jobs are deleted from queue once it is received by connected
consumers. This is created so newly connected clients can still retrieve jobs that are not yet taken.

#### app-msg-queue-j
- When a job is taken, the job is deleted from the persistent queue. In order for connected clients to know that the job has been taken, a message
is saved in this queue. Connected clients listens for jobs sent to this queue upon connecting also via sockets. Expected behavior is when a job is taken, 
message is broadcasted to connected clients and then job will be removed from their view.

## Diagrams

* [Producer - POST /entries](docs/AddJob.png)
* [Consumer - GET /entries](docs/GetJobs.png)
* [Consumer - POST /jobs](docs/TakeJob.png)





