# ffRSAM

ffRSAM is a web-based application to allow users to view plots of pre-calculated Real-time Seismic-Amplitude Measurement (RSAM) and frequency filtered (ff) RSAM. Two ways to view plots are provided:

* Pre-generated RSAM plots for 1 day, 1 month, and 1 year
* Interactive plots using custom querying tool  

## System Requirements

Access to a Wave Server for data source is required.  

Additionally, for the ffRSAM program, Docker and Docker Compose is required. 

- https://www.docker.com/
- https://docs.docker.com/get-docker/
- https://docs.docker.com/compose/install/

Podman and podman-compose will work as an alternative to Docker.  

This application is meant to run on a centralized server so the website can be accessed by everyone in the observatory.  It needs to run continuously to process new data so it is not suitable for desktop installation.

Minimum recommended computer specifications:

- 5 GB disk space
- 512 MB RAM
- 1 CPU

## Installation Instructions

### Clone repository

Select your installation directory (e.g. /opt is a good place for Linux) and clone ffrsam repository.  Change directory into the respository.

```
cd /opt
git clone https://github.com/dnorgaard-usgs/ffrsam.git
cd ffrsam
```
Or, if you have access to code.usgs.gov:

```
cd /opt
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
- WEB_PORT is the port the web service will run on.  17000 is the default but can be changed.
- DATA_DIR is the directory on the physical or virtual machine where the mysql data files will be written to.  This directory must exist on the server and should be allocated sufficient space for data and growth.  1GB is a good place to start but more space may need to be allocated over time depending on the number of channels that are being stored.
- IMAGE_DIR is the directory on the physical or virtual machine where the pre-generated images are written to.  This directory must exist on the server and should be allocated sufficient space for the images to be written. 2MB per channel configured is a good place to start.
- IMAGE_WIDTH is the desired width in pixels of the pre-generated images. Default is 1200.
- IMAGE_HEIGHT is the desired height in pixels of the pre-generated images. Default is 400.

Example (do not use the same passwords as below): 
  
```
DB_USER=rsamuser
DB_PASSWORD=rsampassword
ROOT_PASSWORD=rootpwd
WEB_PORT=17000
DATA_DIR=./data
IMAGE_DIR=./images
IMAGE_WIDTH=1200
IMAGE_HEIGHT=400
```

Notes: 

Make sure the data and image directories specified exist.  While this example places the data and images directory under /opt/ffrsam, you may want to consider creating these directories elsewhere on the server with more physical space.
 
```
cd /opt/ffrsam
mkdir data
mkdir images
```

The permissions on IMAGE_DIR specified must have writable permissions for all users. This is because the ffrsam-backend container that writes the images run as user with uid of 2020. Alternatively, you can create a user on your system with uid & gid of 2020 and set your image directory permissions writable by that user.

```
chmod a+w /opt/ffrsam/images
```
or

```
groupadd -g 2020 ffrsam
useradd -u 2020 -g 2020 ffrsam
chown -R ffrsam:ffrsam /opt/ffrsam/images
```


### Configure application

Create config.py

```
cd backend/src
cp config_template.py config.py
```

Edit config.py

- buffer – This variable specifies the potential latency, i.e. time between when seismic trace data is obtained at the station to when the data reaches the wave server.  Larger value here will help accommodate potential delays in the data acquisition process.  Default value is 20 minutes.
- wws – Multiple wave server information can be stored here.  Example configuration is provided but should be replaced with the information (name, host, port) of the actual wave server where the trace data is stored.
- bands – These are the default bands that will be used to calculate the ff RSAM data. It is not recommended to change this value.  Default bands are [[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]].
- channels – The channels for which the rsam will be calculated are specified here.  Examples are provided but should be replaced with channels in your wave server.  RSAM calculations are typically performed on the vertical (Z) component of a station.

### Build and run images

```
cd /opt/ffrsam
docker-compose build
docker-compose up -d
```

### Check application is running properly

Verify the 3 components are running:

``` 
D:\Programs\docker\ffrsam>docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                    PORTS                   NAMES
9ba90bbdd75d        ffrsam_frontend     "docker-php-entrypoi…"   39 minutes ago      Up 39 minutes (healthy)   0.0.0.0:17000->80/tcp   ffrsam-frontend
a1542ae979c1        ffrsam_backend      "supercronic /app/cr…"   46 minutes ago      Up 40 minutes                                     ffrsam-backend
4d074b213ee7        mariadb:latest      "docker-entrypoint.s…"   26 hours ago        Up 40 minutes             3306/tcp                ffrsam-db
```

The following containers should be running: 

- ffrsam-frontend
- ffrsam-backend
- ffrsam-db

The application can be accessed via the web port, e.g.:

http://localhost:17000 or http://hostname:17000

In order to ensure that other hosts on the network can access this, be sure to have the firewall open for port 17000 on the server.

For the pre-generated images, the day plot should begin populating after 10 minutes, the month plot after 1 hour, and year plot after 24 hours.  Unless back-populating is performed (see below), images will show data only from day of installation forward.

## Set up service

On some systems the containers do not automatically start on reboot or restart of docker engine. It is best to configure each of the containers to start on boot.

For CentOS 7 create ffrsam-db.service, ffrsam-frontend.service, and ffrsam-backend.service files in /etc/systemd/system:

Example ffrsam-db.service:

```
[Unit]
Description             = ffRSAM database

[Service]
WorkingDirectory        = /opt/ffrsam/
ExecStart               = docker start -a ffrsam-db
ExecStop                = docker stop ffrsam-db
```

The ffrsam-backend and ffrsam-frontend containers should ideally start after ffrsam-db container has started.  Additional 'After' and 'Requires' statements may be helpful.

Example ffrsam-frontend.service:

```
[Unit]
Description             = ffRSAM frontend
After                   = multi-user.target ffrsam-db.service
Requires                = ffrsam-db.service

[Service]
WorkingDirectory        = /opt/ffrsam/
ExecStart               = docker start -a ffrsam-frontend
ExecStop                = docker stop ffrsam-frontend

```

Example ffrsam-backend.service:

```
[Unit]
Description             = ffRSAM backend
After                   = multi-user.target ffrsam-db.service
Requires                = ffrsam-db.service

[Service]
WorkingDirectory        = /opt/ffrsam/
ExecStart               = docker start -a ffrsam-backend
ExecStop                = docker stop ffrsam-backend

```

## Back Populating

There are two ways to back populate ffRSAM data:

### All channels in config.py

Connect to ffrsam-backend container.

```
docker exec -it ffrsam-backend /bin/bash
```

Run ffrsam script from /opt/ffrsam.

Syntax: ./run.sh <period> <start time> <end time>

```
cd /opt/ffrsam
./run.sh 1440 20200701000000 20200731000000
```

In above example the first parameter, 1440 is the period in minutes, so 1 day period. This will also regenerate 1 year images. Allowed values for period:

- 10: 10 minute RSAMs (regenerate 1 day plot)
- 60: 1 hour RSAMs (regenerate 7 & 30 day plots)
- 240: 4 hour RSAMs
- 720: 12 hours RSAMs
- 1440: 24 hour RSAMs (regenerate 1 year plot)

The start and end time are simply in YYYYMMDDHHmmss format.  Be sure to use a time range that is available in Winston.  

### One channel

To populate past or gap periods, you can use the backend/src/back_populate.* scripts.  Edit the input parameters in back_populate.py:

Example:

```
# Input parameters
server=cfg.wws["AVO"]["server"]
port=cfg.wws["AVO"]["port"]
station='ACH'
channel='BHZ'
network='AV'
location='--'
start_time=UTCDateTime("20200626000000")
end_time=UTCDateTime("20200626040000")  #YYYYMMDDHHMMSS
period=3600 # In SECONDS
```

Then run either the back_populate.sh (Linux/Mac) or back_populate.bat (Windows) script.  It will automatically kick off the back_populate.py in the ffrsam-backend container.  It is recommended to run the file from a terminal or DOS prompt so that you can view the output as it runs.  Check the output for any errors.

Note: Editing this file may prevent you from pulling future updates in git.  If this happens simply revert the change with `git checkout -- back_populate.py`.

## Troubleshooting

### Checking logs

``` 
docker logs <container name>
docker logs -f <container name>
```
### Connecting to container

```
docker exec -it <container name> /bin/bash
```

## Podman

On CentOS 8, you can use Podman and podman-compose as an alternative:

```
yum install podman python
pip3 install podman-compose
```

Then replace all "docker" commands with "podman" and "docker-compose" commands with "podman-compose".