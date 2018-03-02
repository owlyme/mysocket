//客户端用户信息
var CUSTOMER_INFO={
	name: '',
	id: '',
	friends: [],
	privateFriend: '',
	privateChatContent: {},
	creatRoom: '',
	joinedRoom: '',
	invitedFriend: [],
	totalClients: 0
};

//建立socket 连接
var socket = io();
CUSTOMER_INFO.id = socket.id;
//在线人数
var totalClients = $('#total-clients');
socket.on('total',function(data){
	totalClients.text(data)
	CUSTOMER_INFO.totalClients = data
})
//心跳触发
	socket.on('DisconnectReq', function() {	socket.disconnect(); })

//连接上去之后加载相关信息
	socket.emit('loaded','loaded')
	socket.on('loaded',(list)=>{
		$.each(list, function(index, name){
			userList.append( '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>');
		})
	})
//登陆
var _name = $('#name'),
	loginBtn = $('#login');
loginBtn.on('click',()=>{
	socket.emit('login',_name.val())
	CUSTOMER_INFO.name = _name.val()
})
enterKeyEvent(_name,function(){ 
	socket.emit('login',_name.val());
	CUSTOMER_INFO.name = _name.val() })

//公共聊天室-------------------------------------------------------------------
var publicChatBox = $('#public-chat'),
	publicMsg = $('#message'),
	sendPublic = $('#send'),
	userList = $('#userList');

	//发送公聊消息的方法
	var publicChatting = function (){
			socket.emit('msg', {
				name: CUSTOMER_INFO.name,
				msg : publicMsg.val()
			})
			publicChatBox.append('<p><strong>'+CUSTOMER_INFO.name+':</strong>'+ publicMsg.val()+'</p>');
			publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
			publicMsg.val('')
		}
	//发送公聊消息
	sendPublic.on('click',publicChatting)
	enterKeyEvent(publicMsg, publicChatting)
	//收到公聊消息
	socket.on('msg',(data)=>{
		publicChatBox.append('<p><strong>'+data.name+':</strong>'+ data.msg+'</p>');
		publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
	})
	//所有人上线提醒
	socket.on('someLogin',(name)=>{
		publicChatBox.append('<p>'+name+'登录了</p>');
		userList.append( '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>');
		CUSTOMER_INFO.friends.unshift(name)
	});	

//私聊聊天-------------------------------------------------------------------
var privateChatBox = $('#private-chat-box'),
	closePrivateChatBox = $('#private-chat-box .close'),
	privateChat = $('#private-chat'),
	privateMsg = $('#privatemessage'),
	sendPrivate = $('#privatesend'),
	privateTitle = $('#private-title');
	//发送私聊消息的方法
	var privateChatting = function(){
			socket.emit('privateMsg',{
								sender: CUSTOMER_INFO.name,
								reciever: CUSTOMER_INFO.privateFriend,
								msg:privateMsg.val()})

			$('#private-chat').append('<p><strong>'+CUSTOMER_INFO.name+':</strong>'+ privateMsg.val()+'</p>');
			privateMsg.val('')
		}
	//发送私聊消息
	sendPrivate.on('click',()=>{privateChatting()});
	enterKeyEvent(privateMsg,function(){ privateChatting() })
	//收到私聊消息
	socket.on('privateMsg',(privateMsg)=>{
		getPrivateChatContent()
		CUSTOMER_INFO.privateFriend = privateMsg.sender
		privateChatBox.fadeIn()
		changePrivateTitle()
		setPrivateChatContent()
		let str = '<p><strong>'+privateMsg.sender+':</strong>'+privateMsg.msg+'</p>';
		$('#private-chat').append(str)
	});
	//关闭私聊聊天窗
	closePrivateChatBox.on('click',function(){
		privateChatBox.fadeOut().removeAttr('style')
	})
	//拖动私聊框
	;(function(){ return
		$("#private-chat-box").on('mousedown',function(e){ //e鼠标事件  
	        $(this).css({"cursor":"move"});//改变鼠标指针的形状
				
	        var offset = $(this).offset();//DIV在页面的位置  
	        var x = e.pageX - offset.left;//获得鼠标指针离DIV元素左边界的距离  
	        var y = e.pageY - offset.top;//获得鼠标指针离DIV元素上边界的距离  
	        $(document).on("mousemove",function(ev){ //绑定鼠标的移动事件，因为光标在DIV元素外面也要有效果，所以要用doucment的事件，而不用DIV元素的事件  
	            $("#private-chat-box").stop();//加上这个之后  
					
	            var _x = ev.pageX - x+150;//获得X轴方向移动的值 
	            							//150是margin-left的偏移量 
	            var _y = ev.pageY - y;//获得Y轴方向移动的值  

	            $("#private-chat-box").animate({left:_x+"px",top:_y+"px"},10);  
	        });  
	    });  

	    $(document).on('mouseup',function(){  
	        $("#private-chat-box").css("cursor","default");  
	        $(this).unbind("mousemove");
	    });
	})();

//enter键事件
function enterKeyEvent(ele,fn){
	ele.on('keyup', (event)=>{
		if(event.keyCode === 13 ){
			try{
				fn()
			}catch(e){
				console.log('方法不真确',e)
			}
		}
	})
}
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

          
//创建加入房间-------------------------------------------------------------------
function selectRoomFriend(event){
	var name = event.target.value	
	var index = CUSTOMER_INFO.invitedFriend.indexOf(name);
    if (index !== -1) {
    	CUSTOMER_INFO.invitedFriend.splice(index, 1);
    }else{
    	CUSTOMER_INFO.invitedFriend.push(name)
    }
}
var room = $('#room-chat-box'),
	closeRoomChatBox = $('#room-chat-box .close'),
	roomChat = $('#room-chat'),
	roomMsg = $('#roommessage'),
	sendroom = $('#roomsend'),
	roomTitle = $('#room-title');
	//发送加入放假消息的方法
	var roomChatting = function(){
			socket.emit('chattingRoom',{room : CUSTOMER_INFO.joinedRoom,
											 name: CUSTOMER_INFO.name,
											 msg: roomMsg.val()})

			roomChat.append('<p><strong>'+CUSTOMER_INFO.name+':</strong>'+ roomMsg.val()+'</p>');
			roomMsg.val('')
		}
	//发送房间消息
	sendroom.on('click',()=>{roomChatting()});
	enterKeyEvent(roomMsg,function(){ roomChatting() })
	//收到房间消息
	socket.on('roomMsg',(data)=>{
		roomChat.append('<p><strong>'+data.name+': </strong>'+ data.msg+'</p>');
	})
	//关闭房间
	closeRoomChatBox.on('click',function(){
		room.fadeOut()
	})
//邀请朋友进入房价
$('#invite').on('click',function(){
	socket.emit("createRoom",{
		room : CUSTOMER_INFO.name,
		friends: CUSTOMER_INFO.invitedFriend,
		me: CUSTOMER_INFO.name
	});
	CUSTOMER_INFO.joinedRoom = CUSTOMER_INFO.name
	room.fadeIn();
});
//收到邀请
socket.on('invite',function(data){
	CUSTOMER_INFO.joinedRoom = data;
	room.fadeIn();
	roomChat.append('<p id="watting-agree"><button class="btn btn-primary" type="button" id="jion">加入房间</button><button class="btn btn-primary" type="button" id="refuse">拒绝房间</button></p>');	
});
//同意加入房间
roomChat.on('click','#jion',function(){
	socket.emit("join",{room: CUSTOMER_INFO.joinedRoom,
						name: CUSTOMER_INFO.name})
	room.fadeIn();
	$("#watting-agree").remove();
});
//拒绝加入
roomChat.on('click','#refuse',function(){
	$("#watting-agree").remove();
});
//加入房间通知
socket.on('sys',(data) => {
	roomChat.append('<p><strong>'+data+'...</strong></p>');
});