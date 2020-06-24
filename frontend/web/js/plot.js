"use strict";
function getInput(){
    var input = {};

    // Get list of channels
    var csel=document.getElementById('channel');
    var copts=csel.selectedOptions;
    var channels=[];
    for(var i=0; i<copts.length; i++){
      channels.push(copts[i].value);
    }
    if(channels.length==0){
      alert("Please select at least one channel.");
      return;
    }
    input["channels"]=channels;

    // Get period
    var psel=document.getElementById('period');
    var period=psel.value;
    if(period==null){
      alert("Please select a period.");
      return;
    }
    input["period"]=period;

    // Get list of filters
    var fsel=document.getElementById('filter');
    var fopts=fsel.selectedOptions;
    var filters=[];
    for(var i=0; i<fopts.length; i++){
      filters.push(fopts[i].value);
    }
    if(filters.length==0){
      alert("Please select at least one filter.");
      return;
    }
    input["filters"]=filters;

    // Get date range
    var st=document.getElementById('start_date').value;
    var fsel=document.getElementById('filter');
    var fopts=fsel.selectedOptions;
    var filters=[];
    for(var i=0; i<fopts.length; i++){
      filters.push(fopts[i].value);
    }
    if(filters.length==0){
      alert("Please select at least one filter.");
      return;
    }
    input["filters"]=filters;
st=st+" "+document.getElementById('start_time').value;
    var et=document.getElementById('end_date').value;
    et=et+" "+document.getElementById('end_time').value;
    input["st"]=st;
    input["et"]=et;
    if(new Date(st) >= new Date(et)){
      alert("End time must be greater than start time.");
      return;
    }

    // Get max Y
    input["maxy"]=document.getElementById('maxy').value;
 
    // validate input
    if(!validateInput(input)){
      return;
    }

    return input;
}


var oneday=1000*60*60*24; // milliseconds in a day
function validateInput(input){
  var period=input.period/60;
  var st=new Date(input.st);
  if(isNaN(st.getTime())){
    alert("Invalid Start Date.");
    return false; 
  }
  var et=new Date(input.et);
  if(isNaN(et.getTime())){
    alert("Invalid End Date.");
    return false; 
  }
  var dayDiff=(et.getTime()-st.getTime())/oneday;
  if(dayDiff > 365 && period < 1440){
    alert("Please use 1 day period or greater for query period greater than 365 days.");
    return false; 
  }
  if(dayDiff > 90 && period < 60){
    alert("Please use 1 hour period or greater for query period greater than 90 days.");
    return false; 
  }
  if(dayDiff > 30 && period < 10){
    alert("Please use 10 minute period or greater for query period greater than 30 days.");
    return false; 
  }
  if(dayDiff > 1 && period < 5){
    alert("Please use 5 minute period or greater for query period greater than 24 hours.");
    return false; 
  }
  return true;
}

// query database
function getRsam(input){
  var rsam=[];
  var url;
  for(var i in input.channels){
    var channel=input.channels[i];
    for(var j in input.filters){
      var start=Date.now();
      var band=input.filters[j];
      var f=band.split("-");
      if(f[0]=="None"){ 
        f[0]="0";
        f.push("0");
      }
      url="api/getRsam?channel="+channel+"&period="+input.period+"&f1="+f[0]+"&f2="+f[1]+"&start_time="+input.st+"&end_time="+input.et;
      var jsonData = $.ajax({
        url: url,
        dataType: "json",
        async: false
        }).responseText;
      // parse JSON data
      var response=JSON.parse(jsonData)
      rsam=rsam.concat(response);
      var seconds=Math.round((Date.now()-start)/1000,2);
      console.log("Data retrieved from " + url + " in " + seconds + " seconds");
    }
    //console.log(rsam);
  }
  return rsam;
}

// CSV download function
function downloadCsv(input){
  var rsam = getRsam(input);
  let csvContent="data:text/csv;charset=utf-8,";
  var header=getHeader(input);
  csvContent += header + "\r\n";
  var row = null;
  var dataset=[];
  var et2dsidx={};
  var dsidx=-1;
  var pet;
  // reformat data
  for(var i in rsam){
    var r=rsam[i];
    //var cid=r.cid;
    var channel=r.channel;
    var period=r.period;
    var f1=r.f1;
    var f2=r.f2;
    var et=r.end_time+"Z";
    dsidx=et2dsidx[et];
    if(dsidx == null){
      dsidx=Object.keys(et2dsidx).length;
      console.log(dsidx);
      et2dsidx[et]=dsidx;
      row=[];
      for(var j=0;j<header.length;j++){
        row.push(null);
      }
      console.log(row);
      dataset.push(row);
      console.log(dataset[dsidx]);
      dataset[dsidx][0]=et;
    }
    var v=parseFloat(rsam[i].value);
    var station=channel.split("$")[0];
    var key;
    if(f1==0.0){
      key=station;
    }else{
      key=station+"(f"+f1+"-"+f2+"Hz)";
    }
    var idx=header.indexOf(key);
    dataset[dsidx][idx]=v;
  }
  for(var i in dataset){
    for(var j in dataset[i]){
      csvContent += dataset[i][j]+",";
    }
    csvContent += "\r\n";
  }
  var encodedUri=encodeURI(csvContent);
  var link = document.createElement('a');
  link.setAttribute('href',encodedUri);
  link.setAttribute('download',"rsam.csv");
  document.body.appendChild(link);
  link.click();
}

// create chart header
function getHeader(input){
  var header=[{label:'DateTime',id:'DateTime',type:'date'}];
  for(var i in input.channels){
    var station=input.channels[i].split("$")[0];
    for(var j in input.filters){
      var f1=input.filters[j].split("-")[0];
      var f2=input.filters[j].split("-")[1];
      var key;
      if(f1=='None'){
        key=station;
      }else{
        key=station+"(f"+f1+"-"+f2+"Hz)";
      }
      //var column={label:key, id:key, type:'number'};
      header.push(key);
    }
  }
  return header;
}

var charts={};
// Draw chart
function drawChart(input=null, plotId=null){
  if(input == null){
    input = getInput();
    if(input == null){
      return;
    }
  }

  var rsam = getRsam(input);
  if(rsam.length==0){
    alert("No data for selected input available.");
    return;
  }

  // create data table
  var min=Number.MAX_VALUE;
  var max=-1*Number.MAX_VALUE;
  var pet = null;
  var row = null;
  var dataset=[];
  var header=getHeader(input);
  dataset.push(header);
  var dsidx=0;
  for(var i in rsam){
    var r=rsam[i];
    //var cid=r.cid;
    var channel=r.channel;
    var period=r.period;
    var f1=r.f1;
    var f2=r.f2;
    var v=parseFloat(r.value);
    if(pet != r.end_time){
      dsidx++;
      row=[];
      for(var j=0;j<header.length;j++){
        row.push(Number.NaN);
      }
      dataset.push(row);
      var et=new Date(r.end_time);
      dataset[dsidx][0]=et;
      pet=r.end_time;
    }
    var station=channel.split("$")[0];
    var key;
    if(f1==0.0){
      key=station;
    }else{
      key=station+"(f"+f1+"-"+f2+"Hz)";
    }
    var idx=header.indexOf(key);
    dataset[dsidx][idx]=v;
    min=Math.min(min,v);
    max=Math.max(max,v);
  }
  var data = google.visualization.arrayToDataTable(dataset);

  // draw chart

  var ptext="";
  var pim = Math.round(period/60);
  if(pim == 1440){
    ptext = "1 Day";
  } else if(pim >= 60){
    var hour=Math.round(period/3600);
    ptext = hour + " Hour";
  } else{
    ptext =pim + " Min";
  }

  var title=ptext+" RSAM\n"+input.st+" to "+input.et;
  var type = document.getElementById('plottype').value;
  var lineWidth=0;
  var pointSize=1;
  var dataOpacity=1;
  if(type == 'Line'){
    lineWidth=1;
    pointSize=0;
    dataOpacity=0;
  }
  var options = {
    title: title,
    height: 400,
    tooltip: {isHtml: true},
    pointSize: pointSize,
    lineWidth: lineWidth,
    dataOpacity: dataOpacity,
    interpolateNulls: false,
    crosshair: { trigger: 'both' },
    hAxis: {title: 'Time', minValue: new Date(input.st), maxValue: new Date(input.et)},
    vAxis: {title: 'Value', format: 'decimal', minValue: min, maxValue: max, viewWindow:{max: input.maxy}},
    legend: { position: 'top' },
    explorer: {
      actions: ['dragToZoom','rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 0
    }
  };
  if(plotId == null){
    plotId = addPlotArea();
  }
  var chartId = 'chart'+plotId
  var chartDiv = document.getElementById(chartId);
  chartDiv.innerHTML="";
  var chart=charts[plotId];
  if(chart == null){
    if(type == 'Line'){
      chart = new google.visualization.LineChart(chartDiv);
    }else{
      chart = new google.visualization.ScatterChart(chartDiv);
    }
  }
  //google.visualization.events.addListener(chart,'select', function(e){selectHandler(chart,data)});
  chart.draw(data, options);
  drawToolBar(plotId, input, chart);
}

// Draw tool bar for chart
function drawToolBar(plotId, input, chart){
  var tbId = 'toolbar'+plotId;
  var tbDiv = document.getElementById(tbId);
  tbDiv.innerHTML="";
  
  // delete button
  var btn=document.createElement("button");
  btn.onclick=function(e){deleteChart(plotId)};
  btn.setAttribute('title','Delete plot');
  btn.innerHTML="Delete";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));

  // create PNG export
  var btn=document.createElement("button");
  btn.onclick=function(e){openImage(input, chart,plotId)};
  btn.setAttribute('title','Download as PNG image');
  btn.innerHTML="PNG";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));

  // create CSV export
  var btn=document.createElement("button");
  btn.onclick=function(e){downloadCsv(input, chart,plotId)};
  btn.setAttribute('title','Download as CSV file');
  btn.innerHTML="CSV";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));

  // copy button 
  var btn=document.createElement("button");
  btn.onclick=function(e){drawChart(input, null)};
  btn.setAttribute('title','Create copy of plot');
  btn.innerHTML="Copy";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));

  // Left and right scroll
  var li=scroll(input,"left");
  var btn=document.createElement("button");
  btn.onclick=function(e){drawChart(li, plotId)};
  btn.setAttribute('title','Scroll back in time (10%)');
  btn.innerHTML="&laquo;";
  tbDiv.appendChild(btn);

  var ri=scroll(input,"right");
  var btn=document.createElement("button");
  btn.onclick=function(e){drawChart(ri, plotId)};
  btn.setAttribute('title','Scroll forward in time (10%)');
  //btn.innerHTML="&rarr;";
  btn.innerHTML="&raquo;";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));
 
  var zii=zoom(input,"in");
  var btn=document.createElement("button");
  btn.onclick=function(e){drawChart(zii, plotId)};
  btn.setAttribute('title','Zoom in (20%)');
  btn.innerHTML="+";
  tbDiv.appendChild(btn);

  var zoi=zoom(input,"out");
  var btn=document.createElement("button");
  btn.onclick=function(e){drawChart(zoi, plotId)};
  btn.setAttribute('title','Zoom out (20%)');
  btn.innerHTML="-";
  tbDiv.appendChild(btn);

  tbDiv.appendChild(document.createTextNode(" "));
}

function openImage(input, chart,plotId){
  var link = document.createElement('a');
  link.href=chart.getImageURI();
  var name="plot"+plotId+"_"+input.channels+"_"+input.period+".png"
  link.setAttribute('download', name);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

var scrollAdjustment=0.1;
// function to scroll left o rright
function scroll(input,direction){
  var ni={};
  ni["channels"]=input.channels;
  ni["period"]=input.period;
  ni["filters"]=input.filters;
  var st = new Date(input.st.replace(/ /,'T') + "Z");
  var et = new Date(input.et.replace(/ /,'T') + "Z");
  var diff = et - st; // millisecons
  var shift = scrollAdjustment*diff;
  if(direction=="left"){
    st = new Date(st - shift); 
    et = new Date(et - shift); 
  }else{
    st = new Date(+st + shift); 
    et = new Date(+et + shift); 
  }
  ni["st"]=st.toISOString().slice(0,19).replace(/T/,' ');
  ni["et"]=et.toISOString().slice(0,19).replace(/T/,' ');
  return ni;
}

// function to zoom in or out
function zoom(input,direction){
  var ni={};
  ni["channels"]=input.channels;
  ni["period"]=input.period;
  ni["filters"]=input.filters;
  var st = new Date(input.st.replace(/ /,'T') + "Z");
  var et = new Date(input.et.replace(/ /,'T') + "Z");
  var diff = et - st; // millisecons
  var shift = scrollAdjustment*diff;
  if(direction=="in"){
    st = new Date(+st + shift); 
    et = new Date(et - shift); 
  }else{
    st = new Date(st - shift); 
    et = new Date(+et + shift); 
  }
  ni["st"]=st.toISOString().slice(0,19).replace(/T/,' ');
  ni["et"]=et.toISOString().slice(0,19).replace(/T/,' ');
  return ni;
}

// function to delete chart
function deleteChart(plotId){
  var tbId = '#toolbar'+plotId;
  $(tbId).remove(); 
  var chartId = '#chart'+plotId;
  $(chartId).remove(); 
  var chart=charts[plotId];
  chart.clearChart;
  charts[plotId]=null;
}

// function to add plot area
var plotCount=0;
function addPlotArea(){
  plotCount++;

  // create div for chart area
  var chartId="chart"+plotCount;
  var node = document.createElement("div");
  node.setAttribute('id', chartId);
  node.setAttribute('class', 'plot');
  document.getElementById("plots").prepend(node);

  // create div for toolbar area
  var tbId="toolbar"+plotCount;
  var node = document.createElement("div");
  node.setAttribute('id', tbId);
  node.setAttribute('class', 'toolbar');
  document.getElementById("plots").prepend(node);

  return plotCount;
}

// select handler (not used)
var setStartTime=true;
function selectHandler(chart,data){
  var selection = chart.getSelection();
  for(var i=0;i<selection.length;i++){
    var item=selection[i];
    var dt=new Date(data.getValue(item.row, 0)+" GMT+0000 (UTC)");
    var newDate=dt.toISOString().slice(0,10);
    var newTime=dt.toISOString().slice(11,19);
    if(setStartTime){
      document.getElementById('start_date').value=newDate;
      document.getElementById('start_time').value=newTime;
      setStartTime=false;
    }else{
      document.getElementById('end_date').value=newDate;
      document.getElementById('end_time').value=newTime;
      setStartTime=true;
    }
  }
}
