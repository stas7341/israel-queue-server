<p align="center">
<h2>Israel queue implementation library</h2>
</p>

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

### Installation 📦
add env file to root of project: ".env.local"

NODE_ENV="trace"
HOST="0.0.0.0"
PORT="8180"

RABBIT_USER="guest"
RABBIT_PASSW="guest"
RABBIT_HOST="localhost"
RABBIT_QUEUENAME="IQ_SERVER"
RABBIT_ISDURABLE=true
RABBIT_ISNOACK=false
RABBIT_PREFETCH=1

REDIS_USER=""
REDIS_PASSW="r3d1s!"
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PUBLISHER=false
ALL_DATA_TTL=3600
REDIS_EVENT_NOTIFICATION=false
SUBSCRIBER_TTL_SEC=30

LOG_TRANSPORT="Console"
DEBUG_LEVEL="debug"
MAX_LOG_LENGTH=16048

### Start App
npm run start/start-ts
