import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ML Data Platform API',
      version: '1.0.0',
      description: 'Machine Learning Data Annotation Platform API Documentation',
    },
    components: {
      schemas: {
        // User schemas
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              type: 'string',
              enum: ['annotator', 'data_specialist', 'admin', 'ml_engineer'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertUser: {
          type: 'object',
          required: ['name', 'firstName', 'lastName', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['annotator', 'data_specialist', 'admin', 'ml_engineer'],
            },
          },
        },

        // Project schemas
        Project: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
            },
            labelTypeId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'completed'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertProject: {
          type: 'object',
          required: ['name', 'labelTypeId'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            labelTypeId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'completed'],
            },
          },
        },

        // Label schemas
        Label: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertLabel: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
          },
        },

        // Label Class schemas
        LabelClass: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            labelTypeId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertLabelClass: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
            },
          },
        },

        // Image schemas
        Image: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            filename: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertImage: {
          type: 'object',
          required: ['filename', 'url'],
          properties: {
            filename: {
              type: 'string',
            },
            url: {
              type: 'string',
            },
          },
        },

        // Project Image schemas
        ProjectImage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            projectId: {
              type: 'string',
              format: 'uuid',
            },
            imageId: {
              type: 'string',
              format: 'uuid',
            },
            assignedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertProjectImage: {
          type: 'object',
          required: ['imageId'],
          properties: {
            imageId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
        InsertProjectImages: {
          type: 'object',
          required: ['imageIds'],
          properties: {
            imageIds: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uuid',
              },
              minItems: 1,
            },
          },
        },

        // Annotation schemas
        Annotation: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            projectId: {
              type: 'string',
              format: 'uuid',
            },
            imageId: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            labelId: {
              type: 'string',
              format: 'uuid',
            },
            labelClassesId: {
              type: 'string',
              format: 'uuid',
            },
            annotatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertAnnotation: {
          type: 'object',
          required: ['projectId', 'imageId', 'labelId', 'labelClassesId'],
          properties: {
            projectId: {
              type: 'string',
              format: 'uuid',
            },
            imageId: {
              type: 'string',
              format: 'uuid',
            },
            labelId: {
              type: 'string',
              format: 'uuid',
            },
            labelClassesId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },

        // Project Assignment schemas
        ProjectAssignment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            projectId: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            assignedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        InsertProjectAssignment: {
          type: 'object',
          required: ['projectId'],
          properties: {
            projectId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },

        // Response schemas
        PortfolioImage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            url: {
              type: 'string',
            },
            projectName: {
              type: 'string',
            },
            uploadedAt: {
              type: 'string',
              format: 'date-time',
            },
            annotationCount: {
              type: 'integer',
            },
          },
        },
        PortfolioStats: {
          type: 'object',
          properties: {
            totalProjects: {
              type: 'integer',
            },
            totalImages: {
              type: 'integer',
            },
            totalAnnotations: {
              type: 'integer',
            },
          },
        },

        projectStats: {
          type: 'object',
          properties: {
            numberOfImages: {
              type: 'integer',
            },
            annotatedImages: {
              type: 'integer',
            },
            totalAnnotations: {
              type: 'integer',
            },
            activeAnnotators: {
              type: 'integer',
            },
          },
        },
        // Error response schema
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },

        // Success response schema
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Unauthorized',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Validation failed',
                details: [
                  {
                    field: 'email',
                    message: 'Invalid email format',
                  },
                ],
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                success: false,
                error: 'Resource not found',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    
    
  },
  apis: ['./backend/src/routes/*.ts', './backend/routes.ts'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;