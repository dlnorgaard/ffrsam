import sys, os, time
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.engine.url import URL 
import plotly.io as pio
import plotly.express as px
import MySQLdb
import config as cfg
from obspy.core import UTCDateTime

def process():
  global cfg

  # process each channel
  for c in cfg.channels:
    network=c['network']
    station=c['station']
    location=c['location']
    channel=c['channel']
    channel_name="%s$%s$%s$%s"%(station, channel, network, location)
    create_image(channel_name)

def create_image(channel_name):
  global cfg
  global cursor
  global conn
  global days
  global period 
  global xlabel 
  try:
    # determine start and end times
    now = time.time()
    et = now - cfg.buffer
    et = UTCDateTime(et - (et % 60*period))
    st = et - (days*24*60*60)
    etf = et.strftime(cfg.date_format)
    stf = st.strftime(cfg.date_format)
    # get data
    sql="SELECT a.end_time as time, a.value as rsam FROM rsam a JOIN channels b ON a.cid=b.cid WHERE b.channel='%s' AND period=%d AND f1=0 AND f2=0 AND a.end_time >= '%s' AND a.end_time <= '%s';"%(channel_name, 60*period, stf, etf)
    df = pd.read_sql(sql, conn)
    df = df.rename(columns={'time':xlabel,'rsam':'RSAM'})
    # plot data
    fig=px.line(df,x=xlabel,y='RSAM', width=os.environm['IMAGE_WIDTH', height=os.environ['IMAGE_HEIGHT'])
    fig.update_layout(xaxis_range=[stf,etf],title_text=channel_name.replace('$',' '))
    filename="/images/%s_%d.png"%(channel_name,days)
    fig.write_image(filename)
    print("Generated %d day plot for %s"%(days,channel_name))
  except:
    e = sys.exc_info()[0]
    print("Error creating %d day plot for %s: {}"%(days,channel_name,e))


#############################################################################################
# MAIN
#############################################################################################
if len(sys.argv) == 0:
  message="Usage: "+sys.argv[0]+" period"
  print(message)
  message="period=period of last rsam calculation (10, 60, or 1440 are the only accepted values)"
  print(message)
  sys.exit()
else:
  period=int(sys.argv[1])

# determine number of days for plot
if period==10:
  days=1
  xlabel='Time'
elif period==60:
  days=30
  xlabel='Date'
elif period==1440:
  days=365
  xlabel='Date'
else:
  print("No images will be generated for this cycle.")
  sys.exit()


# Connect to database
conn = MySQLdb.connect(db='rsam', host='db', user=os.environ['DB_USER'], passwd=os.environ['DB_PASSWORD'], read_default_file="/etc/my.cnf")
cursor = conn.cursor()

process()


