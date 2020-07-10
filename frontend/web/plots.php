<?php
$days=$_REQUEST['days'];
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
View: &nbsp;&nbsp;
<a href="./plots.php?days=1">Day</a>&nbsp;&nbsp;
<a href="./plots.php?days=30">Month</a>&nbsp;&nbsp;
<a href="./plots.php?days=365">Year</a>&nbsp;&nbsp;
<a href="./index.html">Custom</a>&nbsp;&nbsp;
<p><p>
Note:
<ul>
<li>1 day plots use 10 minute RSAMs</li>
<li>30 day plots use 1 hour RSAMs</li>
<li>365 day plots use 1 day RSAMs</li>
</ul>
<hr>
<?php
foreach(glob("../images/*_$days.png") as $img){
  echo "<p><img src='$img' /><p>";
}

?>
</section>
</BODY>
</HTML>

