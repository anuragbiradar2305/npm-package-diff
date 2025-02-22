Get Package Diff

# Overview

This project provides an API to compare different versions of an NPM package. It retrieves metadata, dependency changes, and GitHub release details if available.

# Features

Fetch metadata of an NPM package
Retrieve GitHub release information (if applicable)
Compare dependencies between two versions
Generate GitHub comparison links for code changes

# Usage

Start the server:

       node server.js

if you are using Docker

To build and run the project using Docker:

       docker build -t package-diff-api .

Run the Container

      docker run -p 2305:2305 package-diff-api

Use Docker Compose

       docker-compose up --build -d (This command is used to build, recreate, and start Docker containers defined in a docker-compose.yml file.)

                OR

       docker-compose up (to up container if already image created)

# API Endpoint

GET /diff

Query Parameters:

    package (string) - The name of the NPM package
    version1 (string) - The older version
    version2 (string) - The newer version

# Example Request:

GET
http://localhost:2305/diff?package=express&version1=4.17.1&version2=5.0.0
