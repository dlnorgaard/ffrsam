import os, sys
from obspy.clients.earthworm import Client
from obspy.core import UTCDateTime
from obspy.core.stream import Stream
import numpy as np
import MySQLdb
import config as cfg

# Input parameters
server="192.168.0.3"
port=16024
station='FG8'
channel='BHZ'
network='GI'
location='00'
start_time=UTCDateTime("20190105190000")
end_time=UTCDateTime("20190705200000")
period=43200 # In SECONDS
bands=cfg.default_bands

# Make log directory
if not os.path.isdir(cfg.log_dir):
  os.makedirs(cfg.log_dir)

# Connect to database
conn = MySQLdb.connect(db='rsam', host=cfg.db['host'], user=cfg.db['username'], passwd=cfg.db['password'], read_default_file="/etc/my.cnf")
cursor = conn.cursor()

et=end_time
st=et - period
while(st >= start_time):
    etf = et.strftime(cfg.date_format)
    stf = st.strftime(cfg.date_format)
    print(stf)
    print(etf)

    # create log file
    channel_name="%s$%s$%s$%s"%(station, channel, network, location)
    print(channel_name)
    filename = "%s_%s:%s:%s:%s_%d%02d%02d_%d.log"%("RSAM", station, channel, network, location, et.year, et.month, et.day, period)
    logfile = os.path.join(cfg.log_dir, filename)
    log = open(logfile,"a")

    # get wave server client
    client = Client(server, port)

    # get wave data
    response = client.get_availability(network, station, location, channel)
    log.write(str(response)+"\n")
    if(len(response)==0):    # full data not available
        et=et - period
        st=et - period
        continue
    stream = client.get_waveforms(network, station, location, channel, st, et)
    print(stream)
    log.write(str(stream)+"\n")
    if len(stream) == 0:
        et=et - period
        st=et - period
        continue

    if len(stream) > 1:
        stream.detrend('demean')
        stream.taper(max_percentage=0.01)
        stream.merge(fill_value=0)
    else:
        stream.detrend('demean')
    # unfiltered RSAM
    rsam=np.array([np.sqrt(np.mean(np.square(tr.data))) for tr in stream])
    log.write(str(rsam)+"\n")
    sql="INSERT INTO channels(channel, period, start_time, end_time) values('%s', %d, '%s', '%s') ON DUPLICATE KEY UPDATE start_time=least(start_time, '%s'), end_time=greatest(end_time,'%s');"%\
    (channel_name, period, stf, etf, stf, etf)
    print(sql)
    cursor.execute(sql)
    cid=cursor.lastrowid
    if cid==0L: 
      sql="SELECT cid FROM channels WHERE channel='%s' and period=%d and f1=0 and f2=0;"%\
      (channel_name, period) 
      cursor.execute(sql)
      for row in cursor.fetchall():
        cid=row[0]
    print("cid=",cid)
    sql="INSERT INTO rsam(cid, end_time, value) values(%d, '%s', %.4f) ON DUPLICATE KEY UPDATE value=%.4f"%\
    (cid, etf, rsam, rsam)
    print(sql)
    cursor.execute(sql)
    conn.commit()
    # filtered RSAM
    if bands is not None:
        for i in range(0,len(bands)):
            f1=float(bands[i][0])
            f2=float(bands[i][1])
            #tmp=Stream(stream)
            tmp=stream.copy()
            tmp.filter('bandpass',freqmin=f1,freqmax=f2)
            rsam=np.array([np.sqrt(np.mean(np.square(tr.data))) for tr in tmp])
            msg=f1, f2, str(rsam)
            print(msg)
            log.write(str(msg)+"\n")

            sql="INSERT INTO channels(channel, period, start_time, end_time, f1, f2) values('%s', %d, '%s', '%s', %.1f, %.1f) ON DUPLICATE KEY UPDATE start_time=least(start_time,'%s'), end_time=greatest(end_time,'%s');"%\
            (channel_name, period, stf, etf, f1, f2, stf, etf)
            print(sql)
            cursor.execute(sql)
            cid=cursor.lastrowid
            if cid==0L:
              sql="SELECT cid FROM channels WHERE channel='%s' and period=%d and round(f1,2)=round(%.1f,2) and round(f2,2)=round(%.1f,2);"%\
              (channel_name, period, f1, f2)
              print(sql)
              cursor.execute(sql)
              for row in cursor.fetchall():
                cid=row[0]
            sql="INSERT INTO rsam(cid,end_time,value) values(%d, '%s', %.4f) ON DUPLICATE KEY UPDATE value=%.4f;"%\
            (cid, etf, rsam, rsam)
            print(sql)
            cursor.execute(sql)
            conn.commit()

    et=et - period
    st=et - period

conn.close()


