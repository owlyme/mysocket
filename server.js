const express = require('express')
const socket = require('socket.io')
const app = express()

const server = app.listen(4000,() =>{
	console.log('listening on port 4000')
})

app.use(express.static('public'))

const io = socket(server)
const users = {},
	  list =[];

const totalClients = ()=>{
	io.clients((error, clients) => {
      if (error) throw error;
      console.log(clients.length)
      io.sockets.emit('total', clients.length)
    });
}

function ClientBeating( name ) {//心跳测试
	var self = this;
		this.name = name;
		this.socket = users[name];
		this.timeout;

	this.timeoutProc = function timeoutProc() {
		// console.log('timeouted');
		self.socket.emit('DisconnectReq');
	};
	this.datain = function(data) {
		clearTimeout(this.timeout);
		//......... Your processing
		this.timeout = setTimeout(this.timeoutProc, 150000000);
	}
	this.timeout = setTimeout(this.timeoutProc, 150000000);
}

io.on('connection', (socket)=>{
	let client ;
	//first time loaded
	socket.on('loaded',(loaded)=>{
		socket.emit('loaded',list)
	})
	
	//login remind
	socket.on('login',(name)=>{
		// console.log(name)
		io.sockets.emit('someLogin', name)
		//save login client
		if( !(name in users) ){
			users[name]= socket;
			client = new ClientBeating( name );
			list.push(name)
		}
	})
	//get public msg and broadcast
	socket.on('msg',(msg)=>{
		socket.broadcast.emit('msg', msg);
		if (typeof client === "object"){
			client.datain();
		}
	})
	//private chat
	socket.on('privateMsg', (privateMsg)=>{
		//who send this msg
		//who recieve this msg
		//conents of msg
		if(typeof users[privateMsg.reciever] === "object" ){
			users[privateMsg.reciever].emit('privateMsg',privateMsg)
		}		
	})

	//disconnect 
	socket.on('disconnect',()=>{
		if (typeof client === "object"){
			delete users[client.name]
			delete client
		}
		totalClients()
	})

	totalClients()

})


