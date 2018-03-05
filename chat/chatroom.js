import socketIO from 'socket.io'
const users = {},
	  userlist =[],//connect user list
	  onlineList = [],//login user list
	  rooms = [];

let userCount = 0;
let userId = 0;

export default (args)=>{
	const server = args.server,
		  nsp = args.nsp || '/',
		  timeout = args.timeout || 15000;

	const io = socketIO(server);
	io.engine.generateId = (req) => {
	  return "custom:id:" + userId++; // custom id must be unique
	}
	io.of(nsp).on('connection', (socket)=>{		
		const query = socket.handshake.query;
		let user = {
			id: socket.id,
			socket : socket,
			name: query.userName,
			login: false,
			clientBeat: new ClientBeating( socket )
		};
		users[user.id] = user;
		userlist.push(query.userName);
		socket.send(userlist);//fire when conneted ,client on message 
	
		//login remind
		socket.on('login',(name)=>{
			io.sockets.emit('someLogin', name)
			user.id || (user.login = true )
		})

		//get public msg and broadcast
		socket.on('send',(msg)=>{
			socket.broadcast.emit('msg', msg);			
			user.clientBeat.datain();
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

		//create chatting room
		socket.on('createRoom', (creatRoom)=>{
			if(!rooms[creatRoom.room]){
				rooms[creatRoom.room]= creatRoom.room
			}
			socket.join(creatRoom.room)
			//inviting friends
			creatRoom.friends.forEach((item, index)=>{
				if(typeof users[item] === "object"){
					users[item].emit('invite', creatRoom.room)
				}
			})
		})
		//join room
		socket.on('join',(joinRoom)=>{
			socket.join(joinRoom.room)
			io.to(joinRoom.room).emit('sys', joinRoom.name + '加入了房间');
		})
		//chatting in room
		socket.on('chattingRoom',(msg)=>{
			console.log(msg)
			socket.broadcast.to(msg.room).emit('roomMsg', msg);
		})
		//disconnect 
		socket.on('disconnect',()=>{
			// if (typeof client === "object"){
			// 	delete users[client.name];
			// 	// delete client;
			// }
			// delete users[client.name];
			totalClients()
		})
		totalClients()
	})

	const totalClients = ()=>{
		io.clients((error, clients) => {
	      if (error) throw error;
	      console.log(clients.length);
	      io.sockets.emit('total', clients.length);
	    });
	}

	function ClientBeating(socket) {//心跳测试
		var self = this;
			this.socket = socket;
			this.timeout;

		this.timeoutProc = function timeoutProc() {
			// console.log('timeouted');
			self.socket.emit('DisconnectReq');
		};
		this.datain = function(data) {
			clearTimeout(this.timeout);
			//......... Your processing
			this.timeout = setTimeout(this.timeoutProc, timeout);
		}
		this.timeout = setTimeout(this.timeoutProc, timeout);
	}


}