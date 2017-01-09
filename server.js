var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT;
//var port = process.env.port || 80;
//file
var fs = require("fs");
//db
var file = "db.db";
var exists = fs.existsSync(file);
if (!exists) {
    fs.openSync(file, "w");
}
var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database(':memory:');
//var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
function makeTable(){
//  stmt = "select ona,ose from obj where "+
//        "ona=\""+msg[0]+"\" and "+
//  db.each(stmt, function (err, row) {
//    io.emit('obj_del', "\"" + row.ona + row.ose + "\"");
//    db.run("delete from obj where ose =\"" + row.ose + "\" and ona = \"" + row.ona + "\";")
//  });
//  db.run("PRAGMA journal_mode=memory;");
//  db.run("drop table if exists obj;");
//  db.run("create table if not exists obj(ose text);")
}
db.serialize(function () {
    makeTable();
});

app.get(
  '/', function(req, res){ res.sendFile(__dirname +
  '/index.html' ); });

app.get(
  '/index.js', function(req, res){ res.sendFile(__dirname +
  '/index.js' ); });

app.get(
  '/index.css' , function(req, res){ res.sendFile(__dirname +
  '/index.css' ); });

app.get(
  '/sample' , function(req, res){ res.sendFile(__dirname +
  '/sample.html' ); });

io.sockets.on('connection', function(socket){
  io.emit('echo','hello');
    socket.on('connection', function(){
      console.log('connect : '+socket)
    });
    socket.on('echo',function(msg){
      console.log(msg);
      socket.send('echo',msg);
      for(var i = 0 ; i < io.sockets.sockets.length ; i++){
        if(io.sockets.sockets[i].id == socket.id){
          console.log('socket.id catch')
          //나에게만
          io.sockets.sockets[i].emit('echo',msg);
          //io.sockets.sockets[i].send('echo',msg);
        }
      }
    });
});
io.sockets.on('echo', function(msg){
io.emit(msg+"sv")
});

http.listen(port, function(){
    console.log('SERVER IS READY FOR [*:'+port+']');
});
