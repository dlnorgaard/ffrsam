date_format="%Y-%m-%d %H:%M:%S"

taper=5
buffer=60.0*20.0  # latency in seconds

bands = [[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]]

# Winston Wave Server definitions
wws={
    "VDAP":{
        "server": "vdap.org",
        "port": 16024
    },
    "AVO":{
        "server": "pubavo1.wr.usgs.gov",
        "port": 16022
    }    
}

# Channels to calculate RSAM on
channels=[
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "FG8",
        "channel": "BHZ",
        "network": "GI",
        "location": "00"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "FG10",
        "channel": "BHZ",
        "network": "GI",
        "location": "00"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "FG11",
        "channel": "BHZ",
        "network": "GI",
        "location": "--"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "FG12",
        "channel": "BHZ",
        "network": "GI",
        "location": "00"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "FG13",
        "channel": "BHZ",
        "network": "GI",
        "location": "00"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "VSM",
        "channel": "SHZ",
        "network": "SN",
        "location": ""
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "BLLM",
        "channel": "SHZ",
        "network": "SN",
        "location": ""
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "LCY",
        "channel": "SHZ",
        "network": "SN",
        "location": ""
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "RANC",
        "channel": "EHZ",
        "network": "SV",
        "location": ""
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "TMKS",
        "channel": "EHZ",
        "network": "VG",
        "location": "00"
    },
    {
        "server": wws['VDAP']['server'],
        "port": wws['VDAP']['port'],
        "station": "PSAG",
        "channel": "EHZ",
        "network": "VG",
        "location": "00"
    }
]
