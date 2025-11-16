import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0',
      description: 'A simple Express API application documented with Swagger',
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['annotator', 'data_specialist'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertUser: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['annotator', 'data_specialist'],
            },
          },
        },
        Label: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            projectId: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
        },
        InsertLabel: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./backend/src/routes/*.ts', './backend/routes.ts'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;