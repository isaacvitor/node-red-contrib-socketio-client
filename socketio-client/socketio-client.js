module.exports = function(RED) {
  'use strict';
  var io = require('socket.io-client');

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
      this.events = config.events;
      this.sto = null;
      var node = this;

      this.socket = connect(this.server);

      this.socket.on('connect', function(){
        /*var connections = [];
        for(var i=0;i < config.outputs; i++){
          connections.push({payload:node.socket});
        }
        node.send(connections);*/
        node.send({ payload:{connection:node.socket, status:'connected'} });

        node.status({fill:"green",shape:"dot",text:"connected"});
      });

      this.socket.on('disconnect', function(){
        //node.socket = null;
        node.send({payload:{connection:null, status:'disconnected'}});
        node.status({fill:"red",shape:"dot",text:"disconnected"});
      });

      node.on('close', function(done) {
        node.status({});
        node.send({payload:{connection:null, status:'disconnected'}});
        node.socket = null;
        disconnect(node.server);
        done();
      });

      this.socket.on('connect_error', function(err) {
        if (err) {
          node.send({payload:{connection:null, status:'disconnected'}});
          clearInterval(node.sto);
          node.error(err);
        }
      });  
    }
    RED.nodes.registerType('socketio-connector', SocketIOConnector);

  /* sckt listener*/
    function SocketIOListener(config){
      RED.nodes.createNode(this, config);
      this.server = RED.nodes.getNode(config.server);
      this.name = config.name;
      this.eventName = config.eventname;
      this.sto = null;
      this.connection = null;
      var node = this;


      node.on('input', function(msg) {
        var pl = msg.payload;
        //node.connection = null;
        if(pl.connection){
          node.connection = pl.connection; 
          console.log(node.name, node.eventName, node.connection.connected);
          
          node.connection.on('connect', function(){
            node.status({fill:"green",shape:"dot",text:"connected"});
          });

          node.connection.on('disconnect', function(){
            node.status({fill:"red",shape:"dot",text:"disconnected"});
          });
          console.log('hasListener', node.connection.hasListeners(node.eventName));
          if(!node.connection.hasListeners(node.eventName)){
            node.connection.on(node.eventName, function(data){
              console.log('event', node.name, node.eventName, JSON.stringify(data) );
              node.send({payload: data});
            });
          }

        }else{
          console.log('', pl)
          if(!node.connection.hasListeners(node.eventName)){
            node.connection.removeListener(node.eventName, function(){
              node.send({payload: null });
            });
          }
          node.connection = null;
        }
      });
    }
    RED.nodes.registerType('socketio-listener', SocketIOListener);

  function connect(config, force) {
    var uri = config.host;
    if(config.port != ''){
      uri += ':' +  config.port;
    }else if(config.namespace != ''){
      uri += ':' +  config.namespace;
    }
    var sckt = io( uri );

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