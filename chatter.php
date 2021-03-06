<?php

/*
The Chatmium App - Written by Shaheed Abdol:
http://www.ShaheedAbdol.co.za

If you would like, then you can support his efforts by donating to his worthy causes.

********

Simple web server for a chat service which will run on his website - hopefully they allow writing files
to the local disk on his server.

********

Copyright 24 January 2014. Released under GNU GPL - you may use this file, and any parts of it, verbatim, in your
works or any derivative of this work, as long as you mention my name somewhere on the product or in its documentation.

Enjoy.

Any suggestions can be sent to me on my website ...
*/
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
			fwrite($fp_debug, $msg."\n");
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
		
		if ($fp_messages)
		{
			while (($line = fgets($fp_messages)) !== false)
			{
				//parse each line to get the message number ..
				//this will slow things down very quickly.
				$log_line = parse_line_number($line);
				if ($log_line > $last_message)
				{
					$response .= $line;
				}
			}
			fclose($fp_messages);
		}
		else
		{
		}
		return $response;
	}
	/*
	There are 4 functions:

		join - add a user to the chatroom
		send - send a message (user details are included)
		remove - remove a user from the chatroom
		
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
		if (empty($func))
			$func = $_POST['query'];

		if ($func == 'test')
		{
			$response = '<line>[000001]{User1}Welcome to the Chatmium server.</line>
			<line>[00002]{User2}Chatmium by Shaheed Abdol: http://www.shaheedabdol.co.za</line>';
		}
		else if ($func == 'send')
		{
			$user = $_GET['user'];
			if (empty($user))
				$user = $_POST['user'];

			$message = trim($_GET['value']);
			if (empty($message))
				$message = $_POST['value'];
			$response = "<line>[".get_next_line_number()."]{".$user."}".$message."</line>";
			write_message($response);
			
			//clear out repsonse?
			//let client side request this message along with other chat windows?
			$response = '';
		}
		else if ($func == 'fetch')
		{
			$last_message = $_GET['value'];
			if (empty($last_message))
				$last_message = $_POST['value'];
			$response = read_messages($last_message);
		}
		else if ($func == 'join')
		{
			$user = $_GET['user'];
			if (empty($user))
				$user = $_POST['user'];
			$response = "<line>[".get_next_line_number()."]{".$user."}has joined the room!</line>";
			write_message($response);
			write_debug($response);
		}
		else if ($func == 'remove')
		{
			$user = $_GET['user'];
			if (empty($user))
				$user = $_POST['user'];
			$response = "<line>[".get_next_line_number()."]{".$user."}has left the room!</line>";
			write_message($response);
			write_debug($response);
			$response = '';	//do not respond to the same client - they have closed their window
		}
		echo $response;
	}
	else
	{
		echo "File accessed without GET or POST";
	}

?>
