#!/usr/bin/env bash
docker rm -f redis
docker pull redis:5

docker run -d --name redis -p 6379:6379 redis:5
