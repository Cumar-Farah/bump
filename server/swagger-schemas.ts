/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated user ID
 *         username:
 *           type: string
 *           description: User's username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         password:
 *           type: string
 *           format: password
 *           description: Hashed password (not returned in responses)
 *         fullName:
 *           type: string
 *           description: User's full name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *
 *     Dataset:
 *       type: object
 *       required:
 *         - id
 *         - userId
 *         - filename
 *         - filesize
 *         - filePath
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated dataset ID
 *         userId:
 *           type: integer
 *           description: ID of the user who uploaded the dataset
 *         filename:
 *           type: string
 *           description: Original filename
 *         filesize:
 *           type: integer
 *           description: Size of the file in bytes
 *         filePath:
 *           type: string
 *           description: Path where the file is stored (not returned in responses)
 *         schemaData:
 *           type: string
 *           description: JSON string containing schema information
 *         rows:
 *           type: integer
 *           description: Number of rows in the dataset
 *         columns:
 *           type: integer
 *           description: Number of columns in the dataset
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Upload timestamp
 *
 *     Error:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *         details:
 *           type: string
 *           description: Additional error details
 *
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */

export {}; // This export is needed to make TypeScript treat this as a module