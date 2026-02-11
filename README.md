# Real-Time Chat Application (Lab Test 1)

## Student Information
Course: COMP3133  
Lab Test: Chat Application  
Repository Name: 101488862_lab_test1_chat_app  

---

## Project Overview

This project is a real-time chat application built using:

Backend:
- Node.js
- Express.js
- Socket.io
- MongoDB with Mongoose

Frontend:
- HTML5
- Bootstrap 5
- jQuery
- Fetch API

The application allows users to sign up, log in, join chat rooms, send group messages, send private messages, and see typing indicators. All data is stored in MongoDB.

---

## Features Implemented (As Per Rubric)

1. GitHub Repository
   - Code maintained in a GitHub repository.
   - Regular commits.

2. Signup Page
   - Users can create an account.
   - Unique username validation.
   - User data stored in MongoDB (`users` collection).
   - Passwords stored securely using bcrypt hashing.

3. Login / Logout with Session Management
   - Login validates credentials against MongoDB.
   - Session stored using `localStorage`.
   - Users cannot access rooms or chat pages without a valid session.
   - Logout clears session from `localStorage`.

4. Join / Leave Room
   - Users can select from predefined rooms (e.g., devops, cloud computing, sports, etc.).
   - Users can leave the current room.

5. Room-Based Chat (Real-Time)
   - Messages are sent using Socket.io.
   - Users only see messages from the room they joined.
   - Group messages are saved in MongoDB (`groupmessages` collection).
   - Chat history loads when user joins a room.

6. Private Messaging (1-to-1)
   - Users can send private messages to online users.
   - Only sender and receiver can see private messages.
   - Private messages are saved in MongoDB (`privatemessages` collection).

7. Typing Indicator
   - Room typing indicator:
     - Users in the same room see “User is typing...”.
   - Private typing indicator:
     - Receiver sees “User is typing...” during private message typing.

---

## MongoDB Collections

### Users Collection
Stores registered users.

Example document:
{
  "_id": "...",
  "username": "manvi",
  "firstname": "manvi",
  "lastname": "prakash",
  "password": "hashed_password",
  "createon": "MM-DD-YYYY HH:MM AM/PM"
}

---

### Group Messages Collection
Stores room-based messages.

Example document:
{
  "_id": "...",
  "from_user": "manvi",
  "room": "devops",
  "message": "hello everyone",
  "date_sent": "MM-DD-YYYY HH:MM AM/PM"
}

---

### Private Messages Collection
Stores private 1-to-1 messages.

Example document:
{
  "_id": "...",
  "from_user": "manvi",
  "to_user": "Prakash7",
  "message": "hi",
  "date_sent": "MM-DD-YYYY HH:MM AM/PM"
}

---

## Installation & Setup

1. Install Dependencies

Run in project folder:

npm install


2. Create .env File

Create a file named `.env` in the root folder:

Example for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster
PORT=3000


3. Start the Server (Development Mode)

npm run dev

The application will run at:
http://localhost:3000


---

## How to Use the Application

1. Signup
   - Open: /views/signup.html
   - Create a new user (unique username).

2. Login
   - Open: /views/login.html
   - Login with created credentials.
   - Session is saved in localStorage.

3. Join a Room
   - Select a predefined room.
   - Click “Join Chat Room”.

4. Room Chat
   - Send messages to users in the same room.
   - Messages are stored in MongoDB.
   - Typing indicator appears for other users.

5. Private Message
   - Select another online user.
   - Send private message.
   - Private message is stored in MongoDB.
   - Typing indicator appears only for the receiver.

6. Logout
   - Click logout button.
   - Session is cleared from localStorage.
   - User redirected to login page.

---

## Notes

- Users only see messages for the room they joined.
- Private messages are visible only to sender and receiver.
- Room history loads from MongoDB when joining a room.
- Incognito mode does not affect MongoDB storage (only affects localStorage session).

---
 ## Created by
 MANVI PRAKASH
