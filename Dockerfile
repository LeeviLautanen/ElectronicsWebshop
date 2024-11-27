# Building frontend
FROM node:latest AS build-stage

WORKDIR /app

COPY ./client ./client
RUN cd client && npm ci && npm run build --prod

# Building/running backend
FROM node:latest AS production-stage

WORKDIR /app

COPY ./server ./server

RUN cd server && npm ci

COPY --from=build-stage /app/client/dist/client/browser ./server/dist

EXPOSE 3000

CMD ["node", "server/server.js"]