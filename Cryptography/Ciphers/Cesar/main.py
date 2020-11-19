from random import randint

def encrypt(string, key):
    cipher = ""

    for character in string: 
        if (character == " "):
            cipher += character

        elif (character.isupper()):
            cipher += chr((ord(character) + key - 65) % 26 + 65)

        else:
            cipher += chr((ord(character) + key - 97) % 26 + 97)
    
    return cipher

def decrypt(string, key):
    cipher = ""

    for character in string: 
        if (character == " "):
            cipher += character

        elif (character.isupper()):
            cipher += chr((ord(character) - key - 65) % 26 + 65)

        else:
            cipher += chr((ord(character) - key - 97) % 26 + 97)
    
    return cipher

def mainLoop(mode):
    if (mode == 1):
        _message = input("Message: ")
        encription_key = randint(1, 26)

        encripted_message = encrypt(_message, encription_key)

        print("Your encription key is: ", encription_key)
        print("Encripted Message: ", encripted_message)

    elif (mode == 2):
        _message = input("Message: ")
        _encription_key = int(input("Enter the encription key: "))

        decripted_message = decrypt(_message, _encription_key)

        print("Encripted Message: ", decripted_message)

    elif (mode == 3):
        exit()

    else:
        print("Please select a valid number.")

    _mode = int(input("1. Encript \n2. Decript \n3. Exit \n"))
    mainLoop(_mode)

_mode = int(input("1. Encript \n2. Decript \n3. Exit \n"))
mainLoop(_mode)