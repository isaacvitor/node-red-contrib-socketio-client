# node-red-contrib-socketio-client
---
## Latest Features
 - Removed Conflicts with node-red-contrib-socketio-extended for server integrations.
 - Added two listener nodes listener in and listener out for use with callback.
 - Colour coded call back nodes.

## Nodes

1. Socket.IO Connector
2. Socket.IO Listener
3. Socket.IO Emitter
4. Socket.IO Emitter with Callback
5. Socket.IO Listener in, for use with callback listener out
6. Socket.IO Listener out, for use with callback listener in

## How to use
Original Listener:

> Socket.IO Connector -> Socket.IO Listener -> Payload

![How to use](https://raw.githubusercontent.com/isaacvitor/generalcontent/master/node-red-contrib-socketio-client/nodered_socketio_ex01.png "How to use")

Listener with callback:

> Socket.IO Connector -> Socket.IO Listener In -> Payload -> Socket.IO Listener Out
![How to use](https://raw.githubusercontent.com/nateainsworth/Git-docs-images/master/node-red-contrib-socketio-client/listener%20with%20callback.png "How to use")

## ToDo

1. Socket.IO Server

**Notice:** This module are in developing so, take care when to use in production.
