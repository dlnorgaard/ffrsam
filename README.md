# ffRSAM

ffRSAM is a web-based application to allow users to view plots of pre-calculated Real-time Seismic-Amplitude Measurement (RSAM) and frequency filtered (ff) RSAM.  The system has a back-end Python script run by cron jobs to retrieve trace data from a wave server (e.g. Winston), calculate RSAM and ff RSAM based on pre-determined frequency bands, and store the calculated values in a MariaDB database.  The front-end, or user interface, is a web-application written in plain HTML and JavaScript. REST API written in PHP is used to query the database.

The components (backend, frontend, database) of ffRSAM run as Docker containers.

## System Requirements

Docker Engine (see https://www.docker.com/)

This application is meant to run on a centralized server so the website can be accessed by everyone in the observatory.

## Installation Instructions

Select your installation directory and clone ffrsam repository:

```
git clone https://code.usgs.gov/vsc/ffrsam.git
cd ffrsam
```

Build the docker images:

```
docker-compose up -d
```

Verify the 3 components are running:

``` 
D:\Programs\docker\ffrsam>docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                    PORTS                   NAMES
9ba90bbdd75d        ffrsam_frontend     "docker-php-entrypoi…"   39 minutes ago      Up 39 minutes (healthy)   0.0.0.0:16050->80/tcp   ffrsam-frontend
a1542ae979c1        ffrsam_backend      "supercronic /app/cr…"   46 minutes ago      Up 40 minutes                                     ffrsam-backend
4d074b213ee7        mariadb:latest      "docker-entrypoint.s…"   26 hours ago        Up 40 minutes             3306/tcp                ffrsam-db
```

The following containers should be running: ffrsam-frontend, ffrsam-backend, ffrsam-db.

## Troubleshooting

### Checking logs

To view logs

``` 
docker logs <container name>

```
### Connecting to container

```
docker exec -it <container name> /bin/bash
```