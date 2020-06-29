# ffRSAM - backend container containing Python and cron jobs
# 
FROM ubuntu:bionic
LABEL maintainer="dnorgaard@usgs.gov"
WORKDIR /
# install packages
RUN apt-get -y update && \
apt-get -y install python3 python3-pip libmysqlclient-dev curl 

# install obspy 
# see https://github.com/obspy/obspy/wiki/Installation-on-Linux-via-Apt-Repository 
ENV TZ=UTC \
DEBIAN_FRONTEND=noninteractive
RUN echo "deb http://deb.obspy.org bionic main" >> /etc/apt/sources.list  && \
curl -fsSLO https://raw.githubusercontent.com/obspy/obspy/master/misc/debian/public.key && \
apt-key add ./public.key && \
apt-get -y update && \
apt-get -y install python3-obspy 

# install other python packages
RUN pip3 install mysqlclient

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
