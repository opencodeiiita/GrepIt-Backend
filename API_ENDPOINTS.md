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