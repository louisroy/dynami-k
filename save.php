<?php
	$data = (!empty($_REQUEST['data'])) ? $_REQUEST['data'] : 'Well, hello there';
	
	header('Content-Description: File Transfer');
	header('Content-Type: image/svg+xml');
	header('Content-Disposition: attachment; filename=dynamik_'.date('Y-m-d_H-i-s') . '.svg');
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate');
	header('Content-Length: '.strlen($data)); 
	header('Pragma: public');
	
	echo $data;
	
	exit;
?>