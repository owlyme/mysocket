//客户端用户信息
var USER_INFO={
	login:false,
	name: 'client_' + Date.now(),
	id: null,
	friends: [],
	reciever: '',
	friendNamesList:[],
	privateChatContent: {},
	creatRoom: '',
	joinedRoom: '',
	invitedFriends: [],
	totalClients: 0,
	userList: [],
	privateChatList:[],
};
$(document).ready(function(){
//start-----------------------------
// UI level
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
			'message':(data)=>{
				USER_INFO.userList	= data.list;
				USER_INFO.totalClients = data.clients;
				renderUserList();
				renderTotalClients()
			},
			'disconnect': (data) => {
				console.log('disconnected!');
				disconnect();
			},
			'msg': (data) => {
				console.log(`msg: ${data}`);
				if (data.type == 'login') {
					typeLogin(data)
				} else if (data.type == 'public') {
					typePublic(data)
				} else if (data.type == 'invite') {
					//
				} else if (data.type  == 'private'){
					typePrivate(data)
				}else if (data.type  == 'off'){//other user disconnect
					typeOff(data)
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
	$.fn.scrollToBottom = function(){
		$(this)[0].scrollTop = $(this)[0].scrollHeight;
		return this;
	}
	//登陆
	function sendLogin(){
		USER_INFO.name =  $.trim( $('#name').val() );
		if( USER_INFO.name && !USER_INFO.login){
			var data ={
				txt: USER_INFO.name,
				type: 'login'
			};
			client.send(data,(data)=>{ 
				USER_INFO.login = data
			})
		}else{
			console.log('user name is undefined')
		}
	}
	$('#login').on('click',sendLogin);
	$('#name').enterKey(sendLogin);
	//公共聊天室
	function sendPublic(){
		let txt = $.trim($('#message').val());
		$('#message').val('')
		if (txt) {
			var data ={
				txt: txt,
				type: 'public'
			};
			client.send(data);
			$('#public-chat').append('<p><strong>'+USER_INFO.name+':</strong>'+ txt +'</p>').scrollToBottom();
		}
	}
	$('#send').on('click', sendPublic);
	$('#message').enterKey( sendPublic );

	//私聊
	var privateChatBox = $('#private-chat-box'),
		closePrivateChatBox = $('#private-chat-box .close'),
		privateChat = $('#private-chat'),
		privateMsg = $('#privatemessage'),
		privateBtn = $('#privatesend'),
		privateTitle = $('#private-title');

	function sendPrivate(){
		let txt = $.trim(privateMsg.val());
		privateMsg.val('');
		if (txt) {
			var data ={
				txt: txt,
				reciever: USER_INFO.privateChatFriendName,
				recieverId: USER_INFO.privateChatFriendId,
				type: 'private'
			};
			client.send(data);
			privateChat.append('<p><strong>'+USER_INFO.name+':</strong>'+ txt+'</p>').scrollToBottom();

		};
	};

	privateBtn.on('click', sendPrivate);
	privateMsg.enterKey( sendPrivate );


	$('#userList').on('dblclick','.user',getFriendName);
	// $('#userList').on('click','.checkbox',selectRoomFriend);
	closePrivateChatBox.on('click',function(){
		privateChatBox.fadeOut().removeAttr('style')
	});
	function getFriendName(event){
		getPrivateChatContent()
		USER_INFO.privateChatFriendName = event.target.innerText;
		USER_INFO.privateChatFriendId = $(event.target).attr('id');
		openPrivateBox()
		setPrivateChatContent()

		USER_INFO.privateChatList.unshift({id:USER_INFO.privateChatFriendName, name:USER_INFO.privateChatFriendId })
	}
	function openPrivateBox(){
		if( USER_INFO.privateChatFriendId !== USER_INFO.name ){
			privateChatBox.fadeIn();
			if( USER_INFO.privateChatFriendId in USER_INFO.privateChatContent ){
				$('#private-chat').html = USER_INFO.privateChatContent[USER_INFO.privateChatFriendId]
			}
		}
	}
	function getPrivateChatContent(){
		USER_INFO.privateChatContent[USER_INFO.privateChatFriendId] = $('#private-chat').html();	
		$('#private-chat').html('')
	}
	function setPrivateChatContent(){
		privateTitle.text('与好友'+ USER_INFO.privateChatFriendName+ '聊天中...');
		privateChat.html( USER_INFO.privateChatContent[USER_INFO.privateChatFriendId] );
	}

	//render msg
	function renderUserList(){
		$('#userList').empty();
		let _html="";
		USER_INFO.userList.forEach((item, index)=>{
			 _html += '<li ><input type="checkbox" class="checkbox" value="'
						+item.name+'"><span class="user" id='+item.id+'>'+ item.name+ '</span></li>';
		})
		$('#userList').append( _html);
	}
	function renderPrivateList(){
		$('#privateList').empty();
		let _html="";
		USER_INFO.privateChatList.forEach((item, index)=>{
			_html += '<li><span class="user" id='+item.id+'>'+ item.name+ '</span></li>';
		})
		$('#privateList').append( _html);
	}
	//
	function renderTotalClients(num){
		USER_INFO.totalClients = num != undefined ? USER_INFO.totalClients+ num : USER_INFO.totalClients;
		$('#total-clients').text( USER_INFO.totalClients );
	}
	function searchUserIndex(userList, id){
		let _index = -1;
		userList.forEach((item, index)=>{
			if(item.id === id){
				_index = index;
				return ;
			}
		});
		return _index;
	}
	function typeLogin(data){
		var name = data.txt,
			id = data.id;

		$('#public-chat').append('<p>'+name+'登录了</p>').scrollToBottom();

		let userIndex = searchUserIndex(USER_INFO.userList, id);
		if(userIndex != -1){
			USER_INFO.userList[userIndex].name = name
		}else{
			USER_INFO.userList.unshift({name: name , id : id})
		}
		renderTotalClients(1);
		renderUserList();
	};
	function typeOff(data){
		var name = data.txt,
			id = data.id;

		$('#public-chat').append('<p>'+name+'退出房间！</p>').scrollToBottom();

		let userIndex = searchUserIndex(USER_INFO.userList, id);
		USER_INFO.userList.splice(userIndex, 1);
		renderTotalClients(-1);
		renderUserList();
	};
	function typePublic(data){	$('#public-chat').append('<p><strong>'+data.name+':</strong>'+ data.txt +'</p>').scrollToBottom();	};
	function typePrivate(data){
		getPrivateChatContent();
		USER_INFO.privateChatFriendId = data.id;
		USER_INFO.privateChatFriendName = data.name;
		privateChatBox.fadeIn();
		setPrivateChatContent();
		let str = '<p><strong>'+data.name+':</strong>'+data.txt+'</p>';
		$('#private-chat').append(str);
		let index = searchUserIndex(USER_INFO.privateChatList, data.id);
		if( index != -1){
			// USER_INFO.userList[userIndex].name = name
		}else{
			USER_INFO.privateChatList.unshift({name: data.name , id : data.id})
		}

		renderPrivateList();
	};
	function disconnect(){ client.close() };

})()
//end-----------------------------
});

