Updated Finance Backend

Overview

This is the backend for the MangopayNewDomo application, a real estate investment platform that allows users to purchase tokenized shares of real estate projects. The backend handles critical business logic such as wallet management, blockchain interactions, and MangoPay integration.

Core Features

MangoPay Integration:
Wallet top-ups.
Token purchases via MangoPay wallets.

Blockchain Interactions:

Tokenized share purchases using MetaMask and Web3.
Smart contract interactions.

Firebase Integration:

Real-time updates for investment tracking.
Cloud Functions for scalable backend logic.

NestJS Framework:

A robust and scalable architecture for API development.

Project Structure
Here is an overview of the main directories:

authentication/: Handles user authentication logic.
bank/: Manages banking-related operations.
blockchain/: Contains blockchain-specific logic and interactions.
creditcard/: Handles credit card operations for payments.
email/: Manages email notifications.
firebase/: Contains Firebase integration logic.
mangopay/: Manages MangoPay wallet and transaction logic.
notifications/: Handles system and user notifications.
projects/: Manages project-related data and logic.
public/: Static files.
redsys/: Manages integration with Redsys payment gateway.
utils/: Utility functions and reusable logic.

Getting Started

Follow these steps to set up the backend locally.

Prerequisites

Node.js: Ensure Node.js is installed on your machine.

NestJS CLI: Install NestJS CLI globally using:

npm install -g @nestjs/cli
MongoDB: Install MongoDB for database operations (if required).

Installation
Clone the repository:

git clone https://github.com/yourusername/MangopayNewDomo-backend.git

cd MangopayNewDomo-backend
Install dependencies:

npm install


FIREBASE_CONFIG=your_firebase_configuration
MANGOPAY_API_KEY=your_mangopay_api_key
WEB3_PROVIDER_URL=your_web3_provider_url
Running the Application
Start the server in development mode:


npm run start:dev

The backend will be available at http://localhost:3000.

API Endpoints

Here are some key API endpoints:

Authentication:

POST /auth/login: User login.
POST /auth/register: User registration.

Wallets:

POST /wallet/top-up: Top up a MangoPay wallet.
GET /wallet/balance: Retrieve wallet balance.

Projects:

GET /projects: Fetch all real estate projects.
POST /projects/invest: Invest in a project.

Blockchain:

POST /blockchain/transaction: Initiate a blockchain transaction.

Built With

NestJS: Backend framework for scalable APIs.
Firebase: Real-time database and cloud functions.
Web3.js: Library for blockchain interactions.
MangoPay: Payment gateway for secure transactions.

Contributing

Contributions are welcome! Follow these steps to contribute:

Fork the repository.
Create your feature branch:
git checkout -b feature/AmazingFeature
Commit your changes:
git commit -m 'Add some AmazingFeature'
Push to the branch:
git push origin feature/AmazingFeature

Open a Pull Request.

License

Distributed under the MIT License. See LICENSE for more information.
