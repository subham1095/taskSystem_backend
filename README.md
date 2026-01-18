# Node-Assigned Distributed Task System

## Overview
A secure distributed task system where tasks can only be executed and updated by the node explicitly assigned to them.

## Features
- Strong node authentication (JWT)
- Node-specific task access
- Idempotent task updates
- Failover-safe task locking
- Admin reassignment

## Tech Stack
- Node.js
- Express
- MongoDB
- JWT

## Run
npm install
node server.js

## APIs
POST /tasks
GET /tasks
PATCH /tasks/:id/status
POST /tasks/:id/reassign
