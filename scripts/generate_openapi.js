const fs = require('fs');

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description: 'TaskFlow backend API documentation with authentication and task management routes.'
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local development' }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Returns service status.',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    status: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    environment: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: { name: 'Demo User', email: 'demo@taskflow.com', password: 'senha123' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
                example: {
                  success: true,
                  message: 'Conta criada com sucesso.',
                  data: {
                    user: {
                      id: 'aea2d84a-7228-4124-9fbd-8c8ce5f475a0',
                      name: 'Demo User',
                      email: 'demo@taskflow.com',
                      createdAt: '2026-06-19T21:05:14.225Z'
                    },
                    token: '<jwt-token>'
                  }
                }
              }
            }
          },
          '409': {
            description: 'Conflict - email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { email: 'demo@taskflow.com', password: 'senha123' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
                example: {
                  success: true,
                  message: 'Login realizado com sucesso.',
                  data: {
                    user: {
                      id: 'aea2d84a-7228-4124-9fbd-8c8ce5f475a0',
                      name: 'Demo User',
                      email: 'demo@taskflow.com',
                      createdAt: '2026-06-19T21:05:14.225Z'
                    },
                    token: '<jwt-token>'
                  }
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Get authenticated user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeResponse' }
              }
            }
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/tasks': {
      get: {
        summary: 'List authenticated user tasks',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['all', 'active', 'completed'] },
            description: 'Optional task status filter'
          }
        ],
        responses: {
          '200': {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskListResponse' }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new task',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
              example: { title: 'Comprar leite' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          }
        }
      }
    },
    '/api/tasks/{id}': {
      put: {
        summary: 'Update a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
              example: { title: 'Título atualizado', completed: true }
            }
          }
        },
        responses: {
          '200': {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a task',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '204': { description: 'Task deleted' },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/tasks/{id}/toggle': {
      patch: {
        summary: 'Toggle task completed status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': {
            description: 'Task toggled',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskResponse' }
              }
            }
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' }
        }
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          completed: { type: 'boolean' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          completed: { type: 'boolean' },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              token: { type: 'string' }
            }
          }
        }
      },
      MeResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' }
            }
          }
        }
      },
      TaskResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              task: { $ref: '#/components/schemas/Task' }
            }
          }
        }
      },
      TaskListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              tasks: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'integer' },
                  completed: { type: 'integer' },
                  active: { type: 'integer' }
                }
              }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  }
};
const data = JSON.stringify(openapi, null, 2);
fs.writeFileSync('src/docs/openapi.json', data, 'utf8');
console.log('openapi.json generated:', data.length, 'bytes');
