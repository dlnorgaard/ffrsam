# ffRSAM

ffRSAM is a web-based application to allow users to view plots of pre-calculated Real-time Seismic-Amplitude Measurement (RSAM) and frequency filtered (ff) RSAM.  The system has a back-end Python script run by cron jobs to retrieve trace data from a wave server (e.g. Winston), calculate RSAM and ff RSAM based on pre-determined frequency bands, and store the calculated values in a MariaDB database.  The front-end, or user interface, is a web-application written in plain HTML and JavaScript. REST API written in PHP is used to query the database.

The components (backend, frontend, database) of ffRSAM run as Docker containers.

## System Requirements

Docker and Docker Compose 

- https://www.docker.com/
- https://docs.docker.com/get-docker/
- https://docs.docker.com/compose/install/

This application is meant to run on a centralized server so the website can be accessed by everyone in the observatory.  It needs to run continuously to process new data so it is not suitable for desktop installation.

Minimum recommended computer specifications:

- 5 GB disk space
- 128 MB RAM
- 1 CPU

## Installation Instructions

### Clone repository

Select your installation directory and clone ffrsam repository.  Change directory into the respository.

```
git clone https://code.usgs.gov/vsc/ffrsam.git
cd ffrsam
```

### Configure environment

Copy template.env to .env 

```
cp template.env .env
```

Edit the .env file.

- DB_USER is the database user with permissions to the database.
- DB_PASSWORD is the database user password.
- ROOT_PASSWORD is the mysql root password to use. 
- WEB_PORT is the port the web service will run on.  16050 is the default but can be changed.
- DATA_DIR is the directory on the physical or virtual machine where the mysql data files will be written to.  This directory must exist on the server and should be allocated sufficient space for data and growth.  1GB is a good place to start but more space may need to be allocated over time depending on the number of channels that are being stored.

Example (do not use the same passwords as below): 
  
```
DB_USER=rsamuser
DB_PASSWORD=rsampassword
ROOT_PASSWORD=rootpwd
WEB_PORT=16050
DATA_DIR=./data
```
 
### Configure application

Create config.py

```
cd backend/src
cp config_template.py config.py
```

Edit config.py

- buffer � This variable specifies the potential latency, i.e. time between when seismic trace data is obtained at the station to when the data reaches the wave server.  Larger value here will help accommodate potential delays in the data acquisition process.  Default value is 20 minutes.
- wave_server � Multiple wave server information can be stored here.  Example configuration is provided but should be replaced with the information (name, host, port) of the actual wave server where the trace data is stored.
- default_bands � These are the default bands that will be used to calculate the ff RSAM data. It is not recommended to change this value.  Default bands are [[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]].
- channels � The channels for which the rsam will be calculated are specified here.  Examples are provided but should be replaced with channels in your wave server.  RSAM calculations are typically performed on the vertical (Z) component of a station.

### Build and run images

Build the docker images:

```
docker-compose build
docker-compose up -d
```

### Check application is running properly

Verify the 3 components are running:

``` 
D:\Programs\docker\ffrsam>docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                    PORTS                   NAMES
9ba90bbdd75d        ffrsam_frontend     "docker-php-entrypoi�"   39 minutes ago      Up 39 minutes (healthy)   0.0.0.0:16050->80/tcp   ffrsam-frontend
a1542ae979c1        ffrsam_backend      "supercronic /app/cr�"   46 minutes ago      Up 40 minutes                                     ffrsam-backend
4d074b213ee7        mariadb:latest      "docker-entrypoint.s�"   26 hours ago        Up 40 minutes             3306/tcp                ffrsam-db
```

The following containers should be running: 

- ffrsam-frontend
- ffrsam-backend
- ffrsam-db

The application can be accessed via the web port, e.g.:

http://localhost:16050 or http://hostname:16050

In order to ensure that other hosts on the network can access this, be sure to have the firewall open for port 16050 on the server.

## Troubleshooting

### Checking logs

``` 
docker logs <container name>

```
### Connecting to container

```
docker exec -it <container name> /bin/bash
```