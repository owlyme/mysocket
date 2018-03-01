
var CUSTOMER_INFO={
	name: '',
	id: '',
	friends: [],
	privateFriend: '',
	privateChatContent: {},
	creatRoom: '',
	invitedFriend:[]
}

//建立socket 连接
var socket = io();
CUSTOMER_INFO.id = socket.id;

//登陆
var _name = document.querySelector('#name')
var loginBtn = document.querySelector('#login')
loginBtn.addEventListener('click',()=>{
	socket.emit('login',_name.value)
	CUSTOMER_INFO.name = _name.value
})

socket.on('beating',()=>{
	console.log('beating')
	socket.emit('beating')
})
//公共聊天室
var publicChatBox = document.querySelector('#public-chat'),
	publicMsg = document.querySelector('#message'),
	sendPublic = document.querySelector('#send'),
	userList = document.querySelector('#userList');

	//发送消息
	sendPublic.addEventListener('click',()=>{
		socket.emit('msg', {
			name: CUSTOMER_INFO.name,
			msg : publicMsg.value
		})
		publicChatBox.innerHTML += '<p><strong>'+CUSTOMER_INFO.name+': </strong>'+ publicMsg.value+'</p>';
		publicMsg.value = ''
	})

	//所有人上线提醒
	socket.on('someLogin',(name)=>{
		publicChatBox.innerHTML += '<p>'+name+'登录了</p>';
		userList.innerHTML += '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>';
		CUSTOMER_INFO.friends.unshift(name)
	});
	//收到消息
	socket.on('msg',(data)=>{
		publicChatBox.innerHTML += '<p><strong>'+data.name+': </strong>'+ data.msg+'</p>';
	})

//私聊聊天
var privateChatBox = $('#private-chat-box'),
	privateChat = $('#private-chat'),
	privateMsg = $('#privatemessage'),
	sendPrivate = $('#privatesend'),
	privateTitle = $('#private-title');
sendPrivate.on('click',()=>{
	socket.emit('privateMsg',{
						sender: CUSTOMER_INFO.name,
						reciever: CUSTOMER_INFO.privateFriend,
						msg:privateMsg.val()})

	$('#private-chat').append('<p><strong>'+CUSTOMER_INFO.name+': </strong>'+ privateMsg.val()+'</p>');
	privateMsg.val('')
});
socket.on('privateMsg',(privateMsg)=>{
	getPrivateChatContent()
	CUSTOMER_INFO.privateFriend = privateMsg.sender
	privateChatBox.fadeIn()
	changePrivateTitle()
	setPrivateChatContent()

	let str = '<p><strong>'+privateMsg.sender+': </strong>'+privateMsg.msg+'</p>';
	$('#private-chat').append(str)
});
socket.on('DisconnectReq', function() {	socket.disconnect(); })

//连接上去之后加载相关信息
socket.emit('loaded','loaded')
socket.on('loaded',(list)=>{
	$.each(list, function(index, name){
		userList.innerHTML += '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>';
	})
})

function getFriendName(event){
	getPrivateChatContent()
	CUSTOMER_INFO.privateFriend = event.target.innerText;
	openPrivateBox()
	changePrivateTitle()
	setPrivateChatContent()
}
function openPrivateBox(){
	if( CUSTOMER_INFO.privateFriend !== CUSTOMER_INFO.name ){
		privateChatBox.fadeIn()
		if( CUSTOMER_INFO.privateFriend in CUSTOMER_INFO.privateChatContent ){
			$('#private-chat').html = CUSTOMER_INFO.privateChatContent[CUSTOMER_INFO.privateFriend]
		}
	}
}

function changePrivateTitle(){
	privateTitle.text('与好友'+ CUSTOMER_INFO.privateFriend+ '聊天中...');	
}

function getPrivateChatContent(){
	CUSTOMER_INFO.privateChatContent[CUSTOMER_INFO.privateFriend] = $('#private-chat').html();	
	$('#private-chat').html('')
}
function setPrivateChatContent(){
	$('#private-chat').html( CUSTOMER_INFO.privateChatContent[CUSTOMER_INFO.privateFriend] );
}

function selectRoomFriend(event){
	var name = event.target.value
	
	var index = CUSTOMER_INFO.invitedFriend.indexOf(name);
    if (index !== -1) {
    	CUSTOMER_INFO.invitedFriend.splice(index, 1);
    }else{
    	CUSTOMER_INFO.invitedFriend.push(name)
    }
}

$('#invite').on('click',function(){
	socket.emit("createRoom",{
		room : 'first',
		friends: CUSTOMER_INFO.invitedFriend,
		me: CUSTOMER_INFO.name
	})
})
socket.on('invite',function(room){
	console.log(room);
	socket.emit("join",{room: room,
						name: CUSTOMER_INFO.name})
})
socket.on('roomMsg',(data)=>{
	publicChatBox.innerHTML += '<p><strong>'+data.name+': </strong>'+ data.msg+'</p>';
})
socket.on('sys',function(data){
	console.log(data);
	socket.emit('chattingRoom',
		{room : 'first',
		 name: CUSTOMER_INFO.name,
		 msg: 'hi'}
	)
})


var socket1 = null
$("#join").on('click',function(){
	if(socket1) delete socket1;
	socket1 = io('/owlyme');
	socket1.emit('nsp',CUSTOMER_INFO.name)
	socket1.on('nsp',function(data){
		$('#namespace').append( data )
	})	
})

