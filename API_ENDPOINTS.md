# API Documentation of GrepIt-Backend
<!-- When you create/complete a controller function write its small documentation on this format for easier implementation of this in frontend -->

- Authentication Routes:
  - `POST /api/v1/auth/register:` Register a new user.
    ```json
    {
      "username": "test",
      "password": "test",
      "email": "test@gmail.com"
    }
    ```
    **Response:**
    ```json
    {
      "message": "User created successfully",
      "user": {
          "id": 1,
          "name": "test",
          "email": "test@gmail.com",
          "password": "$2b$10$msMc.7.QkYIu3/7i/JTQD.na7Nwq2MfMYpuWrgdWuZuHwWfncr9MW",
          "currPoints": 0,
          "userRoomId": null
      }
    }
    ```


  - `POST /api/v1/auth/login:` Login as a user.
    ```json
    {
      "email": "test@gmail.com",
      "password": "test"
    }
    ```
    **Response:**
    ```json
    {
      "message": "User logged in successfully",
      "user": {
        "id": 12,
        "name": "test",
        "email": "test@gmail.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjJ9fQ.qCeDtlDIvzmYCpMzWEGNsJ9yEio8R7_UiR3Tjl-uxC0",
        "currPoints": 0
      }
    }
    ```

- Room Routes:
  - `POST /api/v1/room/create:` Create a room
  
    **Header:**
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjEyfX0.Q50hTNdo7Kif8fgS0ClBoPbNCQ1x4HKHk1auIP0CwR0`

    **Response:**
    ```json
    {
      "message": "Room created successfully",
      "code": "z9cdTCAAAn"
    }
    ```
  - `PATCH /api/v1/room/update` Update a room
    ```json
    {
    "roomDescription": "desc",
    "roomName": "newName"
    }
    ```

    **Header**
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjJ9fQ.qCeDtlDIvzmYCpMzWEGNsJ9yEio8R7_UiR3Tjl-uxC0`

    **Response**
    ```json
    {
      "message": "Room updated successfully",
      "room": {
        "roomId": 1,
        "roomName": "newName",
        "roomDescription": "desc",
        "code": "Arkvv6AHVM"
      }
    }
    ```
  - `POST /api/v1/room/user/add?roomId=<roomID>` Add user to room

    **Header**
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjJ9fQ.qCeDtlDIvzmYCpMzWEGNsJ9yEio8R7_UiR3Tjl-uxC0`

    **Response**
    ```json
    {
      "status": "OK",
      "message": "User added to room successfully",
      "data": {
        "roomId": 1,
        "roomName": "test",
        "roomDescription": null,
        "code": "qJv84WavcI"
      }
    }
    ```
  - `POST /api/v1/room/user/delete?roomId=<roomID>&userId=<userId>` Remove user from room

    **Header**
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjJ9fQ.qCeDtlDIvzmYCpMzWEGNsJ9yEio8R7_UiR3Tjl-uxC0`

    **Response**
    ```json
    {
      "message": "User removed from room successfully",
      "room": {
        "roomId": 1,
        "roomName": "name",
        "roomDescription": null,
        "code": "Arkvv6AHVM"
      }
    }
    ```
- Question Routes:
  - `POST /api/v1/questions/add/<roomId>` Add question to room
    ```json
    {
      "question": "Example Question",
      "options": [
        { "option": "Correct Option", "isCorrect": "true" },
        { "option": "Incorrect Option", "isCorrect": "false" },
        { "option": "Incorrect Option", "isCorrect": "false" },
        { "option": "Incorrect Option", "isCorrect": "false" },
      ]
    }
    ```

    **Header**
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjJ9fQ.qCeDtlDIvzmYCpMzWEGNsJ9yEio8R7_UiR3Tjl-uxC0`

    **Response**
    ```json
    {
      "message": "Question added successfully",
      "question": {
        "questionId": 1,
        "roomId": 1,
        "question": "Example Question",
        "options" : [
          {
            "optionId": 1,
            "questionId": 1,
            "option": "Correct Option",
            "isCorrect": "true" 
          },
          {
            "optionId": 2,
            "questionId": 1,
            "option": "Incorrect Option",
            "isCorrect": "false"
          },
          {
            "optionId": 3,
            "questionId": 1,
            "option": "Incorrect Option",
            "isCorrect": "false"
          },
          {
            "optionId": 4,
            "questionId": 1,
            "option": "Incorrect Option",
            "isCorrect": "false"
          },
        ]
      }
    }
    ```
