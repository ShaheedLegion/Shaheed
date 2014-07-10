<?php
header("Access-Control-Allow-Origin: *");
/*
The Chatmium App - Written by Shaheed Abdol:
http://www.ShaheedAbdol.co.za

If you would like, then you can support my efforts by donating to his worthy causes.

Copyright 24 January 2014. Released under GNU GPL - you may use this file, and any parts of it, verbatim, in your
works or any derivative of this work, as long as you mention my name somewhere on the product or in its documentation.

Enjoy.

Any suggestions can be sent to me on my website ...
*/
class FileObject
{
    $file_name;
    $file_lines;

     function __construct($filename)
     {
         $this->$file_lines = array(); //array of string
         $this->$file_name = $filename;
         $this->read_file();
     }

    public function read_file()
    {
        unset($this->$file_lines);  //clear out the array
        $this->$file_lines = array(); //array of string
		$fp_contents = fopen($this->$file_name, 'r');
		if ($fp_contents)
		{
			while (($line = fgets($fp_contents)) !== false)
			{
				$file_lines.append($line);
			}
			fclose($fp_contents);
		}
        $this->prune_file();
    }
    
    public function write_file()
    {
		$fp_content = fopen($this->$file_name, 'w');
		if ($fp_content)
		{
            foreach ($this->$file_lines as $value)
            {
                fwrite($fp_content, $value."\n");
            }
			fclose($fp_content);
		}
    }
    
    public function prune_file()
    {
        //unimplemented - each implementor will decide how to prune files.
        write_debug("Base::fileObject - Pruning file.");
    }
    
    public function write_entry($entry)
    {
        write_debug("Base::FileObjct - writing entry");
    }
}

class UserFileObject extends FileObject
{
    $time_out;
    function __construct($filename, $timeout)
    {
        parent::__construct(params);
        $this->$time_out = $timeout;
    }
    
    function prune_file()
    {   //run through the time stamps to check for expired users.
        $current_time = time();
        $temp_lines = array();
        foreach (parent::$file_lines as $line)
        {
            $time = 0;
            if (($found = strpos($line, '[')) === FALSE){}
            else
            { //we have found something...
                if (($found2 = strpos($line, '[', $found)) === FALSE){}
                else
                {
                    //we now have the start and end position of the number
                    if ($found3 = strpos($line, ']', $found2) === FALSE){}
                    else
                    {
                        $found2 += 1;
                        $time = substr($line, $found2, ($found3 - $found3));
                        if ($current_time - $time < $this->$time_out)
                            $temp_lines.append($line);
                    }
                }
            }
        }
        parent::$file_lines = $temp_lines;
    }

    function write_entry($entry)
    {
        $user_time = time();
        $line = "[".$entry."][".$user_time."]";
        $found_entry = 0;
        foreach (parent::$file_lines as $user_line)
        {
            if (strpos($user_line, $entry, 0) === FALSE){}
            else
            {
                $user_line = $line;
                $found_entry = 1;
            }
        }
        if ($found_entry == 0)  //if we could not find the entry, then we append it to the list of lines to write.
            $this->$file_lines.append($line);
        parent::write_file();   //I don't think I need to explicitly call parent... on this.
    }
}

function read_users()
{
    $return_value;
    $timeout = 60 * 10; //60 seconds by 15 minutes.
    $user_object = new UserFileObject('users.txt', $timeout);   //automatically prunes users past the timeout period
    $user_object->write_file(); //sdon't forget to write the file - otherwise pruning won't work.

    foreach($user_object->$file_lines as $value)
    {
        $return_value += "<line type='users'>".$value."</line>";
    }
    return $return_value;
}

function write_user($user)
{   //this function wil define what each user line will look like.
    $timeout = 60 * 10; //60 seconds by 15 minutes.
    $user_object = new UserFileObject('users.txt', $timeout);   //automatically prunes users past the timeout period
    $user_object->write_entry($user);
    $user_object->write_fie();
}

	function write_message($message)
	{
		$fp_messages = fopen('messages.txt', 'a');
		if ($fp_messages)
		{
			fwrite($fp_messages, $message."\n");
			fclose($fp_messages);
		}
	}
	function write_lines($line)
	{
		$fp_line = fopen('line.txt', 'w');
		if ($fp_line)
		{
			fwrite($fp_line, $line);
			fclose($fp_line);
		}
	}
	function read_line_number()
	{
		$fp_line = fopen('line.txt', 'r');
		$response = 0;
		
		if ($fp_line)
		{
			if (($line = fgets($fp_line)) !== false)
			{
				$response = $line;
			}
			fclose($fp_line);
		}
		return $response;
	}
	

	function write_debug($msg)
	{
		$fp_debug = fopen('debuglog.txt', 'a');
		if ($fp_debug)
		{
			fwrite($fp_debug, $msg."\r\n");
			fclose($fp_debug);
		}
	}
	function get_next_line_number()
	{
		$line_num = read_line_number();
		$line_num++;
		write_lines($line_num);
		return $line_num;
		
	}
	function parse_line_number($line)
	{
		$num = 0;
		if (($found = strpos($line, '[')) === FALSE)
		{
		}
		else
		{
			//we have found something...
			if (($found2 = strpos($line, ']', $found)) === FALSE)
			{
			}
			else
			{
				//we now have the start and end position of the number
				$found += 1;
				$num = substr($line, $found, ($found2 - $found));
			}
			
		}
		return $num;
	}
	function read_messages($last_message)
	{
		$fp_messages = fopen('messages.txt', 'r');
		$response = '';
		write_debug("Opening Message Log");
		if ($fp_messages)
		{
			write_debug("Opened Message Log");
			while (($line = fgets($fp_messages)) !== false)
			{
				//parse each line to get the message number ..
				//this will slow things down very quickly.
				$log_line = parse_line_number($line);
				write_debug("Got Line number - ".$log_line);
				if ($log_line > $last_message)
				{
					$response .= $line;
				}
			}
			fclose($fp_messages);
		}
		else{}
		//$find = array("\'", "\"");
		//$replace = array("'", "\"");
		//$unescaped_response = str_replace($find, $replace, $response); 
		$unescaped_response = stripslashes($response);
		return $unescaped_response;
	}
	/*
	There are 5 functions:

		join - add a user to the chatroom
		send - send a message (user details are included)
		remove - remove a user from the chatroom
		users - get a list of users (trimmed so that 'expired' users are removed from the list)
		test - spit out a test message
	*/
	header('Content-type: text/xml; charset=utf-8');
	header("Access-Control-Allow-Origin: *");

	if (!empty($_POST['test']))
	{
		echo "testing";
	}
	if (!empty($_GET['query']) or !empty($_POST['query']))
	{
		$response = '';
		$func = $_GET['query'];
		if (empty($func) && !empty($_POST['query']))
			$func = $_POST['query'];

		if ($func == 'test')
		{
			$response = '<line>[000001]{User1}Welcome to the Chatmium server.</line>
			<line>[00002]{User2}Chatmium by Shaheed Abdol: http://www.shaheedabdol.co.za</line>';
		}
		else if ($func == 'send')
		{
			$user = $_GET['user'];
			if (empty($user) && !empty($_POST['user']))
				$user = $_POST['user'];
				
			$userid = $_GET['userid'];
			if (empty($userid) && !empty($_POST['userid']))
				$userid = $_POST['userid'];
				
			$targetuserid = $_GET['targetuserid'];
			if (empty($targetuserid) && !empty($_POST['targetuserid']))
				$targetuserid = $_POST['targetuserid'];

			$message = trim($_GET['value']);
			if (empty($message) && !empty($_POST['value']))
				$message = $_POST['value'];
			$response = "<line from='".$userid."' to='".$targetuserid."'>[".get_next_line_number()."]{".$user."}".$message."</line>";
            write_user($user);  //update the last 'sent' time of user.
			write_message($response);
			write_debug("Message Received:".$response);
			$response = '';
		}
		else if ($func == 'fetch')
		{
			$last_message = $_GET['value'];
			write_debug("received fetch query, last message:".$last_message);
			if (empty($last_message) && !empty($_POST['value']))
				$last_message = $_POST['value'];
			
			write_debug("received fetch query, last message:".$last_message);
			if (strlen($last_message))
			{
				write_debug("reading response:".$last_message);
				$response = read_messages($last_message);
			}
		}
		else if ($func == 'join')
		{
			$user = $_GET['user'];
			if (empty($user) && !empty($_POST['user']))
				$user = $_POST['user'];
				
			$response = "<line>[".get_next_line_number()."]{".$user."}has joined the room!</line>";
            write_user($user);
			write_message($response);
			write_debug($response);
		}
		else if ($func == 'remove')
		{	//remove messages are the only ones with a type prefix
			$user = $_GET['user'];
			if (empty($user) && !empty($_POST['user']))
				$user = $_POST['user'];
			
			$userid = $_GET['userid'];
			if (empty($userid) && !empty($_POST['userid']))
				$userid = $_POST['userid'];

			$response = "<line type='remove' from='".$userid."' to='-1'>[".get_next_line_number()."]{".$user."}has left the room!</line>";
			write_message($response);
			write_debug($response);
			$response = '';	//do not respond to the same client - they have closed their window
		}
        else if ($func == 'users')
        {
			$user = $_GET['user'];
			if (empty($user) && !empty($_POST['user']))
				$user = $_POST['user'];
				
			$response = read_users();
			write_debug($response);
        }
		if (strlen($response))
			write_debug("server responding with:".$response);
		echo $response;
	}
	else
	{
		echo "<p>File accessed without GET or POST</p>";
	}

?>
