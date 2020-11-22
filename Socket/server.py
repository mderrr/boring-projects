import socket, threading

HOST_NAME = socket.gethostname()
SERVER_IP = socket.gethostbyname(HOST_NAME)
PORT = 5050
HEADER_LENGTH = 64
DISCONNECT_MESSAGE = "!disconnect"
FORMAT = "utf-8"
ADDRESS = (SERVER_IP, PORT)

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(ADDRESS)

def handleClient(connection, address):
    print("New connection from:", address)

    connected = True
    while connected:
        message_length = connection.recv(HEADER_LENGTH).decode(FORMAT)

        if message_length:
            message = connection.recv(int(message_length)).decode(FORMAT)

            if message == DISCONNECT_MESSAGE:
                connected = False

            print("Message:", message, "From:", address)
            connection.send("AAAAAAAAAAAAAAAAA".encode(FORMAT))

    connection.close()


def start():
    server.listen()
    print("Listennig")

    while True:
        connection, address = server.accept()

        thread = threading.Thread(target=handleClient, args=(connection, address))
        thread.start()

        print("Active connections:", threading.active_count() - 1)

start()