# Use the official Node.js devcontainer image as base
FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

# Ensure the vscode user exists (in case features don't create it)
RUN id vscode || useradd -m -s /bin/bash vscode

# Switch to vscode user
USER vscode