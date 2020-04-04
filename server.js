var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// ID生成
var Hashids = require('hashids');
var hashids = new Hashids('salt', 8, '23456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/join", function (request, response) {
  response.sendFile(__dirname + '/views/join.html');
});

app.get("/id", function(request, response) {
  response.json({"id": hashids.encode((new Date).getTime() - (new Date("2016")).getTime())});
});

http.listen(PORT, function() {
  console.log('server listening. PORT:' + PORT);
});


io.sockets.on('connection', function(socket) {
  console.log('connection');

  var worldid;
  var userid;
  var name;
  
  // WorldID を使用した入手
  socket.on('join', function(data) {
    worldid = JSON.parse(data).worldid;
    socket.join(worldid);
    console.log("worldid:" + worldid);
  });
  
  // 動作確認用 
  socket.on('message', function(data) {
    console.log("message on " + data);
    io.to(worldid).emit('message', data);
  });
  
  // minecraft-sgiのマルチプレーヤー処理
  
  // 参加時の挨拶
  socket.on('greeting', function(data) {
    let userData = JSON.parse(data);
    userid = userData.userid;
    io.to(worldid).emit('greeting', data);
  });

  // プレイヤーのPosition, Rotation同期
  socket.on('player', function(data) {
    io.to(worldid).emit('player', data);
  });

  // ブロック作成・削除時の同期合わせ
  socket.on('makeblock', function(data) {
    io.to(worldid).emit('makeblock', data);
  });

  // 全ブロック同期合わせ
  socket.on('syncblock', function(data) {
    console.log("syncblock " + data);
    io.to(worldid).emit('syncblock', data);
  });


});