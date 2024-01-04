# API Documentation of GrepIt-Backend

<!-- When you create/complete a controller function write its small documentation on this format for easier implementation of this in frontend -->

-   Authentication Routes:

    -   `POST /api/v1/auth/register` Register a new user.

        ```json
        {
            "name": "test",
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
                "userRoomId": null,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
            }
        }
        ```

    -   `POST /api/v1/auth/login` Login as a user.
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
                "currPoints": 0,
                "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
            }
        }
        ```

-   Room Routes:

    -   `POST /api/v1/room/create` Create a room

        **Header:**
        authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjEyfX0.Q50hTNdo7Kif8fgS0ClBoPbNCQ1x4HKHk1auIP0CwR0"

        **Response:**

        ```json
        {
            "message": "Room created successfully",
            "code": "z9cdTCAAAn",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
        }
        ```

    -   `PATCH /api/v1/room/:roomCode` Close a room

        **Header:**
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjEyfX0.Q50hTNdo7Kif8fgS0ClBoPbNCQ1x4HKHk1auIP0CwR0'

        **Response:**

        ```json
        {
            "status": "OK",
            "message": "Room Closed successfully"
        }
        ```

    -   `GET /api/v1/room/leaderboard/:roomCode` Leaderboard a room

        **Header:**
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjEyfX0.Q50hTNdo7Kif8fgS0ClBoPbNCQ1x4HKHk1auIP0CwR0'

        **Response:**

        ```json
        {
            "status": "OK",
            "message": "Leaderboard Details",
            "data": [
                {
                    "name": "wadad",
                    "points": 40
                },
                {
                    "name": "test",
                    "points": 30
                },
                {
                    "name": "test2",
                    "points": 20
                }
            ]
        }
        ```

    -   `POST /api/v1/room/user/pending?roomId=<roomID>&userId=<userId>&action=<accept/reject>` Accept/Reject Pending Users

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        **Response**

        ```json
        {
            "status": "OK",
            "message": "User accepted successfully"
        }
        ```

    -   `POST /api/v1/room/announce` Announce in a room

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        ```json
        {
            "code": 1,
            "message": "Hello World"
        }
        ```
        **Response**
        ```json
        {
            "status": "OK",
            "message": "Announcement sent"
        }
        ```

    -   `POST /api/v1/room/message/send` Send a message

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        ```json
        {
            "roomCode": "OuEEwHtmFX",
            "message": "Hello World"
        }
        ```
        **Response**
        ```json
        {
            "status": "OK",
            "message": "Message sent successfully",
        }
        ```

    -   `GET /api/v1/room/getroomusers` Get all the users of the room

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        ```json
        {
            "code": "z9cdTCAAAn"
        }
        ```
        **Response**
        ```json
        {
          "status": "OK",
          "message": "Users fetched successfully",
          "data":{
            "users": [
                {
                  "id": 3,
                  "name": "test user",
                  "email": "test1@gmail.com",
                  "currPoints": 0,
                  "userRoomId": 1,
                  "isCreator": "true"
                },
                {
                  "id": 4,
                  "name": "test user two",
                  "email": "test2@gmail.com",
                  "currPoints": 0,
                  "userRoomId": 1,
                  "isCreator": "false"
                }
            ]
          }
        }
        ```

    -   `GET /api/v1/room/getpendingusers` Get all the pending users of the room

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        ```json
        {
            "code": "z9cdTCAAAn"
        }
        ```
        **Response**
        ```json
        {
          "status": "OK",
          "message": "Pending users found",
          "data": {
            "pending": [
                {
                  "id": 8,
                  "name": "test user",
                  "email": "test@gmail.com"
                },
                {
                  "id": 9,
                  "name": "test",
                  "email": "test9@gmail.com"
                }
            ]
          }
        }
        ```

    -   `GET /api/v1/room/getrooms` Get all the rooms

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

        **Response**
        ```json
        {
          "status": "OK",
          "message": "Rooms found",
          "data": {
            "rooms": [
                {
                  "id": 1,
                  "name": "test room",
                  "description": "test room description",
                  "code": "z9cdTCAAAn",
                  "isInviteOnly": "false",
                  "users": [
                    {
                      "id": 3,
                      "name": "test user",
                      "email": "test@gmail.com"
                }]
                }
            ]
          }
        }
        ```

    -   `GET /api/v1/room/getroom` Get the specific room for the corresponding code

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`
        ```json
        {
        "code": "z9cdTCAAAn"
        }
        ```
        **Response**
        ```json
        {
          "status": "OK",
          "message": "Room found",
          "data":{
                  "id": 1,
                  "name": "test room",
                  "description": "test room description",
                  "code": "z9cdTCAAAn",
                  "isInviteOnly": "false",
                  "users": [
                    {
                      "id": 3,
                      "name": "test user",
                      "email": "test@gmail.com"
                    }
                  ]
                }

          }
        ```
-   v2 Routes

    -   `POST /api/v2/room/startQuiz` To start Quiz

        **Header**
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`
    
        **Response**
        ```json
        {
          "status": "OK",
          "message": "Quiz ended successfully"
        }
        ```