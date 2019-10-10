'''
Created on Dec 10, 2018

@author: Diana
'''
import os, sys, time
from obspy.clients.earthworm import Client
from obspy.core import UTCDateTime
from obspy.core.stream import Stream
import numpy as np
import MySQLdb
import config as cfg

#########################################################################################################
# FUNCTIONS 
#########################################################################################################

# Process all channels for given start and end date
def process(st, et):
  global cfg
  global log

  # formatted dates
  etf = et.strftime(cfg.date_format)
  stf = st.strftime(cfg.date_format)
  print(etf)
  print(stf)

  # Process each channel
  for c in cfg.channels:        
    # get config info
    server=c['server']
    port=c['port']
    network=c['network']
    station=c['station']
    location=c['location']
    channel=c['channel']
    bands=c['bands']
    scnl=station, channel, network, location
    print(scnl)
    
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
    #if(len(response)==0 or response[-1][5] < et):    # full data not available
    log.write(str(response)+"\n")
    if(len(response)==0):    # full data not available
        continue
    stream = client.get_waveforms(network, station, location, channel, st, et) 
    #print(stream)
    log.write(str(stream)+"\n")
    if len(stream) == 0:
        continue
    
    stream.detrend('demean')
    if len(stream) > 1: 
        stream.taper(max_percentage=0.01)
        stream.merge(fill_value=0)

    # unfiltered RSAM
    rsam(channel_name, stream, stf, etf)

    # filtered RSAM
    if bands is not None:
        for i in range(0,len(bands)):
            f1=float(bands[i][0])
            f2=float(bands[i][1])
            ffrsam(channel_name, stream, stf, etf, f1, f2)


# Calculate unflitered RSAM
def rsam(channel_name, stream, stf, etf):
  global cursor
  global conn
  global period
  rsam=np.array([np.sqrt(np.mean(np.square(tr.data))) for tr in stream])
  log.write(str(rsam)+"\n")
  try:
    sql="INSERT INTO channels(channel, period, start_time, end_time) values('%s', %d, '%s', '%s') ON DUPLICATE KEY UPDATE start_time=least(start_time,'%s'), end_time=greatest(end_time,'%s');"%\
    (channel_name, period, stf, etf, stf, etf)
    print(sql)
    cursor.execute(sql)
    cid=cursor.lastrowid
    if cid == 0L: # no updates to channel table so get cid manually
      sql="SELECT cid FROM channels WHERE channel='%s' and period=%d and f1=0 and f2=0;"%\
      (channel_name, period)
      cursor.execute(sql)
      for row in cursor.fetchall():
        cid=row[0]
    sql="INSERT INTO rsam(cid, end_time, value) values(%d, '%s', %.4f) ON DUPLICATE KEY UPDATE value=%.4f"%\
    (cid, etf, rsam, rsam)
    print(sql)
    cursor.execute(sql)
    conn.commit()
  except (MySQLdb.Error, TypeError) as err:
    print("MySQL Error: {}".format(err))
    
# Calculate filtered RSAM
def ffrsam(channel_name, stream, stf, etf, f1, f2):
  global cursor
  global conn
  global period
  tmp=stream.copy()
  tmp.filter('bandpass',freqmin=f1,freqmax=f2)
  rsam=np.array([np.sqrt(np.mean(np.square(tr.data))) for tr in tmp])
  msg=f1, f2, str(rsam)
  print(msg)
  log.write(str(msg)+"\n")
  try:
    sql="INSERT INTO channels(channel, period, start_time, end_time, f1, f2) values('%s', %d, '%s', '%s', %.1f, %.1f) ON DUPLICATE KEY UPDATE start_time=least(start_time,'%s'), end_time=greatest(end_time,'%s');"%\
    (channel_name, period, stf, etf, f1, f2, stf, etf)
    print(sql)
    cursor.execute(sql)
    cid=cursor.lastrowid
    if cid == 0L :  # no updates to channel so get cid manually
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
  except (MySQLdb.Error, TypeError) as err:
    print("MySQL Error: {}".format(err))

#########################################################################################################
# MAIN 
#########################################################################################################
# The period
if len(sys.argv) == 1:
  message="Usage: "+sys.argv[0]+" period [start time as YYYYMMDDHHmmss] [end time as YYYYMMDDHHmmss]"
  print(message) 
  sys.exit()
else:
  period = 60.0*int(sys.argv[1])

# Make log directory
if not os.path.isdir(cfg.log_dir):
  os.makedirs(cfg.log_dir)
       
# Connect to database
conn = MySQLdb.connect(db='rsam', host=cfg.db['host'], user=cfg.db['username'], passwd=cfg.db['password'], read_default_file="/etc/my.cnf")
cursor = conn.cursor()

# get start and end time
if len(sys.argv) > 3:
  et = UTCDateTime(sys.argv[3])
  et = et - (et.timestamp % period)
else:
  now = time.time()
  et = now - cfg.buffer
  et = UTCDateTime(et - (et % period))
st = et - period 
if len(sys.argv) > 2:
  custom_st = UTCDateTime(sys.argv[2])
  while st >= custom_st: #loop through until selected time period is covered
    process(st, et)
    et=st
    st = et - period 
else:
  process(st, et)
