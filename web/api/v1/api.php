<?php
     
#require_once("/var/www/html/include/auth.php");
#require_once("/var/www/html/include/Rest.inc.php");
require_once("./Rest.inc.php");
     
class API extends REST {
     
    public $data = "";
     
    private $db = NULL;
 
    public function __construct(){
        parent::__construct();              // Init parent contructor
        $this->dbConnect();                 // Initiate Database connection
        $this->db->query("SET NAMES 'utf8'");
    }
     
    private function dbConnect(){
        require_once("/var/www/external/mysql.php");
        $this->db = mysqli_connect($db_server,$db_user,$db_password, 'rsam');
	if(!$this->db){
  	  die("Connection failed: " . mysqli_connect_error());
	}
    }
     
    /*
     * Public method for access api.
     * This method dynmically call the method based on the query string
     *
     */
    public function processApi(){
        $func = strtolower(trim(str_replace("/","",$_REQUEST['request'])));
        if((int)method_exists($this,$func) > 0)
            $this->$func();
        else
            $this->response('Error code 404, Page not found',404);   // If the method not exist with in this class, response would be "Page not found".
    }
    private function hello(){
      echo str_replace("this","that","HELLO WORLD!!");
   
    }
 
    private function test(){    
      // Cross validation if the request method is GET else it will return "Not Acceptable" status
      if($this->get_request_method() != "GET"){
        $this->response('',406);
      }
      $myDatabase= $this->db;// variable to access your database
      $param=$this->_request['var'];
      // If success everythig is good send header as "OK" return param
      $this->response($param, 200);    
    }

    /*
       General get query.
    */
    private function get($sql){
      if($this->get_request_method() != "GET"){
        $this->response('',406);
      }
      $mydb= $this->db;// variable to access your database

      $result = $mydb->query($sql);
      if($mydb->error){
        $response = json_encode(array("success"=>false,
                                        "message"=>$mydb->error,
                                        "parameters"=>$this->_request,
                                        "sql"=>$sql), JSON_PRETTY_PRINT);
        $this->response($response,500);
      }else{
        $rows=array();
        while($r = mysqli_fetch_assoc($result)) {
          $rows[] = $r;
        }
        $json = json_encode($rows, JSON_PRETTY_PRINT);
        $this->response($json, 200);    
      }
    }

    private function getChannelsTable(){
      $sql = "select * from channels order by channel, period, f1, f2";
      $this->get($sql);
    }

    private function getChannels(){
      $sql = "select distinct channel from channels order by channel";
      $this->get($sql);
    }

    private function getPeriods(){
      $sql = "select distinct period as period from channels order by period";
      $this->get($sql);
    }

    private function getFilters(){
      $sql = "select distinct f1, f2 from channels order by f1, f2";
      $this->get($sql);
    }

    private function getRsam(){
      $channel=$this->_request['channel'];
      $period=$this->_request['period'];
      $f1=$this->_request['f1'];
      $f2=$this->_request['f2'];
      $st=$this->_request['start_time'];
      $et=$this->_request['end_time'];
      $sql="select a.end_time, b.channel, b.period, b.f1, b.f2, a.value from rsam a join channels b on a.cid=b.cid where b.channel='$channel' and b.period=$period and a.end_time between '$st' and '$et' and round(b.f1,2)=round($f1,2) and round(b.f2,2)=round($f2,2) order by a.end_time, b.period, b.f1, b.f2";
      $this->get($sql);
    }

    /*
     *  Encode array into JSON
    */
    private function json($data){
        if(is_array($data)){
            return json_encode($data);
        }
    }
}
 
    // Initiiate Library
     
    $api = new API;
    $api->processApi();
?>
