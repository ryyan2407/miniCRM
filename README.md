# miniCRM

miniCRM is a simplified Customer Relationship Management (CRM) application designed to manage leads and automate workflows.

## Features

*   **Lead Management:** Add, delete, and update lead information.
*   **Document Uploader:** Import leads from documents.
*   **Chat Popup:** Interact with a simulated CRM assistant.
*   **Workflow Designer:**
    *   Visually design workflows with "Lead Created" triggers and "Send Email" or "Update Status" actions.
    *   Add up to three nodes.
    *   Connect nodes via clicks.
    *   Visual simulation of workflow execution with highlighting nodes and edges.
    *   Toast notifications for workflow actions.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js**: [https://nodejs.org/](https://nodejs.org/) (LTS version recommended)
*   **npm** (Node Package Manager) or **Yarn**: npm comes with Node.js, or you can install Yarn globally: `npm install -g yarn`

## Installation

Follow these steps to get miniCRM up and running on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd miniCRM
    ```
    (Replace `<repository_url>` with the actual URL of your Git repository.)

2.  **Navigate to the application directory:**
    ```bash
    cd mini-crm
    ```

3.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using Yarn:
    ```bash
    yarn install
    ```

## Running the Application

To start the development server and view the application in your browser:

```bash
npm start
```
Or using Yarn:
```bash
yarn start
```

The application will typically open in your browser at `http://localhost:3000`.

## Available Scripts

In the `mini-crm` project directory, you can run:

*   `npm start` or `yarn start`: Runs the app in development mode.
*   `npm run build` or `yarn build`: Builds the app for production to the `build` folder.
*   `npm test` or `yarn test`: Launches the test runner.
*   `npm run eject` or `yarn eject`: Removes the single build dependency from your project.
