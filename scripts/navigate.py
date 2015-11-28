
import rospy
from move_base_msgs.msg import MoveBaseAction, MoveBaseGoal
import actionlib
from actionlib_msgs.msg import *
from geometry_msgs.msg import Pose, PoseWithCovarianceStamped, Point, Quaternion, Twist
import csv
import sys

def goTo(w,l,x,y):
    #This function brings the robot from point A to point B by passing quarternions

    #this creates a new ROS node named 'nav_joe' that publishes goal pose to 'move_base' node
    rospy.init_node('nav_joe', anonymous=False)
    move_base = actionlib.SimpleActionClient("move_base", MoveBaseAction)
    move_base.wait_for_server(rospy.Duration(5))

    #move_base objec constructor
    goal = MoveBaseGoal()
    goal.target_pose.header.frame_id = 'map'
    goal.target_pose.header.stamp = rospy.Time.now()

    #pass x and y to 'goal' object
    goal.target_pose.pose = Pose(Point(x,y, -0.00143), Quaternion(0.000, 0.000, 0.892, -1.500))
    msg = "Moving to WP:%d LOOP:%d X:%f Y:%f" %(w, l, x, y)
    rospy.loginfo(msg)

    #move the robot to next point
    move_base.send_goal(goal)
    reached = move_base.wait_for_result(rospy.Duration(80))

    if not reached:
        move_base.cancel_goal()
        rospy.loginfo("The base failed to reach the desired pose")
    else:
        state = move_base.get_state()
        if state == GoalStatus.SUCCEEDED:
            msg = "Waypoint reached\n"
            rospy.loginfo(msg)

def main():
    #open csv file
    print "Running Turtlebot"
    #open the csv file created from the UI
    f = open('route.csv', 'rt')
    try:
        reader = csv.reader(f)
        # iterate all the waypoints
        for row in reader:
            if row[0] == "waypoint":
                pass
            else:
                w = int(row[0])
                l = int(row[1])
                x = float(row[2])
                y = float(row[3])
                # tell the robot to move to x and y
                goTo(w,l,x,y)

    except (RuntimeError, TypeError, NameError):
        print "no file"

    finally:
        f.close()

if __name__ == '__main__':

    try:
        main()
        print "Done"
    except rospy.ROSInterruptException:
        rospy.loginfo("Exception thrown")
