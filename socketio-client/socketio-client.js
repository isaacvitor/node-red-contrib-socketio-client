module.exports = function(RED) {
  'use strict';
  //var io = require('socket.io-client');
  var sockets = {};

  /* sckt config */
    function SocketIOConfig(n) {
      RED.nodes.createNode(this, n);
      this.host = n.host;
      this.port = n.port;
    }
    RED.nodes.registerType('socketio-config', SocketIOConfig);

  /* sckt connector*/
    function SocketIOConnector(n){
      RED.nodes.createNode(this, n);
      this.server = RED.nodes.getNode(n.server);
      this.server.namespace = n.namespace;
      this.name = n.name;
      var node = this;

      
      if(sockets[node.id]){ delete sockets[node.id];}
      sockets[node.id] = connect(this.server);
        
      sockets[node.id].on('connect', function(){
        node.send({ payload:{socketId:node.id, status:'connected'} });
        node.status({fill:"green",shape:"dot", text:"connected"});
      });

      sockets[node.id].on('disconnect', function(){
        node.send({payload:{socketId:node.id, status:'disconnected'}});
        node.status({fill:'red',shape:'ring', text:'disconnected'});
      });

      sockets[node.id].on('connect_error', function(err) {
        if (err) {
          node.status({fill:'red',shape:'ring',text:'disconnected'});
          node.send({payload:{socketId:node.id, status:'disconnected'}});
          //node.error(err);
        }
      }); 

      this.on('close', function(done) {
        sockets[node.id].disconnect();
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
      this.eventName = n.eventname;
      this.socketId = null;

      var node = this;

      node.on('input', function(msg){
        node.socketId = msg.payload.socketId;

        sockets[node.socketId].emit(n.name, JSON.parse(n.message || '{}') );

      });
    }
    RED.nodes.registerType('socketio-emitter', SocketIOEmitter);

  function connect(config, force) {
    var uri = config.host;
    var sckt;

    if(config.port != ''){
      uri += ':' +  config.port;
    } 
    if(config.namespace){
      uri += '/' +  config.namespace;
      sckt = require('socket.io-client').connect( uri );
    }else{
      sckt = require('socket.io-client')( uri );
    }
    return sckt;
  }

  function disconnect(config) {
  }
}