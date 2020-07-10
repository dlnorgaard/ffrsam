# ffRSAM - backend container containing Python and cron jobs
# 
FROM ubuntu:bionic
LABEL maintainer="dnorgaard@usgs.gov"
WORKDIR /
ENV TZ=UTC \
DEBIAN_FRONTEND=noninteractive
# install packages
RUN apt-get -y update && apt-get -y install \
	python3 \
        python3-pip \
        libmysqlclient-dev \
        curl 

# install obspy 
# see https://github.com/obspy/obspy/wiki/Installation-on-Linux-via-Apt-Repository 
RUN echo "deb http://deb.obspy.org bionic main" >> /etc/apt/sources.list  && \
curl -fsSLO https://raw.githubusercontent.com/obspy/obspy/master/misc/debian/public.key && \
apt-key add ./public.key && \
apt-get -y update && \
apt-get -y install python3-obspy 

# install other python packages
RUN pip3 install mysqlclient pandas psutil plotly 

# Plotly dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        xvfb \
        xauth \
        libgtk2.0-0 \
        libxtst6 \
        libxss1 \
        libgconf-2-4 \
        libnss3 \
        libasound2
RUN mkdir -p /opt/orca && \
    cd /opt/orca && \
    wget https://github.com/plotly/orca/releases/download/v1.2.1/orca-1.2.1-x86_64.AppImage && \
    chmod +x orca-1.2.1-x86_64.AppImage && \
    ./orca-1.2.1-x86_64.AppImage --appimage-extract && \
    rm orca-1.2.1-x86_64.AppImage && \
    printf '#!/bin/bash \nxvfb-run --auto-servernum --server-args "-screen 0 640x480x24" /opt/orca/squashfs-root/app/orca "$@"' > /usr/bin/orca && \
    chmod +x /usr/bin/orca && \
    chmod -R 777 /opt/orca

# create ffrsam group & user
RUN groupadd -g 2020 ffrsam \
&& useradd -m -u 2020 -g ffrsam ffrsam 

# install supercronic
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.1.9/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=5ddf8ea26b56d4a7ff6faecdd8966610d5cb9d85

RUN curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# copy crontab
COPY crontab.txt /app/crontab

# start supercronic
USER ffrsam
CMD [ "supercronic", "/app/crontab" ]

# DONE
