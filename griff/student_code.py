"""
Sample student code. Runs by default until new student code is received
from transport layer.
"""
def teleop(robot):
    # my_robot.g = Robot.Grizzly()
    # g.set_mode(ControlMode.NO_PID, DriveMode.DRIVE_COAST)
    # g.limit_acceleration(142)
    # g.limit_current(10)
    while True:
        try:
            print robot.status['test']
            # print stuff['0']['axes'][0]
            # target = float(stuff['0']['axes'][0]) * 100
            # print target
            # g.set_target(target)
        except Exception as e:
          print e
