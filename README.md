# Israel queue implementation Server

### Introduction
The Israeli queue data structure is based on grouping and prioritizing items based on "friendship". Here's how it works.

Defining simple priority queues the idea behind priority queues is quite simple: you have a set of items/tasks that need to be completed, and you can pull one item at a time. When you insert elements into a priority queue, you assign a priority to each element. When retrieving these elements (removing them from the queue), the element with the highest priority at that time will be removed from the queue. Here's an example of a first-in, first-out (FIFO) queue (time-in priority).

This is a simple idea of priority queues, which we will try to improve with the help of Israeli queues.

Grouping -
Let's introduce a new concept - friendship between elements in the queue. Objects can be friends if they are somehow connected and if it makes sense to do them together.

Imagine that you need to organize your order delivery business so that at the time of dispatch, several machines group orders according to a certain criterion, for example, by address and size of the order, or orders that are about to spoil, etc.

1) Groups. Instead of containing only elements, the queue will contain groups of elements. Groups can contain one or more elements, but cannot be empty. They may be organized in order (by priority) or not. The group will contain only those queue elements that are related by a certain criterion (they are friends).

2) Queuing. When we queue a new element, we iterate through all the groups in the queue. If the element being added to the queue is friends with an element in any group (friendship is a transitive relationship, so if it is friends with one, it is friends with everyone), the element will be added to the group and its priority will change, be added to the group's priority (the priority of a group is equal to the sum of its members).

### Features
Publish/Subscribe IQ:
<br />We are keeping using rabbitMQ as a communication for notifications, and to fetch the message we will use the http queries.
<br />Subscriber sends a request to register himself, the request contains IQ-queue and subscriber’s queue name to receive notification(see 2.2).  
<br />Subscriber listens on the rabbit message queue to receive the notification.
<br />The notification says that there is a new group, but does not itself contain any information about it.
<br />Subscriber uses the /popup to get all messages in the waiting group.
<br />1.1 GET /iq/v1/api/queues - will return all queues in the system.
<br />1.2 GET /iq/v1/api/queues/{queue name} - will return all groups of the target queue(routing key).
<br />1.3 GET /iq/v1/api/queues/{queue name}/popup - will return all messages in the first waiting group, the group will delete permanently. (Тhis is the only one API that the client will use)
Additional parameters will be defined where the client will indicate to delete messages at himself(see 1.6) or the server will do it by ttl(Instead of ack in current implementation).
<br />1.4 GET /iq/v1/api/groups/{group key} - will return all message keys in the group.
<br />1.5 GET /iq/v1/api/messages/{message key} - will return the message body.
<br />1.6 DELETE /iq/v1/api/messages/{message key} - will delete the message from the system.
<br />1.7 POST /iq/v1/api/queues/{queue name}/addMessage - body contains a message, the server will insert a message, and add it to the created/exited group.
<br />1.8 DELETE /iq/v1/api/groups/{group key} - will delete the group and messages in this group permanently.
<br />1.9 DELETE /iq/v1/api/queues/{queue name} - will delete the queue, also all groups in this queue.
<br />1.10 POST /iq/v1/api/queues/{queue name}/subscribe - subscribe to the messages, include target IQ name, subscriber’s queue. Response contains TTL.

### Installation 📦
add env file to root of project: ".env.local"
<br />NODE_ENV="trace"
<br />HOST="0.0.0.0"
<br />PORT="8180"
<br />RABBIT_USER="guest"
<br />RABBIT_PASSW="guest"
<br />RABBIT_HOST="localhost"
<br />RABBIT_QUEUENAME="IQ_SERVER"
<br />RABBIT_ISDURABLE=true
<br />RABBIT_ISNOACK=false
<br />RABBIT_PREFETCH=1
<br />REDIS_USER=""
<br />REDIS_PASSW="*****"
<br />REDIS_HOST="localhost"
<br />REDIS_PORT=6379
<br />ALL_DATA_TTL=3600
<br />SUBSCRIBER_TTL_SEC=30
<br />LOG_TRANSPORT="Console"
<br />DEBUG_LEVEL="debug"
<br />MAX_LOG_LENGTH=16048

### Start App
npm run start

### IQ SERVER APIs, DESIGN SPECIFICATION
_Design Goals_<br />
We have a lot of messages passing through the rabbit message-bass, for each event in our system could generate more than 100 any of kinds messages.
The relation between the messages on the queue makes sense for them to be performed together.
In this case, we are required to group the messages if possible, it means that a message that arrived at last could be prioritized and grouped with others that arrived early.

This document specified architecture and software design approach for IQ server, where it will describe the APIs for monitoring and managing via the web UI.
Also will expose the client/server api implementation.


Specification<br />
There are number major things of this approach:
Group: Instead of just containing messages, the queue will contain groups of messages. Groups may have one or more messages in them, but cannot be empty. They will be organized in order of group key.

Group key: this combination of primary key(event id), routing key(target queue) and action type(see 5) of message. Probably it can be defined by configuration settings, what the fields in the message act for creating group keys.
Example: id:123456:queue:master:action:call

Enqueueing: When enqueueing a new message, we’ll iterate over all the groups in the queue. If the item being inserted to the queue is related to an item in a particular group, the message will be added to this group.

Dequeuing: When dequeuing the group, we dequeue all messages in this group and will delete the group immediately, at the same time we will support the reliable mechanism to provide the message states.
Action: The message type is a mandatory field, where it should be the unique name of all systems.

Group priority: the predefined function, for example: when an item will be added to the group and its priority will be calculated as the sum of its members. In other words, a group with the biggest number of messages will get high priority(not at the first release).

#### reference npms:
[iqlib](https://www.npmjs.com/package/@asmtechno/iqlib)
<br />[service-lib](https://www.npmjs.com/package/@asmtechno/service-lib)

#### reference Github:
[israel-queue-server](https://github.com/stas7341/israel-queue-server)
<br />[service-lib](https://github.com/stas7341/service-lib)


