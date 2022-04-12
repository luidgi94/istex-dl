# istex-dl

[istex-dl](https://dl.istex.fr) is a web application dedicated to ISTEX sub-corpus extraction. It allows to download several [ISTEX](https://www.istex.fr) documents easily in an archive (zip or tar.gz) using a web interface.

## Prerequisites

- For debugging: Node.js >= 12
- For production: docker & docker-compose or [ezmaster](https://github.com/inist-cnrs/ezmaster)

## Development

```
npm install
npm start
```
Then istex-dl is listening at this URL: [http://127.0.0.1:3000](http://127.0.0.1:3000)

## Production

istex-dl is ezmasterized so you just have to deploy the latest [istex-dl docker image](https://hub.docker.com/r/istex/istex-dl) with [ezmaster](https://github.com/inist-cnrs/ezmaster).

If you don't use [ezmaster](https://github.com/inist-cnrs/ezmaster), you can deploy istex-dl with docker and docker-compose with the [docker-compose.yml file provided](./docker-compose.yml).
```
curl https://raw.githubusercontent.com/istex/istex-dl/master/docker-compose.yml > docker-compose.istex-dl.yml
docker-compose -f docker-compose.istex-dl.yml up -d
```
