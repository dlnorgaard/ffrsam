<!-- URL based plotting -->
<!-- example: https://vdap.org/seismic/rsam/plot.php?channel=FG13$BHZ$GI$00&start_time=-48h&period=3600 -->
<!-- Not yet fully supported -->
<?php
require_once("/var/www/external/mysql.php");
$db = mysqli_connect($db_server,$db_user,$db_password, 'rsam');
# Get channel parameter
if(isset($_GET['channel'])){
  $channel=$_GET['channel'];
}else{
  echo "Parameter 'channel' is required.";
  exit(0);
}
# Get period parameter
$period=600;  // 10 minutes
if(isset($_GET['period'])){
  $period=$_GET['period'];
}
# Get start time parameter
$st="-24h";
if(isset($_GET['start_time'])){
  $st=$_GET['start_time'];
}
$st=strtoupper($st);
if(strpos($st,"H")>0){
  $hour=str_replace("H","",$st);
  $hour=str_replace("-","",$hour); // remove negative sign
  $st="DATE_SUB(NOW(), INTERVAL $hour HOUR)";
}
$sql="select a.end_time, a.value from rsam a join channels b on a.cid=b.cid where b.channel='$channel' and b.period=$period and b.f1=0.0 and b.f2=0.0 and a.end_time >= $st order by a.end_time";
#echo $sql."<p>";
$result=$db->query($sql);
if($db->error){
  echo "<div style='color:red'>$db->error</div>";
}
if($result->num_rows==0){
  echo "No results found.";
  exit(0);
}
$rows=array();
while($r=mysqli_fetch_assoc($result)){
  $rows[]=$r;
}
$json=json_encode($rows);
?>
<HTML>
<HEAD>
  <meta http-equiv="content-type" content="image/jpg">
 <TITLE>RSAM</TITLE>
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<script>
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart(){
  // create data table
  var json=<?php echo $json;?>;
  var rows=[];
  for(var i=0;i<json.length;i++){
    rows.push([new Date(json[i].end_time), Number(json[i].value)]);
  }
  var data=google.visualization.arrayToDataTable(rows,true);

  // create period text
  var period=Number(<?php echo $period;?>);
  var pim = Math.round(period/60);
  var ptext="";
  if(pim == 1440){
    ptext = "1 Day";
  } else if(pim >= 60){
    var hour=Math.round(period/3600);
    ptext = hour + " Hour";
  } else{
    ptext =pim + " Min";
  }

  var channel="<?php echo $channel;?>";
  var title=channel+" "+ptext;
  var subtitle=json[0].end_time+" to "+json[json.length-1].end_time;
  console.log(subtitle);
  var options = {
    title: title+" ("+subtitle+")",
    height: 400,
    tooltip: {isHtml: true},
    pointSize: 1,
    lineWidth: 1,
    dataOpacity: 0,
    interpolateNulls: false,
    crosshair: { trigger: 'both' },
    hAxis: {title: 'Time'},
    vAxis: {title: 'RSAM', format: 'decimal'},
    legend: { position: 'none' },
    explorer: {
      actions: ['dragToZoom','rightClickToReset'],
      axis: 'horizontal',
      keepInBounds: true,
      maxZoomIn: 0
    }
  };
  var div=document.getElementById('chart');
  var chart=new google.visualization.LineChart(div);
  chart.draw(data,options);
}

</script>
</HEAD>
<BODY>
<div id='chart'></div>
</BODY>
</HTML>
