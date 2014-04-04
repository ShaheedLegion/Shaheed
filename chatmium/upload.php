<?php

header('Access-Control-Allow-Origin: *');
$upload_dir = "../chatmium/uploads/";

/*
function writeFile($text)
{
	$file = fopen("php_erros.txt","w");
	echo fwrite($file, $text);
	fclose($file);
}
*/
//does not check file sizes.
if (isset($_FILES["upfile"]))
{
	$tempname = $_FILES["upfile"]["name"];
	//writeFile($tempname);
	$original_extension = (false === $pos = strrpos($tempname, '.')) ? '' : substr($tempname, $pos);

	//writeFile($original_extension);
	$arrayImg = array("image/jpg", "image/jpeg", "image/gif", "image/png");
	$arrayExtensions = array(".jpg", ".jpeg", ".gif", ".png");

	if (in_array($original_extension, $arrayExtensions))
	{
		$time = "".time();
		$prefix = str_replace(' ', '', $time);
		$filename = $upload_dir .$prefix. $_FILES["upfile"]["name"];
		move_uploaded_file($_FILES["upfile"]["tmp_name"], $filename);
		echo $filename;
	}
	else
	{
		echo "Incorrect_file.png";
	}
}
?>