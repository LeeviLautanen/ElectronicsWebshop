# Building backend
FROM node:latest AS backend-stage

WORKDIR /app

COPY ./server ./server

RUN cd server && npm ci

# Building frontend
FROM node:latest AS frontend-stage

WORKDIR /app

COPY ./client ./client
RUN cd client && npm ci && npm run build-prod

# Running backend
EXPOSE 3000

WORKDIR /app/server

CMD ["npm", "run", "start"]