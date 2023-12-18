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
          "userRoomId": null,
          "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
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
        "currPoints": 0,
        "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
      }
    }
    ```


- Room Routes:
  - `POST /api/v1/room/create:` Create a room
  
    **Header:**
    authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Im5hbWUiOiJ0ZXN0IiwiaWQiOjEyfX0.Q50hTNdo7Kif8fgS0ClBoPbNCQ1x4HKHk1auIP0CwR0"

    **Response:**
    ```json
    {
      "message": "Room created successfully",
      "code": "z9cdTCAAAn",
      "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjUsInVzZXJOYW1lIjoid2FkYWQiLCJpc0NyZWF0b3IiOnRydWUsImlhdCI6MTcwMjY3ODgzNSwiZXhwIjoxNzAyODUxNjM1fQ.JeMgwc7aMYSg1UyTCqGLkKf2Re8HxIqJ0y5On5VtWSM"
    }
    ```
  - `POST /api/v1/room/user/pending?roomId=<roomID>&userId=<userId>&action=<accept/reject>` Accept/Reject Pending Users

    **Header**
    Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjMsInVzZXJOYW1lIjoiSm9obiBEb2UiLCJpc0NyZWF0b3IiOiJ0cnVlIn0.04c7ahmthIfzSg0vwRHCohZjHXIP2x6bPNNqiO9zENM`

    **Response**
    ```json
    {
      "status": "OK",
      "message": "User accepted successfully"
    }
    ```