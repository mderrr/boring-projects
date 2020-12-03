import time
from os import system

def measureTime(function):
    milliseconds = "ms"
    seconds = "s"
    minutes = "min"

    def inner(*args, **kwargs):
        starting_time = time.time()
        to_execute = function(*args, **kwargs)
        ending_time = time.time()
        elapsed_time = ending_time - starting_time

        if (elapsed_time > 60):
            elapsed_time /= 60
            time_unit = minutes

        elif (elapsed_time < 1):
            elapsed_time *= 1000
            time_unit = milliseconds

        else:
            time_unit = seconds

        system("cls")
        print("The function {} took {}{} to run.".format(function.__name__, round(elapsed_time), time_unit))

        return to_execute
    
    return inner