# BumpData Documentation

Welcome to the BumpData documentation. This guide provides comprehensive information about the application's architecture, workflows, and functionality.

## Table of Contents

1. [Introduction](#introduction)
2. [Application Architecture](#application-architecture)
3. [User Interface & Wireframes](./wireframes.md)
4. [Input/Output Workflow](./input-output-workflow.md)
5. [Customer Service/Experience Workflow](./cs-cx-workflow.md)
6. [Modeling and Visualization Logic](./modeling-visualization.md)
7. [Technical Details](./technical-details.md)

## Introduction

BumpData is a full-stack web application designed to provide a modern implementation of data analysis capabilities similar to Stata. The application allows users to upload datasets, perform various analyses, and visualize results through an intuitive interface. The system supports multiple analysis techniques and offers comprehensive visualization options.

### Key Features

- User authentication (sign up, sign in, guest access)
- Dataset management (upload, view, delete)
- Target column selection for analysis
- Multiple analysis techniques (classification, regression, clustering, etc.)
- Results visualization (charts, tables, statistics, explanations)
- Output filtering by type
- Theme customization (light/dark mode)
- Admin functionality for user management

## Application Architecture

BumpData follows a modern full-stack architecture with clear separation of concerns:

### Frontend
- React with TypeScript
- Context-based state management
- TanStack Query for API communication
- Shadcn UI components with Tailwind CSS
- Recharts for data visualization

### Backend
- Express.js server
- Python execution environment for ML models
- RESTful API endpoints
- PostgreSQL database with Drizzle ORM

### Data Flow
- User uploads data via the frontend
- Backend processes data and provides schema information
- System analyzes what techniques are applicable
- Frontend displays available techniques
- User selects technique to run
- Backend executes technique and returns results
- Frontend renders results in appropriate format (chart, table, text, stats)

For more detailed information, please refer to the specific documentation sections.
