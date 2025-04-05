# BumpData API Documentation

This document contains the JSDoc annotations needed for Swagger documentation.

## Authentication Endpoints

### Register
```javascript
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               email:
 *                 type: string
 *                 format: email
 *               fullName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or username already exists
 */
```

### Login
```javascript
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Authentication failed
 */
```

### Logout
```javascript
/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
```

### Get Current User
```javascript
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Not authenticated
 */
```

## Dataset Management

### Upload Dataset
```javascript
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a new dataset
 *     tags: [Datasets]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file to upload
 *     responses:
 *       201:
 *         description: Dataset uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: Authentication required
 */
```

### Get User's Datasets
```javascript
/**
 * @swagger
 * /datasets:
 *   get:
 *     summary: Get all datasets for current user
 *     tags: [Datasets]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of datasets
 *       401:
 *         description: Authentication required
 */
```

### Delete Dataset
```javascript
/**
 * @swagger
 * /datasets/{id}:
 *   delete:
 *     summary: Delete a dataset
 *     tags: [Datasets]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dataset ID
 *     responses:
 *       200:
 *         description: Dataset deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to delete this dataset
 *       404:
 *         description: Dataset not found
 */
```

## Data Analysis

### Get Valid Techniques
```javascript
/**
 * @swagger
 * /constraints/{datasetId}:
 *   get:
 *     summary: Get valid analysis techniques for a dataset
 *     tags: [Analysis]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dataset ID
 *     responses:
 *       200:
 *         description: List of valid techniques
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Dataset not found
 */
```

### Get Dataset Schema
```javascript
/**
 * @swagger
 * /schema/{datasetId}:
 *   get:
 *     summary: Get schema information for a dataset
 *     tags: [Analysis]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dataset ID
 *     responses:
 *       200:
 *         description: Schema information for the dataset
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Dataset or schema not found
 */
```

### Run Analysis Technique
```javascript
/**
 * @swagger
 * /run/{technique}/{datasetId}:
 *   post:
 *     summary: Run an analysis technique on a dataset
 *     tags: [Analysis]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: technique
 *         required: true
 *         schema:
 *           type: string
 *         description: Analysis technique to run
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dataset ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Technique-specific parameters
 *     responses:
 *       200:
 *         description: Analysis results
 *       400:
 *         description: Invalid technique or parameters
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Dataset not found
 *       500:
 *         description: Error running technique
 */
```

## Admin Operations

### Get All Users (Admin Only)
```javascript
/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
```