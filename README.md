# Ballot Dropbox API

This project contains the backend API endpoints for the ballot-dropbox project.  It is written in TypeScript and uses
the npm serverless project to deploy the lambdas to AWS.

## Pre-requisites

Create a `.env` file in the root with the following:
```text
GOOGLE_GEOCODE_API_KEY=<your_key>
```