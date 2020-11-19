from pyautogui import locateOnScreen, pixel
from pynput import keyboard
from os import path, system
from time import sleep
import win32api
import win32con
import numpy

SEARCHING_MESSAGE = "Currently searching row {}, column {}."
SOLVING_MESSAGE = "Solving board..."
SOLVED_MESSAGE = "Writing to board.."
DONE_MESSAGE = "Done."

CELL_WIDTH = 49

def getImage(image_name):
    dir = path.dirname(__file__)
    full_name = str(image_name) + ".png"
    relative_path = path.join(dir, "images", full_name)
    return str(relative_path)

def displayGrid(grid):
    for row in grid:
        row_string = ""

        for item in row:
            row_string += str(item)
            row_string += "  "

        print(row_string)

def isPossible(board, row, column, number):
    for i in range(9):
        if board[row][i] == number and column != i:
            return False

    for i in range(9):
        if board[i][column] == number and row != i:
            return False

    box_column = (column // 3) * 3
    box_row = (row // 3) * 3

    for i in range(3):
        for j in range(3):
            if board[box_row + i][box_column + j] == number and (i, j) != (row, column):
                return False

    return True

def findEmpty(board):
    for row in range(9):
        for column in range(9):
            if board[row][column] == 0:
                return (row, column)

    return None

def solve(board):
    empty_cell = findEmpty(board)
    
    if not empty_cell:
        displayMessage(SOLVED_MESSAGE)
        return True

    else:
        row, column = empty_cell

    for number in range(1, 10):
        if isPossible(board, row, column, number):
            board[row][column] = number

            if solve(board):
                return True

            board[row][column] = 0
        
    return False

def click(x, y):
    win32api.SetCursorPos((x, y))
    win32api.mouse_event(win32con.MOUSEEVENTF_LEFTDOWN, 0, 0)
    sleep(0.001)
    win32api.mouse_event(win32con.MOUSEEVENTF_LEFTUP, 0, 0)

def selectCell(board_location, coordinates):
    starting_x = int(board_location[0] + CELL_WIDTH / 2)
    starting_y = int(board_location[1] + CELL_WIDTH / 2)

    x = starting_x + (CELL_WIDTH * coordinates[0])
    y = starting_y + (CELL_WIDTH * coordinates[1])

    click(x, y)

def placeNumber(board_location, numbers_location, number, board_coordinates):
    number_positions = [numbers_location[0] + (50 * index) for index in range(9)]

    selectCell(board_location, board_coordinates)
    click(number_positions[number - 1], numbers_location[1])

def isOnScreen(image, region):
    located = locateOnScreen(image, region = region, grayscale = True, confidence = 0.85)

    if located is not None:
        return True
    
    return False

def isBlank(board_location, row, column): 
    position_x = int(board_location[0] + (445/9 * column) + 28)
    position_y = int(board_location[1] + (445/9 * row) + 12)

    if pixel(position_x, position_y)[0] < 208:
        return False    
        
    else:
        if pixel(position_x - 1, position_y)[0] < 208:
            return False
        
    return True      

def clear():
    system("cls")

def displayMessage(message):
    clear()
    print(message)

def fillBoard(board_location):
    global board

    for row in range(9):
        for column in range(9):
            search_region = (board_location[0] + (CELL_WIDTH * column), board_location[1] + (CELL_WIDTH * row), CELL_WIDTH, CELL_WIDTH)

            displayMessage(SEARCHING_MESSAGE.format(row + 1, column + 1))
            
            if not isBlank(board_location, row, column):
                for number in range(1, 10):
                    if isPossible(board, row, column, number):
                        if isOnScreen(getImage(number), search_region):
                            board[row][column] = number

    displayMessage(SOLVING_MESSAGE)

def writeToBoard(board_location, numbers_location, solved_board):
    for y in range(9):
        for x in range(9):
            placeNumber(board_location, numbers_location, solved_board[y][x], [x, y])
            sleep(0.001)
    
    displayMessage(DONE_MESSAGE)

def getNumberPositions(starting_position):
    positions = [starting_position + (50 * index) for index in range(9)]
    return positions

def findBoard():
    window_location = locateOnScreen(getImage("corner"))

    window_left = window_location[0]
    window_top = window_location[1]

    board_left = window_left + 15
    board_top = window_top + 143

    numbers_left = window_left + 40
    numbers_top = window_top + 795

    board_location = (board_left, board_top)
    numbers_location = (numbers_left, numbers_top)

    return board_location, numbers_location


def initialize(board):
    board_location, numbers_location = findBoard()

    fillBoard(board_location)
    solve(board)
    writeToBoard(board_location, numbers_location, board)

def on_press(key): 
    pass

def on_release(key):
    global board

    if key == keyboard.Key.esc:    
        return False
    
    if key == keyboard.Key.alt_l:
        board = numpy.zeros((9, 9), dtype = int).tolist()
        initialize(board)

# Collect events until released
with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()