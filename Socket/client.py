import socket

SERVER_IP = "192.168.1.7"
PORT = 5050
HEADER_LENGTH = 64
DISCONNECT_MESSAGE = "!disconnect"
FORMAT = "utf-8"
ADDRESS = (SERVER_IP, PORT)

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect(ADDRESS)

def send(message):
    encoded_message = message.encode(FORMAT)
    message_length = len(message)
    encoded_length = str(message_length).encode(FORMAT)

    encoded_length += b" " * (HEADER_LENGTH - len(encoded_length))

    client.send(encoded_length)
    client.send(encoded_message)

send("HELLO")
send("!disconnect")