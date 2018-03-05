// model/logic leve
var ChatClient = (function () {
	function Client(options) {
		this._callbacks = {};
		if (options.events) {
			for (let evtType in options.events)
				this.on(evtType, options.events[evtType]);
		}

		this.socket = io(options.url || '/', {
			query: {
				userId: options.userInfo.id,
				userName: options.userInfo.name
			}
		});
		
		this.socket.on('connect', () => {
			this.fire('connect');
		}).on('disconnect', () => {
			this.fire('disconnect');
		}).on('msg', (data) => {
			this.fire('msg', data);  
		});
	}

	Client.prototype.close = function() {
		this.socket.close();
	};
	Client.prototype.send = function(txt) {
		console.info(`sending: ${txt}`);
		this.socket.emit('msg', {msg: txt});
	};
	Client.prototype.on = function(evtType, callback) {
		// maybe check evtType : msg/connect/disconnect
		if (! (evtType == 'msg' || evtType == 'connect' || evtType == 'disconnect')) {
			throw new Error('invalid event type: ' + evtType);
		}
		if (this._callbacks[evtType] == undefined) {
			this._callbacks[evtType] = [];
		}
		this._callbacks[evtType].push(callback);
		return this;
	};
	Client.prototype.fire = function(evtType, args) {
		const callbacks = this._callbacks[evtType];
		for (const callback of callbacks) {
			try {
				callback(args);
			} catch (err) {
				console.error(err);
			}
		}
	};

	return Client;
})();


// UI level
// (function () {
	const client = new ChatClient({
		userInfo: {
			id: Date.now(),
			name:  'client-' + Date.now()
		},
		events: {
			'connect': (data) => {
				console.log('connect ok');
			},
			'msg': (data) => {
				console.log(`msg: ${data}`);

				if (data.type == 'login') {
					//
				} else if (data.type == 'txt') {
					//
				} else if  (data.type == 'invite') {
					//
				}
			},
			'disconnect': (data) => {
				console.log('disconnected!');
			}
		}
	});

	$('#send').on('click', (evt) => {
		let txt = $.trim($('#message').val());
		if (txt) {
			client.send(txt);
		}
	});

// })()

