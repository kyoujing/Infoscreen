<?php
	$passwordProtection = true;
	$passwd = "password12345";
	
	if ($_POST["action"] === "add") {
		if (!verifyAccess()) resultPage(401, "Incorrect password");
		
		$data = json_decode(file_get_contents("./events.json"));
		$oldlength = count($data);
		$new = json_decode($_POST["new"]);
		$new = verifyEvent($new);
		if ($new == false) resultPage(400, "Invalid input");
		$data[] = $new;
		if (count($data) <= $oldlength) {
			resultPage(500, "This should not happen with valid inputs");
		}
		file_put_contents("./events.json", json_encode($data));
		resultPage(200, "Success");
	}
	
	if ($_POST["action"] === "rss_add") {
		if (!verifyAccess()) resultPage(401, "Incorrect password");
		
		$data = json_decode(file_get_contents("./rss.json"));
		$oldlength = count($data);
		$new = json_decode($_POST["new"]);
		if ($new == false) resultPage(400, "Invalid input");
		$found = false;
		for ($i = 0; $i < count($data); $i++) {
			if ($data[$i]->url == $new->url) {
				$data[$i] = $new;
				$found = true;
				break;
			}
		}
		if (!$found) {
			$data[] = $new;
		}
		if (!(count($data) >= $oldlength)) {
			resultPage(500, "This should not happen with valid inputs");
		}
		file_put_contents("./rss.json", json_encode($data));
		resultPage(200, "Success");
	}
	
		if ($_POST["action"] === "rss_delete") {
		if (!verifyAccess()) resultPage(401, "Incorrect password");
		
		$data = json_decode(file_get_contents("./rss.json"));
		$oldlength = count($data);
		$new = $_POST["url"];
		if ($new == false) resultPage(400, "Invalid input");
		$found = false;
		for ($i = 0; $i < count($data); $i++) {
			if ($data[$i]->url == $new) {
				unset($data[$i]);
				$data = array_values($data);
				$found = true;
				break;
			}
		}
		if (!$found) resultPage(400, "Invalid URL");
		if (count($data) != $oldlength-1) {
			resultPage(500, "This should not happen with valid inputs");
		}
		file_put_contents("./rss.json", json_encode($data));
		resultPage(200, "Success");
	}
	
	if ($_POST["action"] === "remove") {
		if (!verifyAccess()) resultPage(401, "Incorrect password");
		
		$data = json_decode(file_get_contents("./events.json"));
		$oldlength = count($data);
		$id = $_POST["id"];
		$found = false;
		for ($i = 0; $i < count($data); $i++) {
			if ($data[$i]->id == $id) {
				unset($data[$i]);
				$data = array_values($data);
				$found = true;
				break;
			}
		}
		if (!$found) resultPage(400, "Invalid ID");
		
		if (!(count($data) == $oldlength-1)) {
			resultPage(500, "This should not happen with valid inputs");
		}
		file_put_contents("./events.json", json_encode($data));
		resultPage(200, "Success");
	}
	
	if ($_POST["action"] === "replace") {
		if (!verifyAccess()) resultPage(401, "Incorrect password");
		
		$data = json_decode(file_get_contents("./events.json"));
		$oldlength = count($data);
		$id = $_POST["id"];
		$new = json_decode($_POST["new"]);
		$new = verifyEvent($new);
		$new->id = $id;
		if ($new == false) resultPage(400, "Invalid input");
		//$data[] = $new;
		$found = false;
		for ($i = 0; $i < count($data); $i++) {
			if ($data[$i]->id == $id) {
				$data[$i] = $new;
				$found = true;
				break;
			}
		}
		if (!$found) resultPage(400, "Invalid ID");
		
		if (!(count($data) == $oldlength)) {
			resultPage(500, "This should not happen with valid inputs");
		}
		file_put_contents("./events.json", json_encode($data));
		resultPage(200, "Success");
	}

	function verifyAccess() {
		global $passwd;
		global $passwordProtection;
		if (!$passwordProtection) return true;
		return $_POST["access"] == hash("sha256", $passwd) or $_COOKIE["infoeditor-access"] == hash("sha256", $passwd);
	}
	
	function resultPage($code, $msg) {
		http_response_code($code);
		echo($msg);
		exit();
	}
	
	function verifyEvent($data) {
		if (array_key_exists("text", $data) and array_key_exists("text", $data)) {
			$data->id = substr(str_shuffle(MD5(microtime())), 0, 10);
			return $data;
		} else {
			return false;
		}
	}
	
?>
<!doctype html>
<html>
	<head>
		<script>const passwordProtection = <?php echo($passwordProtection); ?>;</script>
		<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
		<script src="./sjcl.js"></script>
		<script src="./editor.js"></script>
		<link rel="stylesheet" type="text/css" href="./editor.css"/>
		<title>Post editor</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<div id="screen_main"<?php if (!verifyAccess()) echo(" style=\"display: none;\""); ?>>
			<div>
				<h2>Manual posts</h2>
				<p>Add, modify and delete posts manually.</p>
				<ul id="events">
					<li>Loading...</li>
				</ul>
				<input type="submit" value="Add new" id="input_newEvent">
			</div>
			<div>
				<h2>RSS sources</h2>
				<p>Load new posts automatically from RSS feeds.</p>
				<ul id="rss">
					<li>Loading...</li>
				</ul>
				<input type="submit" value="Add new" id="input_newRSS">
			</div>
		</div>
		<div id="screen_login" <?php if (verifyAccess()) echo(" style=\"display: none;\""); ?>>
			<p>Enter password:</p>
			<input type="password" id="input_passwd">
			<input type="submit" value="Login" id="input_loginButton">
		</div>
		<div id="screen_newRSS" style="display: none;">
			<h2>RSS source editor</h2>
			<p>URL:</p>
			<input type="text" id="rss_url">
			<p>Show posts newer than (seconds)</p>
			<input type="number" id="rss_timelimit">
			<p id="rss_timelimitText"></p><br/>
			<p>Show posts for (seconds)</p>
			<input type="number" id="rss_duration"><br/><br/>
			<input type="submit" value="Save" id="rss_save"><input type="submit" value="Cancel" id="rss_cancel">
		</div>
		<div id="screen_newEvent" style="display: none;">
			<h2>Post editor</h2>
			<p>Title:</p>
			<input type="text" id="event_title">
			<p>Content:</p>
			<textarea id="event_text" rows="10" cols="50"></textarea>
			<p>Start showing at: (Optional)</p>
			<input type="number" id="event_startTime">
			<p id="event_startTimeText"></p><br/>
			<p>Stop showing at: (Optional)</p>
			<input type="number" id="event_endTime">
			<p id="event_endTimeText"></p><br/>
			<p>Show post for (seconds)</p>
			<input type="number" id="event_duration">
			<input type="submit" value="Save" id="event_save"><input type="submit" value="Cancel" id="event_cancel">
		</div>
	</body>
</html>