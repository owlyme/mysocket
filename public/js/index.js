
// UI level
//客户端用户信息
var USER_INFO={
	name: 'client_' + Date.now(),
	id: null,
	friends: [],
	privateFriend: '',
	privateFriendsList:[],
	privateChatContent: {},
	creatRoom: '',
	joinedRoom: '',
	invitedFriends: [],
	totalClients: 0,
	userList: []
};

(function () {
	const client = new ChatClient({
		userInfo: {
			name:  USER_INFO.name
		},
		events: {
			'connect': (id) => {
				console.log('connect ok');
				USER_INFO.id = id;
			},
			'message':(userList)=>{
				USER_INFO.userList	= userList;
			},
			'disconnect': (data) => {
				console.log('disconnected!');
			},
			'msg': (data) => {
				console.log(`msg: ${data}`);
				if (data.type == 'login') {
					//
				} else if (data.type == 'txt') {
					//
				} else if  (data.type == 'invite') {
					//
				} else if (data.type  == 'private'){
					// 
				}
			},
			
		}
	});

	$.fn.enterKey = function(fn){
		$(this).on('keyup', (event)=>{
			if(event.keyCode === 13 ){
				try{
					fn.call(this)
				}catch(e){
					throw new Error('方法不真确',e)
				}
			}
		})
	}
	//登陆
	$('#login').on('click',()=>{
		client.login($('#name').val())
		USER_INFO.name = $('#name').val()
	});
	$('#name').enterKey(function(){ 
		client.login( $(this).val() );
		USER_INFO.name = $(this).val();
	});

	$('#send').on('click', (evt) => {
		let txt = $.trim($('#message').val());
		if (txt) {
			client.send(txt);
		}
	});

})()


// socket.on('connect', (list) => {
//   	USER_INFO.id = socket.id;
// 	console.log(USER_INFO.id);
// 	$.each(list, function(index, name){
// 			userList.append( '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
// 								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>');
// 		})
// });


// //在线人数
// var totalClients = $('#total-clients');
// socket.on('total', function(data){
// 	totalClients.text(data)
// 	USER_INFO.totalClients = data;
	
// })
// //心跳触发
// 	socket.on('DisconnectReq', function() {	socket.disconnect(); })

// //连接上去之后加载相关信息
// 	// socket.emit('loaded','loaded')
// 	// socket.on('loaded',(list)=>{
// 	// 	$.each(list, function(index, name){
// 	// 		userList.append( '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
// 	// 							+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>');
// 	// 	})
// 	// })


// //公共聊天室-------------------------------------------------------------------
// var publicChatBox = $('#public-chat'),
// 	publicMsg = $('#message'),
// 	sendPublic = $('#send'),
// 	userList = $('#userList');

// 	//发送公聊消息的方法
// 	var publicChatting = function (){
// 			socket.emit('msg', {
// 				name: USER_INFO.name,
// 				msg : publicMsg.val()
// 			})
// 			publicChatBox.append('<p><strong>'+USER_INFO.name+':</strong>'+ publicMsg.val()+'</p>');
// 			publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
// 			publicMsg.val('')
// 		}
// 	//发送公聊消息
// 	sendPublic.on('click',publicChatting)
// 	<enterKeyEvent></enterKeyEvent>(publicMsg, publicChatting)
// 	//收到公聊消息
// 	socket.on('msg',(data)=>{
// 		publicChatBox.append('<p><strong>'+data.name+':</strong>'+ data.msg+'</p>');
// 		publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
// 	})
// 	//所有人上线提醒
// 	socket.on('someLogin',(name)=>{
// 		publicChatBox.append('<p>'+name+'登录了</p>');
// 		userList.append( '<li ><input type="checkbox" onclick="selectRoomFriend(event)" value="'
// 								+name+'"><span ondblclick="getFriendName(event)">'+ name+ '</span></li>');
// 		USER_INFO.friends.unshift(name)
// 	});	

// //私聊聊天-------------------------------------------------------------------
// var privateChatBox = $('#private-chat-box'),
// 	closePrivateChatBox = $('#private-chat-box .close'),
// 	privateChat = $('#private-chat'),
// 	privateMsg = $('#privatemessage'),
// 	sendPrivate = $('#privatesend'),
// 	privateTitle = $('#private-title');
// 	//发送私聊消息的方法
// 	var privateChatting = function(){
// 			socket.emit('privateMsg',{
// 								sender: USER_INFO.name,
// 								reciever: USER_INFO.privateFriend,
// 								msg:privateMsg.val()})

// 			$('#private-chat').append('<p><strong>'+USER_INFO.name+':</strong>'+ privateMsg.val()+'</p>');
// 			privateMsg.val('')
// 		}
// 	//发送私聊消息
// 	sendPrivate.on('click',()=>{privateChatting()});
// 	enterKeyEvent(privateMsg,function(){ privateChatting() })
// 	//收到私聊消息
// 	socket.on('privateMsg',(privateMsg)=>{
// 		getPrivateChatContent()
// 		USER_INFO.privateFriend = privateMsg.sender
// 		privateChatBox.fadeIn()
// 		setPrivateChatContent()
// 		let str = '<p><strong>'+privateMsg.sender+':</strong>'+privateMsg.msg+'</p>';
// 		$('#private-chat').append(str)
// 	});
// 	//关闭私聊聊天窗
// 	closePrivateChatBox.on('click',function(){
// 		privateChatBox.fadeOut().removeAttr('style')
// 	})
// 	//拖动私聊框
// 	;(function(){ return
// 		$("#private-chat-box").on('mousedown',function(e){ //e鼠标事件  
// 	        $(this).css({"cursor":"move"});//改变鼠标指针的形状
				
// 	        var offset = $(this).offset();//DIV在页面的位置  
// 	        var x = e.pageX - offset.left;//获得鼠标指针离DIV元素左边界的距离  
// 	        var y = e.pageY - offset.top;//获得鼠标指针离DIV元素上边界的距离  
// 	        $(document).on("mousemove",function(ev){ //绑定鼠标的移动事件，因为光标在DIV元素外面也要有效果，所以要用doucment的事件，而不用DIV元素的事件  
// 	            $("#private-chat-box").stop();//加上这个之后  
					
// 	            var _x = ev.pageX - x+150;//获得X轴方向移动的值 
// 	            							//150是margin-left的偏移量 
// 	            var _y = ev.pageY - y;//获得Y轴方向移动的值  

// 	            $("#private-chat-box").animate({left:_x+"px",top:_y+"px"},10);  
// 	        });  
// 	    });  

// 	    $(document).on('mouseup',function(){  
// 	        $("#private-chat-box").css("cursor","default");  
// 	        $(this).unbind("mousemove");
// 	    });
// 	})();

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
// function getFriendName(event){
// 	getPrivateChatContent()
// 	USER_INFO.privateFriend = event.target.innerText;
// 	openPrivateBox()
// 	setPrivateChatContent()
// }
// function openPrivateBox(){
// 	if( USER_INFO.privateFriend !== USER_INFO.name ){
// 		privateChatBox.fadeIn()
// 		if( USER_INFO.privateFriend in USER_INFO.privateChatContent ){
// 			$('#private-chat').html = USER_INFO.privateChatContent[USER_INFO.privateFriend]
// 		}
// 	}
// }
// function getPrivateChatContent(){
// 	USER_INFO.privateChatContent[USER_INFO.privateFriend] = $('#private-chat').html();	
// 	$('#private-chat').html('')
// }
// function setPrivateChatContent(){
// 	privateTitle.text('与好友'+ USER_INFO.privateFriend+ '聊天中...');
// 	privateChat.html( USER_INFO.privateChatContent[USER_INFO.privateFriend] );
// }
// function renderPrivateChatList(){
// 	$('#private-chat').html( USER_INFO.privateChatContent[USER_INFO.privateFriend] );
// }
          
// //创建加入房间-------------------------------------------------------------------
// function selectRoomFriend(event){
// 	var name = event.target.value	
// 	var index = USER_INFO.invitedFriends.indexOf(name);
//     if (index !== -1) {
//     	USER_INFO.invitedFriends.splice(index, 1);
//     }else{
//     	USER_INFO.invitedFriends.push(name)
//     }
// }
// var room = $('#room-chat-box'),
// 	closeRoomChatBox = $('#room-chat-box .close'),
// 	roomChat = $('#room-chat'),
// 	roomMsg = $('#roommessage'),
// 	sendroom = $('#roomsend'),
// 	roomTitle = $('#room-title');
// 	//发送加入放假消息的方法
// 	var roomChatting = function(){
// 			socket.emit('chattingRoom',{room : USER_INFO.joinedRoom,
// 											 name: USER_INFO.name,
// 											 msg: roomMsg.val()})

// 			roomChat.append('<p><strong>'+USER_INFO.name+':</strong>'+ roomMsg.val()+'</p>');
// 			roomMsg.val('')
// 		}
// 	//发送房间消息
// 	sendroom.on('click',()=>{roomChatting()});
// 	enterKeyEvent(roomMsg,function(){ roomChatting() })
// 	//收到房间消息
// 	socket.on('roomMsg',(data)=>{
// 		roomChat.append('<p><strong>'+data.name+': </strong>'+ data.msg+'</p>');
// 	})
// 	//关闭房间
// 	closeRoomChatBox.on('click',function(){
// 		room.fadeOut()
// 	})
// //邀请朋友进入房价
// $('#invite').on('click',function(){
// 	socket.emit("createRoom",{
// 		room : USER_INFO.name,
// 		friends: USER_INFO.invitedFriends,
// 		me: USER_INFO.name
// 	});
// 	USER_INFO.joinedRoom = USER_INFO.name
// 	room.fadeIn();
// });
// //收到邀请
// socket.on('invite',function(data){
// 	USER_INFO.joinedRoom = data;
// 	room.fadeIn();
// 	roomChat.append('<p id="watting-agree"><button class="btn btn-primary" type="button" id="join">加入房间</button><button class="btn btn-primary" type="button" id="refuse">拒绝房间</button></p>');	
// });
// //同意加入房间
// roomChat.on('click','#join',function(){
// 	socket.emit("join",{room: USER_INFO.joinedRoom,
// 						name: USER_INFO.name})
// 	room.fadeIn();
// 	$("#watting-agree").remove();
// });
// //拒绝加入
// roomChat.on('click','#refuse',function(){
// 	$("#watting-agree").remove();
// });
// //加入房间通知
// socket.on('sys',(data) => {
// 	roomChat.append('<p><strong>'+data+'...</strong></p>');
// });