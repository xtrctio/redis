#!/usr/bin/env bash
docker rm -f redis
docker pull redislabs/redisearch:latest
docker run -d --name redis -p 6379:6379 redislabs/redisearch:latest
