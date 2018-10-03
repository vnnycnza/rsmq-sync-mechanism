# rsmq-sync-mechanism

Simple app implementation of basic synchronization using message queues. It has two components: producer and consumer.
The producer saves the jobs in the queues. The consumer, as expected, consumes them.

## Tech Stack
- Node.js v8+
- Redis
- Express
- RSMQ (Redis Simple Message Queue)
- Socket.IO

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
	"sender": "Vanny Conoza",
	"title": "Finish coding test",
	"desc": "Submit a working test app"
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
```
Response
[{
	"sender": "Harry",
	"title": "Finish coding test",
	"desc": "Submit a working test app",
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
```
Response
{
	"id": "ID-1"
}
```

## Config

Settings are pretty straightforward. To configure, see utils/config.js.

## How to run

1. For both `producer.js` and `consumer.js`, make sure to install and use Node v8+.
2. Make sure to have a redis instance running. Apply configuration in `utils/config.js`
3. Run `npm install`
4. Run `node producer.js` to start web server and `node consumer.js` to start workers.
5. Open `http://localhost:3000/` in browser to add jobs.
6. Open `http://localhost:3001/jobs` in browser to consume jobs.


## Diagrams

* [Producer - POST /entries](docs/AddJob.png)
* [Consumer - GET /entries](docs/GetJobs.png)
* [Consumer - POST /jobs](docs/TakeJob.png)





