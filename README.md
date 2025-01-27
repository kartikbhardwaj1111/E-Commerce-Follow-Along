New Feature Added:

--> Login Page:
A user-friendly login page has been added, featuring:

Email and password validation.

A "Show/Hide Password" toggle for enhanced user experience.

Error handling for invalid email format and password length.

Loading state to indicate the process of authentication.

Navigation to a signup page for new users.

--> Signup Functionality:

Passwords are securely hashed using bcrypt during signup to enhance security.

The hashed password is stored in the database instead of plain text.

Complete user data, including name, email, and other necessary information, is securely stored in the database.

--> File Upload Functionality:

Users can upload files securely via the application.

Uploaded files are validated for type and size restrictions to ensure security and compliance.

Files are stored in the server’s designated directory or cloud storage service.

Proper error handling ensures seamless user experience during upload failures.

Technologies Used:

React (Frontend)

Tailwind CSS (Styling)

React Router (Routing)

Express.js (Backend)

Stripe/PayPal (Payment Gateway)

bcrypt (Password Hashing)

Installation & Setup:

Clone the repository.

Run npm install to install dependencies.

Start the development server with npm start.

Ensure you have the necessary backend setup for user authentication, file upload handling, and database integration to manage hashed passwords, user data, and uploaded files securely.