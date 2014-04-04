<?php
$upload_dir = "../chatmium/uploads/";
if (isset($_FILES["upfile"]))
{
    //if ($_FILES["upfile"]["error"] > 0)
	//{
    //    echo "Error: " . $_FILES["upfile"]["error"] . "<br>";
    //}
	//else
	//{
		$time = "".time();
		$prefix = str_replace(' ', '', $time);
		$filename = $upload_dir .$prefix. $_FILES["upfile"]["name"];
        move_uploaded_file($_FILES["upfile"]["tmp_name"], $filename);
        //echo "Uploaded File :" . $_FILES["myfile"]["name"];
        echo $filename;
        //print_r($_POST);
        //print_r($_FILES);
    //}
}
?>