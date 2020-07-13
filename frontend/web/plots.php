<?php
$days=$_REQUEST['days'];
$f1=number_format($_REQUEST['f1'],1);
$f2=number_format($_REQUEST['f2'],1);
$bands = [[0,0],[0.1,1],[1,3],[1,5],[1,10],[5,10],[10,15],[15,20]];
$daylist=[1,30,365];
?>
<HTML>
<HEAD>
 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
 <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
 <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
 <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
 <link rel="stylesheet" href="./css/rsam.css">
 <TITLE>RSAM <?php echo $days;?> Days</TITLE>
</HEAD>
<BODY>
<section>
<h1>RSAM <?php echo $days;?> Day Plots</h1>
<?php
if(filtered($f1,$f2)){
  echo "<h3 style='color:red;'>Filtered: [ $f1, $f2 ]</h3>";
}
?>
<table class='table table-condensed table-sm table-hover rsam'>
  <tr><th></th><th colspan=<?php sizeof($bands);?>>Filter</th><tr>
<?php
foreach($daylist as $d){
  echo "<tr>";
  echo "<th>";
  if($d==1){ echo "Day"; }
  if($d==30){ echo "Month"; }
  if($d==365){ echo "Year"; }
  echo "</th>";
  foreach($bands as $b){
    $url="./plots.php?days=$d&f1=$b[0]&f2=$b[1]";
    $label="None";
    if(filtered($b[0],$b[1])){
      $label="[$b[0] - $b[1] Hz]";
    }
    echo "<td><a href='$url'>$label</a></td>";
  }
  echo "<td><a href='./index.html'>Custom</a></td>";
  echo "</tr>";
}
?>
</table>
<p>
<p><p>
Note:
<ul>
<li>1 day plots use 10 minute RSAMs</li>
<li>30 day plots use 1 hour RSAMs</li>
<li>365 day plots use 1 day RSAMs</li>
</ul>
<hr>
<?php
if(filtered($f1,$f2)){
  foreach(glob("../images/*_${days}_${f1}_${f2}.png") as $img){
    echo "<p><img src='$img' /><p>";
  }
}else{
  foreach(glob("../images/*_${days}.png") as $img){
    echo "<p><img src='$img' /><p>";
  }
}

?>
</section>
</BODY>
</HTML>
<?php

function filtered($f1, $f2){
  if($f1 > 0 || $f2 > 0){
    return true;
  }
  return false;
}

