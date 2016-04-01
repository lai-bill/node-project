var net = require("net");
var events = require("events");
/*
 * TCP聊天小程序
 */

var channel = new events.EventEmitter();
channel.clients = {};			//存储所有client-socket
channel.subscriptions = {};		//存储所有socket等消息到达的函数


/*
 * 当有人连接到服务端时触发
 *	1.存储连接过来的socket
 *	2.推送在线人数数量
 *	3.注册一个等待消息的事件
 *		当有消息过来时传送发送者的id,然后将消息发送给所有非发送者的client端
 */
channel.on("join", function(id, client) {
	this.clients[id] = client;
	this.subscriptions[id] = function(senderId, message) {
		if (senderId === id) return;
		channel.clients[id].write(message);
	}

	client.write('当前在线人数:' + this.subscriptions.length);
	channel.on('broadcast', this.subscriptions[id]);
});


/*
 * 当有client端断开连接时触发
 *	1.删除断开client端等待消息的事件
 *	2.服务器推送给所有client端消息
 */
channel.on('leave', function(id) {
	this.removeListener('broadcast', this.subscriptions[id]);
	this.emit('broadcast', id, id + '已退出登录');
});

/*
 * 当有client发送shutdown消息时触发,
 *	1.推送给所有client将要断开的消息,
 *	2.删除所有client注册的等待消息事件
 */
channel.on("shutdown", function(id) {
	this.emit(id, 'list is close \r\n');
	this.removeAllListeners('broadcast');
});


/*
 * 注册错误事件，当错误事件被注册时，事件触发器触发了error则会被抓到，
 * 如果没注册，触发error则直接退出
 */
channel.on("error", function(err) {
	//console.log(err);
})


//事件触发器默认事件监听值为10，超过10个则触发警告，这里可更改设置。
channel.setMaxListeners(50);

var server = net.createServer(function(client) {
	var id = client.remoteAddress + ":" + client.remotePort;
	
	channel.emit('join', id, client);

	client.on('data', function(data) {

		if (data.toString() === "shutdown\r\n") 
			channel.emit("shutdown", id);
		channel.emit('error', new Error('???'));
		channel.emit("broadcast", id, data.toString());
	});

	client.on('close', function() {
		channel.emit("leave", id);
	});
});

server.listen(8080);