Version 2.1
---
Addition of automatic image generation with 1, 30, and 365 day RSAM plots.

Required steps for upgrade from Version 2:
* Change directory to cloned repository location
* Get updates using `git pull` 
* Add new variables to .env file:
** IMAGE_DIR: Directory on system where images will be written to, e.g. `IMAGE_DIR=./images`
** IMAGE_WIDTH: Desired width of image, e.g. `IMAGE_WIDTH=800`
** IMAGE_HEIGHT: Desired height of image, e.g. `IMAGE_HEIGHT=400`
** This is where generated image files will go
* `docker-compose build`
* `docker-compose up -d`

Version 2
---
Containerized version of the application to simplify installation.  

Version 1
---
Original version of ffRSAM application. Requires separate installation of each component.