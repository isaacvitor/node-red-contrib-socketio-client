module.exports = function(RED) {
  'use strict';
  //var io = require('socket.io-client');
  var sockets = {};

  /* sckt config */
    function SocketIOConfig(n) {
      RED.nodes.createNode(this, n);
      this.host = n.host;
      this.port = n.port;
      this.path = n.path;
      this.reconnection = n.reconnection;
    }
    RED.nodes.registerType('socketio-config', SocketIOConfig);

  /* sckt connector*/
    function SocketIOConnector(n){
      RED.nodes.createNode(this, n);
      this.server = RED.nodes.getNode(n.server);
      this.server.namespace = n.namespace;
      this.name = n.name;
      this.sockets = sockets;
      var node = this;
      
      if(sockets[this.name]){ delete sockets[this.name];}
      sockets[this.name] = connect(this.server);
        
      sockets[this.name].on('connect', function(){
        node.send({ payload:{socketId:this.name, status:'connected'} });
        node.status({fill:"green",shape:"dot", text:"connected"});
      });

      sockets[this.name].on('disconnect', function(){
        node.send({payload:{socketId:this.name, status:'disconnected'}});
        node.status({fill:'red',shape:'ring', text:'disconnected'});
      });

      sockets[this.name].on('connect_error', function(err) {
        if (err) {
          node.status({fill:'red',shape:'ring',text:'disconnected'});
          node.send({payload:{socketId:this.name, status:'disconnected'}});
          //node.error(err);
        }
      }); 

      this.on('close', function(done) {
        sockets[this.name].disconnect();
        node.status({});
        done();
      }); 
    }
    RED.nodes.registerType('socketio-connector', SocketIOConnector);

  /* sckt listener*/
    function SocketIOListener(n){
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.eventName = n.eventname;
      this.socketId = null;

      var node = this;

      node.on('input', function(msg){
        node.socketId = msg.payload.socketId;
        if(msg.payload.status == 'connected'){
          node.status({fill:'green',shape:'dot',text:'listening'});
          if( !sockets[node.socketId].hasListeners(node.eventName) ){
            sockets[node.socketId].on(node.eventName, function(data){
              node.send( {payload:data} );
            });
          }
        }else{
          node.status({fill:'red',shape:'ring',text:'disconnected'});
          if( sockets[node.socketId].hasListeners(node.eventName) ){
            sockets[node.socketId].removeListener(node.eventName, function(){});
          }
        }
      });

      node.on('close', function(done) {
        
        if( sockets[node.socketId].hasListeners(node.eventName) ){
          sockets[node.socketId].removeListener(node.eventName, function(){
            node.status({});
            done();
          });
        }else{
          node.status({});
          done();
        }
            
      }); 
    }
    RED.nodes.registerType('socketio-listener', SocketIOListener);

  /* sckt emitter*/
    function SocketIOEmitter(n){
      RED.nodes.createNode(this, n);
      this.name = n.name;
      this.socketId = null;

      var node = this;

      node.on('input', function(msg){
        if (!msg.connectionName) {
          throw 'msg.connectionName undefined! Please place connectionName to msg object';
        }
        if (!msg.eventName) {
          throw 'msg.eventName undefined! Please place eventName to msg object';
        }
        sockets[msg.connectionName].emit(msg.eventName, n.payload);
      });
    }
    RED.nodes.registerType('socketio-emitter', SocketIOEmitter);

  function connect(config, force) {
    var uri = config.host;
    var sckt;
    var options = {
      reconnection: config.reconnection
    };

    if(config.port != ''){
      uri += ':' +  config.port;
    }
    if(config.path != ''){
      options.path = config.path;
    }
    if(config.namespace){
      uri += '/' +  config.namespace;
      sckt = require('socket.io-client').connect( uri, options );
    }else{
      sckt = require('socket.io-client')( uri, options );
    }
    return sckt;
  }

  function disconnect(config) {
  }
}
