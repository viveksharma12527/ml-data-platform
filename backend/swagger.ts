import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VT-Annotator API',
      version: '1.0.0',
      description: 'API documentation for the VT-Annotator application',
    },
    servers: [
      {
        url: 'http://localhost:5006',
      },
    ],
  },
  apis: ['./src/**/*.ts'], // files containing annotations as above
};

export const swaggerSpec = swaggerJsdoc(options);