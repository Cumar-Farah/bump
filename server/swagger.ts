import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'BumpData API',
        version: '1.0.0',
        description: 'API documentation for BumpData application',
      },
      servers: [
        {
          url: '/api',
          description: 'BumpData API Server',
        },
      ],
      security: [
        {
          cookieAuth: []
        }
      ]
    },
    apis: [
      './server/swagger-schemas.ts',
      './server/routes.ts', 
      './server/auth.ts'
    ],
  };

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Serve swagger.json for external documentation tools
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
};