"use strict";
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['table']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(getTable);

// Get channel data
function getTable(){
  var jsonData = $.ajax({
    url: "/api/getChannelsTable",
    dataType: "json",
    async: false
  }).responseText;
  var channels = JSON.parse(jsonData);
    
  // Create our data table out of JSON data loaded from server.
  var data = new google.visualization.DataTable();
  data.addColumn('string','Channel');
  data.addColumn('string','Period');
  data.addColumn('number','F1');
  data.addColumn('number','F2');
  data.addColumn('string','Start Date');
  data.addColumn('string','End Date');
  for(var i in channels){
     var c = channels[i];
     var channel = c.channel.replace(/\$/g," ");
     var period = parseInt(c.period)/60;
     var ptext = "";
     if(period == 1440){
       ptext = "1 Day";
     }else if (period >= 60){
       var hour = Math.round(period/60);
       ptext = hour.toString() + " Hour";
     }else{
       ptext = period.toString() + " Min";
     }
     var f1 = parseFloat(c.f1);
     var f2 = parseFloat(c.f2);
     data.addRow([channel, ptext, f1, f2, c.start_time, c.end_time]);
  };

  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, { showRowNumber: false, width:'100%',height:'100%'});
}

