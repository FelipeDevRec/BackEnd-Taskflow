const fs = require('fs');
const data = `{
  "openapi": "3.0.3",
  "info": {
    "title": "TaskFlow API",
    "version": "1.0.0",
    "description": "REST API for TaskFlow — authentication and task management using Supabase as the backend."
  },
  "servers": [
    { "url": "http://localhost:3000", "description": "Local development" }
  ],
  "paths": {
    "/health": {
      "get": {
        "summary": "Health check",
        "responses": {
          "200": {
            "description": "OK",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Health" }, "example": { "success": true, "status": "ok", "timestamp": "2026-06-19T21:05:12.189Z", "environment": "development" } } }
          }
        }
      }
    },
    "/api/auth/register": {
      "post": {
        "summary": "Register a new user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/RegisterRequest" },
              "example": { "name": "Demo User", "email": "demo@taskflow.com", "password": "senha123" }
            }
          }
        },
        "responses": {
          "201": { "description": "Created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" }, "example": { "success": true, "message": "Conta criada com sucesso.", "data": { "user": { "id": "aea2d84a-7228-4124-9fbd-8c8ce5f475a0", "name": "Demo User", "email": "demo@taskflow.com", "createdAt": "2026-06-19T21:05:14.225Z" }, "token": "<jwt-token>" } } } } },
          "4xx": { "description": "Client error" }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "summary": "Log in",
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LoginRequest" }, "example": { "email": "demo@taskflow.com", "password": "senha123" } } }
        },
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" }, "example": { "success": true, "message": "Login realizado com sucesso.", "data": { "user": { "id": "aea2d84a-7228-4124-9fbd-8c8ce5f475a0", "name": "Demo User", "email": "demo@taskflow.com", "createdAt": "2026-06-19T21:05:14.225Z" }, "token": "<jwt-token>" } } } } },
          "401": { "description": "Unauthorized" }
        }
      }
    },
    "/api/auth/me": {
      "get": {
        "summary": "Get current user",
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/MeResponse" } } } },
          "401": { "description": "Unauthorized" }
        }
      }
    },
    "/api/tasks": {
      "get": {
        "summary": "List tasks for the authenticated user",
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          { "name": "status", "in": "query", "schema": { "type": "string", "enum": ["all","active","completed"] }, "required": false }
        ],
        "responses": {
          "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TaskListResponse" }, "example": { "success": true, "message": "Operação realizada com sucesso", "data": { "tasks": [ { "id": "08adb295-2f51-40aa-9fb5-d8ef3733d451", "title": "Teste via script", "completed": false, "userId": "aea2d84a-7228-4124-9fbd-8c8ce5f475a0", "createdAt": "2026-06-19T21:05:15.330Z", "updatedAt": "2026-06-19T21:05:15.330Z" } ], "meta": { "total": 1, "completed": 0, "active": 1 } } } } } }
        }
      },
      "post": {
        "summary": "Create a new task",
        "security": [{ "bearerAuth": [] }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/CreateTaskRequest" }, "example": { "title": "Comprar leite" } } } },
        "responses": { "201": { "description": "Created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TaskResponse" }, "example": { "success": true, "message": "Tarefa criada com sucesso.", "data": { "task": { "id": "08adb295-2f51-40aa-9fb5-d8ef3733d451", "title": "Comprar leite", "completed": false, "userId": "aea2d84a-7228-4124-9fbd-8c8ce5f475a0", "createdAt": "2026-06-19T21:05:15.330Z", "updatedAt": "2026-06-19T21:05:15.330Z" } } } } } } }
      }
    },
    "/api/tasks/{id}": {
      "put": {
        "summary": "Update a task",
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/UpdateTaskRequest" }, "example": { "title": "Título atualizado", "completed": true } } } },
        "responses": { "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TaskResponse" }, "example": { "success": true, "message": "Tarefa atualizada com sucesso.", "data": { "task": { "id": "08adb295-2f51-40aa-9fb5-d8ef3733d451", "title": "Título atualizado", "completed": true, "userId": "aea2d84a-7228-4124-9fbd-8c8ce5f475a0", "createdAt": "2026-06-19T21:05:15.330Z", "updatedAt": "2026-06-19T21:06:00.000Z" } } } } } }
      },
      "delete": {
        "summary": "Delete a task",
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "204": { "description": "No Content" }, "404": { "description": "Not Found" } }
      }
    },
    "/api/tasks/{id}/toggle": {
      "patch": {
        "summary": "Toggle task completed",
        "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "200": { "description": "OK", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TaskResponse" } } } } }
      }
    }
  },
  "components": {
    "securitySchemes": { "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" } },
    "schemas": {
      "Health": { "type": "object", "properties": { "success": { "type": "boolean" }, "status": { "type": "string" }, "timestamp": { "type": "string" }, "environment": { "type": "string" } } },
      "RegisterRequest": { "type": "object", "required": ["name","email","password"], "properties": { "name": { "type": "string" }, "email": { "type": "string", "format": "email" }, "password": { "type": "string" } } },
      "LoginRequest": { "type": "object", "required": ["email","password"], "properties": { "email": { "type": "string", "format": "email" }, "password": { "type": "string" } } },
      "User": { "type": "object", "properties": { "id": { "type": "string" }, "name": { "type": "string" }, "email": { "type": "string" }, "createdAt": { "type": "string", "format": "date-time" } } },
      "AuthResponse": { "type": "object", "properties": { "success": { "type": "boolean" }, "message": { "type": "string" }, "data": { "type": "object", "properties": { "user": { "$ref": "#/components/schemas/User" }, "token": { "type": "string" } } } } },
      "MeResponse": { "type": "object", "properties": { "success": { "type": "boolean" }, "data": { "type": "object", "properties": { "user": { "$ref": "#/components/schemas/User" } } } } },
      "Task": { "type": "object", "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "completed": { "type": "boolean" }, "userId": { "type": "string" }, "createdAt": { "type": "string", "format": "date-time" }, "updatedAt": { "type": "string", "format": "date-time" } } },
      "TaskResponse": { "type": "object", "properties": { "success": { "type": "boolean" }, "message": { "type": "string" }, "data": { "type": "object", "properties": { "task": { "$ref": "#/components/schemas/Task" } } } } },
      "TaskListResponse": { "type": "object", "properties": { "success": { "type": "boolean" }, "message": { "type": "string" }, "data": { "type": "object", "properties": { "tasks": { "type": "array", "items": { "$ref": "#/components/schemas/Task" } }, "meta": { "type": "object", "properties": { "total": { "type": "integer" }, "completed": { "type": "integer" }, "active": { "type": "integer" } } } } } } },
      "CreateTaskRequest": { "type": "object", "required": ["title"], "properties": { "title": { "type": "string" } } },
      "UpdateTaskRequest": { "type": "object", "properties": { "title": { "type": "string" }, "completed": { "type": "boolean" } } }
    }
  }
}`;
fs.writeFileSync('./src/docs/openapi.json', data, 'utf8');
console.log('openapi.json overwritten, len', data.length);
