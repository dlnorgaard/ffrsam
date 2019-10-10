date_format="%Y-%m-%d %H:%M:%S"
log_dir="log"

taper=5
buffer=60.0*5.0  # latency in seconds

# This is the database where the calculated RSAM are stored
db={
   "host": "127.0.0.1",
   "username": "dbuser",
   "password": "dbpassword", 
}

# Winston Wave Server definitions (multiple allowed - separate by commas)
wave_server={
    "wws1":{
        "server": "127.0.0.1",
        "port": 16024
    },
    #"wws2":{
        #"server": "192.168.0.3",
        #"port": 16024
    #},
}

# Default filter bands
default_bands = [[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]]

# Channels to calculate RSAM on (examples)
channels=[
    {
        "server": wave_server['wws1']['server'],
        "port": wave_server['wws1']['port'],
        "station": "FG8",
        "channel": "BHZ",
        "network": "GI",
        "location": "00",
        "bands": default_bands,
    },
    {
        "server": wave_server['wws1']['server'],
        "port": wave_server['wws1']['port'],
        "station": "FG10",
        "channel": "BHZ",
        "network": "GI",
        "location": "00",
        "bands": default_bands,
    },
]
