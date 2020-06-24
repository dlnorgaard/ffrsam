"use strict";
google.charts.load('current', {'packages':['corechart']});

// Get channel data
function getChannels(){
  // get channel data
  var cj = $.ajax({
    url: "/api/getChannels",
    dataType: "json",
    async: false
  }).responseText;
  var channels = JSON.parse(cj);

  // get periods 
  var pj = $.ajax({
    url: "/api/getPeriods",
    dataType: "json",
    async: false
  }).responseText;
  var periods = JSON.parse(pj);
    
  // get filters 
  var fj = $.ajax({
    url: "/api/getFilters",
    dataType: "json",
    async: false
  }).responseText;
  var filters = JSON.parse(fj);

  // Create our data table out of JSON data loaded from server.
  var cs =document.getElementById("channel");
  for(var i in channels){
     var c = channels[i];
     var option = document.createElement("option");
     option.value = c.channel;
     option.text = c.channel.replace(/\$/g," ");
     cs.add(option);
  };
  var ps =document.getElementById("period");
  for(var i in periods){
     var p = periods[i];
     var option = document.createElement("option");
     var period = parseInt(p.period);
     option.value = period;
     option.text= Math.round(period/60);
     if(option.text==1440){
       option.text="1 day";
     } else if(option.text>=60){
       var hour=Math.round(period/3600);
       option.text=hour + " hour";
     } else{
       option.text+=" min";
     }
     ps.add(option);
  };
  ps.selectedIndex=0;// should be 10 min RSAM
  var fs =document.getElementById("filter");
  for(var i in filters){
     var f = filters[i];
     var option = document.createElement("option");
     var ftext = "None";
     if(f.f1!="0" && f.f2!="0"){
       ftext = f.f1+"-"+f.f2
     }
     option.value = ftext;
     option.text= ftext;
     fs.add(option);
  };
  fs.selectedIndex="0";
}

window.onload=getChannels();

