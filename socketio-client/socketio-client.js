module.exports = function(RED) {
  'use strict';
  var io = require('socket.io');

  /* sckt config */
  function SocketIOConfig(config) {
    RED.nodes.createNode(this, config);
    this.host = config.host;
    this.port = config.port;
  }
  RED.nodes.registerType('socketio-config', SocketIOConfig);

  /* sckt connector*/
  function SocketIOConnector(config){
    RED.nodes.createNode(this, config);
    this.server = RED.nodes.getNode(config.server);
    this.name = config.name;
    this.event = config.event;
    this.sto = null;
    this.connections = [];
    var node = this;

    this.client = connect(this.server);

    node.status({fill:"green",shape:"dot",text:"connected"});

    node.on('input', function(msg) {
      msg.payload = this.client;
      node.send(msg);
    });

    node.on('close', function(done) {
      node.status({});
      disconnect(node.server);
      done();
    });

    node.client.on('error', function(err) {
      if (err) {
        clearInterval(node.sto);
        node.error(err);
      }
    });  
  }
  RED.nodes.registerType('socketio-connector', SocketIOConnector);


  function connect(config, force) {
    var uri = config.host;
    if(config.port != ''){
      uri += ':' +  config.port;
    }else if(config.namespace != ''){
      uri += ':' +  config.namespace;
    }

    console.log(uri)
    var sckt = io.connect( uri );//io( uri );

    sckt.on('connect_error', function(err) {
      console.log('[socket.io]', err);
    });
    return sckt;
  }

  function disconnect(config) {
      /*var idx = config.pass + '@' + config.host + ':' + config.port + '/' + config.dbase;
      if (usingConn[idx] !== undefined) {
          usingConn[idx]--;

      }
      if (usingConn[idx] <= 0) {
          connection[idx].end();
      }*/
  }
}