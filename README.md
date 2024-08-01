# Microservices Auction System

This project is a microservices-based auction system with real-time bidding, notifications, and secure access. It includes multiple services, including User, Admin, Product, Order, and Auction services. 

## Project Structure


## Services

### 1. User Service

**Port:** 3000

- **Endpoints:**
  - `POST /users/register`: Register a new user.
  - `POST /users/login`: Login a user and get a JWT token.
  - `GET /users/profile`: Get user profile information.
  - `PUT /users/profile`: Update user profile.

**Dependencies:**
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing

### 2. Admin Service

**Port:** 3001

- **Endpoints:**
  - `GET /admin/users`: Get all users (admin only).
  - `PUT /admin/users/:id`: Update user information (admin only).
  - `DELETE /admin/users/:id`: Delete a user (admin only).
  - `POST /admin/products`: Add a new product (admin only).
  - `PUT /admin/products/:id`: Update product information (admin only).
  - `DELETE /admin/products/:id`: Delete a product (admin only).

**Dependencies:**
- PostgreSQL
- JWT for authentication

### 3. Product Service

**Port:** 3002

- **Endpoints:**
  - `POST /products`: Add a new product.
  - `GET /products`: Get all products.
  - `GET /products/:id`: Get product details by ID.
  - `PUT /products/:id`: Update product details.
  - `DELETE /products/:id`: Delete a product.

**Dependencies:**
- PostgreSQL
- JWT for admin authentication

### 4. Order Service

**Port:** 3003

- **Endpoints:**
  - `POST /orders`: Create a new order.
  - `GET /orders`: Get all orders for the authenticated user.
  - `GET /orders/:id`: Get order details by ID.
  - `PUT /orders/:id`: Update order details.
  - `DELETE /orders/:id`: Delete an order.

**Dependencies:**
- PostgreSQL
- JWT for authentication

### 5. Auction Service

**Port:** 3004

- **Endpoints:** Real-time auction via Socket.io.
  - `POST /auction/join`: Join an auction.
  - `POST /auction/bid`: Place a bid.

**Dependencies:**
- PostgreSQL
- Redis for caching and message queuing
- Socket.io for real-time communication

## Running the Project

### Prerequisites

- Node.js
- Docker and Docker Compose
- PostgreSQL
- Redis

### Setup

1. **Install Dependencies:**

   Navigate to each service directory and run:
   ```bash
   npm install
