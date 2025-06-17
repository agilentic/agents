# Branching Guide

This project uses **npm workspaces** to manage frontend and backend code in a single repository. The recommended way to organize work is to create a dedicated branch for each feature or task. For example:

```bash
git checkout -b feature/login
```

You can focus on changes in one workspace by specifying the `--workspace` flag when running `npm` scripts.

- `npm --workspace frontend run web` – start only the frontend
- `npm --workspace backend start` – start only the backend

When your branch is ready, open a pull request and merge back into `main`.
