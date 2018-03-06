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
		userlist.unshift({name:query.userName, id:user.id});
		socket.send(userlist);//fire when conneted ,client on message 

		//get public msg and broadcast
		socket.on('send',(data, callback)=>{
			data.name = user.name;
			if (data.type == 'login') {//login remind
				console.log(`login user's ${data.txt}`)		
				if(!user.login){
					user.login = true;
					user.name = data.txt;
					data.id = user.id;
					io.sockets.emit('msg', data);
				};

			} else if (data.type == 'public') {
				console.log(`send message ${data.msg}`)
				socket.broadcast.emit('msg', data);

			} else if (data.type  == 'private'){
				data.id = user.id
				console.log('private msg ', data)
				try{
					users[data.recieverId].socket.emit('msg', data)
				}catch(err){
					console.log('用户不存在/已经下线')
					data.txt = '用户不存在/已经下线';
					data.name = ''
					socket.emit('msg', data)
				};
			};

			try{
				callback( data )
			}catch(err){
				console.log(err)
			};
		});

		//disconnect 
		socket.on('disconnect',()=>{
			if (users[user.id]){
				console.log('delete a user')
				delete users[user.id];
			};
			userlist.forEach((item, index)=>{
				if(item.id == socket.id){
					delete userlist[index];
					userlist.splice(index,1);
					return;
				};
			});
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