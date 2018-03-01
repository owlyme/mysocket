//客户端用户信息
var CUSTOMER_INFO={
	name: '',
	id: '',
	friends: [],
	privateFriend: '',
	privateChatContent: {},
	totalClients: 0
}

//建立socket 连接
var socket = io();
CUSTOMER_INFO.id = socket.id;
//在线人数
var totalClients = $('#total-clients');
socket.on('total',function(data){
	totalClients.text(data)
	CUSTOMER_INFO.totalClients = data
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

//公共聊天室
var publicChatBox = $('#public-chat'),
	publicMsg = $('#message'),
	sendPublic = $('#send'),
	userList = document.querySelector('#userList');

	//发送公聊消息
	var publicChatting = function (){
		socket.emit('msg', {
			name: CUSTOMER_INFO.name,
			msg : publicMsg.val()
		})
		publicChatBox.append('<p><strong>'+CUSTOMER_INFO.name+':</strong>'+ publicMsg.val()+'</p>');
		publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
		publicMsg.val('')
	}
	sendPublic.on('click',()=>{	publicChatting() })
	enterKeyEvent(publicMsg,function(){ publicChatting() })

	//所有人上线提醒
	socket.on('someLogin',(name)=>{
		publicChatBox.append('<p>'+name+'登录了</p>');
		userList.innerHTML += '<li ondblclick="getFriendName(event)">'+ name+ '</li>';
		CUSTOMER_INFO.friends.unshift(name)
	});
	//收到消息
	socket.on('msg',(data)=>{
		publicChatBox.append('<p><strong>'+data.name+':</strong>'+ data.msg+'</p>');
		publicChatBox[0].scrollTop = publicChatBox[0].scrollHeight;
	})

//私聊聊天
var privateChatBox = $('#private-chat-box'),
	closePrivateChatBox = $('#private-chat-box .close'),
	privateChat = $('#private-chat'),
	privateMsg = $('#privatemessage'),
	sendPrivate = $('#privatesend'),
	privateTitle = $('#private-title');
//发送私聊消息
var privateChatting = function(){
		socket.emit('privateMsg',{
							sender: CUSTOMER_INFO.name,
							reciever: CUSTOMER_INFO.privateFriend,
							msg:privateMsg.val()})

		$('#private-chat').append('<p><strong>'+CUSTOMER_INFO.name+':</strong>'+ privateMsg.val()+'</p>');
		privateMsg.val('')
	}
	sendPrivate.on('click',()=>{privateChatting()});
	enterKeyEvent(privateMsg,function(){ privateChatting() })

	socket.on('privateMsg',(privateMsg)=>{
		getPrivateChatContent()
		CUSTOMER_INFO.privateFriend = privateMsg.sender
		privateChatBox.fadeIn()
		changePrivateTitle()
		setPrivateChatContent()

		let str = '<p><strong>'+privateMsg.sender+':</strong>'+privateMsg.msg+'</p>';
		$('#private-chat').append(str)
	});

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
//心跳触发
	socket.on('DisconnectReq', function() {	socket.disconnect(); })

//连接上去之后加载相关信息
	socket.emit('loaded','loaded')
	socket.on('loaded',(list)=>{
		$.each(list, function(index, name){
			userList.innerHTML += '<li ondblclick="getFriendName(event)">'+ name+ '</li>';
		})
	})
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

          