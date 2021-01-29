<?php
header("Content-Type: application/json");
$data = json_decode(file_get_contents("./events.json"));
$out = [];
foreach ($data as $item) {
	if (property_exists($item, "startTime")) {
		if ($item->startTime > 0 && $item->startTime > time()) {
			continue;
		}
	}
	if (property_exists($item, "endTime")) {
		if ($item->endTime > 0 && $item->endTime < time()) {
			continue;
		}
	}
	if (!property_exists($item, "time")) {
		$item->time = 15;
	}
	$out[] = $item;
}
try {
	$rsslist = json_decode(file_get_contents("./rss.json"));
	foreach ($rsslist as $item) {
		$xml = simplexml_load_file($item->url);
		//var_dump($xml);
		foreach (($xml->channel->item) as $rssitem) {
			$rssout = new stdClass();
			$rssout->title = (string)($rssitem->title);
			$rssout->text = (string)($rssitem->description);
			try{
				if ((strtotime($rssitem->pubDate)+($item->timelimit)) < time()) {
					continue;
				}
				$rssout->startTime = strtotime($rssitem->pubDate);
				
			} catch (Exception $e) {
				
			}
			$rssout->time = $item->duration;
			$out[] = $rssout;
		}
	}
}
catch (Exception $e) {
	
}
echo(json_encode($out));
?>