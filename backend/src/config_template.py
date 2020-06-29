date_format="%Y-%m-%d %H:%M:%S"
log_dir="log"

taper=5
buffer=60.0*5.0  # latency in seconds

# Default filter bands
bands = [[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]]

# Winston Wave Server definitions (multiple allowed - separate by commas)
wws={
    "AVO":{
        "server": "pubavo1.wr.usgs.gov",
        "port": 16024
    },
    #"wws2":{
        #"server": "192.168.0.3",
        #"port": 16024
    #},
}

# Channels to calculate RSAM on (examples)
channels=[
    {
        "server": wws['AVO']['server'],
        "port": wws['AVO']['port'],
        "station": "ACH",
        "channel": "BHZ",
        "network": "AV",
        "location": "--"
    },
    {
        "server": wws['AVO']['server'],
        "port": wws['AVO']['port'],
        "station": "ADAG",
        "channel": "BHZ",
        "network": "AV",
        "location": "--"
    },
]
