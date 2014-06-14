<?php
header('Access-Control-Allow-Origin: *');
set_time_limit(5);

$result=false;
switch(isset($_POST['source'])? $_POST['source']:false){
	case 'ustream':
		if(!(isset($_POST['path']) && preg_match('/^(channel\/)?[a-zA-Z0-9-]+$/',$_POST['path']))){
			http_response_code(400);
			break;
		}
		$result=get_headers('http://www.ustream.tv/'.$_POST['path'],1);
		if(isset($result['X-Ustream-Content-Id']))
			$result=$result['X-Ustream-Content-Id'];
		else{
			$result=false;
			http_response_code(404);
		}
	break;
	default:
		http_response_code(400);
}
if($result) echo $result;
?>