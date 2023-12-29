# Frontend
1) connect
    - Recieved when user gets connected

2) room joined
    - Recieved when user joins a room
    - Returns roomcode

3) hello
    - Recieved when server pings (or says hello)

4) new join
    - Recieved when someone joins the room
    - Returns name of the new joinee

5) user left
    - Recieved when someone leaves the room
    - Returns name of user who left

6) user removed
    - Recieved when the room creator kicks someone
    - Returns name of the user who was kicked

7) send message
    - Recieved when someone in your room sends the message
    - Returns the message

8) quiz started
    - Recieved when the room creator starts the quiz
    - Returns quiz data

9) display question
    - Recieved when the question has to be displayed
    - Returns question data

10) answer response
    - Recieved when server tells if the sent answer is correct or not
    - Returns the answer data

11) answer question
    - Emitted when user clicks on the option
    - Sends optionId, socketId, roomCode, userId, and questionId
    - Can be sent by normal user as well as creator


# Backend
1) connection
    - Recieved when connected to socket

2) disconnect
    - Recieved when disconnected from socket
    - Returns the reason

3) room joined
    - Emitted when user creates a room
    - Returns the code

4) room closed
    - Emitted when room gets closed
    - Can only be done by room creator
    - Returns roomName

5) user removed
    - Emitted when user is removed
    - Can only be done by room creator
    - Returns user's name

6) new join
    - Emitted when a new user joins the room
    - Returns user's name

7) user left
    - Emitted when a user leaves the room
    - Returns user's name

8) answer question
    - Received when a user chooses an answer
    - Gets the data related to user's socket, room, question, and option

9) answer response
    - Emitted when server gives the answer's detail
    - Tells whether the option user chose was correct or wrong
    - Returns the answer data
