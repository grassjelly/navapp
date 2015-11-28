Web Interface for ROS-Navigation

#DEPENDENCIES
- Turtlebot http://wiki.ros.org/turtlebot/Tutorials/indigo/Turtlebot%20Installation
- Rosbridge Server
```
sudo apt-get install ros-indigo-rosbridge-server
```
- TF Bridge
```
sudo apt-get install ros-indigo-tf2-web-republisher
```
#USAGE
- Run NAVAPP launch file
```
roslaunch navapp navapp.launch
```
- Run the Web Application
```
cd /navapp/scripts/ui/
nodejs server.js
```