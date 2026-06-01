# React + Vite Project

This project is built using React and Vite, providing a fast and efficient development environment with Hot Module Replacement (HMR) for instant updates during development.

## Features

* Fast development server powered by Vite
* React-based frontend architecture
* Hot Module Replacement (HMR) for a smoother development experience
* ESLint configuration for maintaining code quality and consistency

## Available React Plugins

This project can work with either of the official React plugins for Vite:

* **@vitejs/plugin-react** – Uses Oxc for fast React refresh and compilation.
* **@vitejs/plugin-react-swc** – Uses SWC for high-performance builds and development.

## React Compiler

The React Compiler is not enabled by default in this project to keep development and build times fast. If needed, it can be added later based on project requirements.

## Code Quality

ESLint is included to help maintain clean and consistent code. For larger production applications, migrating to TypeScript is recommended, as it provides better type safety and improved maintainability.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

