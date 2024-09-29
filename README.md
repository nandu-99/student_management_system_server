# Backend API Documentation

This document provides an overview of the available endpoints for the backend, allowing you to test the authentication, user profile, leave requests, contests, and event management features.

## Base URL

All requests are made to the base URL: 
```
https://nst-ru-sms-server.vercel.app/
```

Here is the part with only `DATABASE_URL` and `JWT_SECRET`:

```bash
# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Database URL
DATABASE_URL=mysql://username:password@localhost:3306/your_db_name
```

## Authentication Endpoints

1. **Register a new user**
   - **POST** `/signup`
   - Request body should contain user details like `name`, `email`, `password` & `role`.

2. **Log in and receive a JWT token**
   - **POST** `/login`
   - Request body should contain `email`, `password` & `role`. Returns a JWT token upon successful login.

3. **Log out the user by invalidating the token**
   - **POST** `/logout`
   - Invalidates the current user's JWT token as Bearer Token.

## User Profile Endpoints

1. **Get the profile details of the logged-in user**
   - **GET** `/profile`
   - Requires JWT token as Bearer Token for authentication.

2. **Update user profile details**
   - **PUT** `/profile/update`
   - Requires JWT token as Bearer Token for authentication and the body should include updated profile details.

## Leave Request Endpoints

1. **Create a leave request**
   - **POST** `/leave-request`
   - Requires JWT token as Bearer Token and a leave request payload.

2. **Fetch all leave requests for the logged-in user**
   - **GET** `/leave-request`
   - Requires JWT token as Bearer Token.

3. **Update a leave request**
   - **PUT** `/leave-request/:id`
   - Requires JWT token as Bearer Token and the ID of the leave request to be updated.

4. **Delete a leave request**
   - **DELETE** `/leave-requests/:leaveRequestId`
   - Requires JWT token as Bearer Token and the ID of the leave request to delete.

5. **Get a summary of recent leave requests**
   - **GET** `/leave-requests/summary`
   - Requires JWT token as Bearer Token. Fetches a summary of recent leave requests for the user.

## Contests Endpoints

1. **Create new contests**
   - **POST** `/add-contests`
   - Requires JWT token as Bearer Token and contest details in the request body.

2. **Fetch all contests**
   - **GET** `/contests`
   - Requires JWT token as Bearer Token.

3. **Update a contest**
   - **PUT** `/contests/:id`
   - Requires JWT token as Bearer Token and the ID of the contest to update.

4. **Delete a contest**
   - **DELETE** `/contests/:id`
   - Requires JWT token as Bearer Token and the ID of the contest to delete.

## Admin Endpoints

1. **Fetch all leave requests for students in the admin's school**
   - **GET** `/admin/school-leaves`
   - Requires JWT token as Bearer Token and admin privileges.

2. **Approve or reject a leave request**
   - **POST** `/leave-request/approve` or `/leave-request/reject`
   - Requires JWT token as Bearer Token, admin privileges, and the ID of the leave request in the request body.

## Events Endpoints

1. **Create new events**
   - **POST** `/events`
   - Requires JWT token as Bearer Token and event details in the request body.

2. **Fetch all events**
   - **GET** `/events`
   - Requires JWT token as Bearer Tokenv.

3. **Update an event**
   - **PUT** `/events/:id`
   - Requires JWT token as Bearer Token and the ID of the event to update.

4. **Delete an event**
   - **DELETE** `/events/:id`
   - Requires JWT token as Bearer Token and the ID of the event to delete.
  
## Documentation URL

For more detailed information on request and response structures, as well as the database schema, please refer to the full documentation here: [API Documentation](https://docs.google.com/document/d/1az1EGjdQL8rrdOzPG_bccXfr5dVWlOWAk-dKvxzKPpc/edit?usp=sharing)

## Authorization

- Most endpoints require a valid JWT token as Bearer Token, which can be acquired through the `/login` endpoint.
- Admin-specific routes require the user to have admin privileges.
