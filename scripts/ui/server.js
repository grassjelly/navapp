var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// used for writing the csv file
var fs = require('fs');
var csvWriter = require('csv-write-stream');

// used for bash-scripting
var exec = require('child_process').exec;

//either use cloud service port or local port:3000
var port = process.env.PORT || 8080;
var cachedWaypoints = new Array();
var missionIsDone = true;
var homingIsDone = false;

server.listen(port, function() {
  console.log('Server listening at port %d', port);
});

app.use(express.static(__dirname));

io.on("connection", function(socket) {
  //send to client all the waypoints once connected
  socket.emit("waypoints", cachedWaypoints);

  //tells the client if the robot is still on a mission once connected
  socket.emit("missionstate", missionIsDone);

  //tells the client if the robot is already hone once connected
  socket.emit("homingstate", homingIsDone);

  socket.on("waypoints", function(waypoint) {
    //callback when waypoints are sent from the client

    //cache all the waypoints
    cachedWaypoints = new Array();
    missionIsDone = false;
    var writer = csvWriter({
      headers: ["waypoint", "loop", "x", "y"]
    });
    writer.pipe(fs.createWriteStream('route.csv'));
    //iterate all the waypoints
    for (var i = 0; i < waypoint.length; i++) {
      cachedWaypoints[i] = waypoint[i];
      var x = waypoint[i].x;
      var y = waypoint[i].y;
      console.log(waypoint[i]);
      //write to csv
      writer.write([0, 0, x.toFixed(4), y.toFixed(4)]);
    }
    //close the csv file
    writer.end();
    //run the python code to move the robot (ROS)
    var cmd = 'python ../navigate.py';
    exec(cmd, function(error, stdout, stderr) {
      //prints console
      console.log(stdout);
      missionIsDone = true;
      socket.emit("missionstate", true);
    });
  });

  socket.on("homingstate", function(state) {
    //callback from client to tell if the robot has been homed
    homingIsDone = state;
    console.log("Homing is Done: " + homingIsDone);
  });

  socket.on("reboot", function(msg) {
    //callback from client to tell it wants a reboot

    console.log("Shutting robot down..")
    //kill all ROS processes
    var cmd = 'killall python';
    exec(cmd, function(error, stdout, stderr) {
      console.log(stdout);
    });

    //after 10 seconds..
    setTimeout(function() {
      console.log("Restarting robot now..")
        //relaunch ROS launch files
      cmd = 'roslaunch navapp navapp.launch';
      exec(cmd, function(error, stdout, stderr) {});
      //tell the client rebooting is done
      socket.emit("reboot", true);
      console.log("Rebooting done.");
    }, 10000);

  });

  socket.on("cancelmission", function(msg) {
    //callback from client it wants to cancel the current mission

    console.log("Cancelling Mission now.")
      //kill 'nav_joe' ROS node
    var cmd = 'rosnode kill nav_joe';
    exec(cmd, function(error, stdout, stderr) {

    });
  });

});
