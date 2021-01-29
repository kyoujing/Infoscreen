
let eventData;
let rssData;
drawEventList = () => {
	$.getJSON("./events.json", (data) => {
		eventData = data;
		let out = "";
		for (let i = 0; i < data.length; i++) {
			out += "<li><h3>"+s(data[i]["title"])+"</h3>"+s(data[i]["text"])+"<br/><p>Showing from <b>"+timestampToReadableTime(data[i]["startTime"])+"</b> to <b>"+timestampToReadableTime(data[i]["endTime"])+"</b>.</p><input type=\"submit\" value=\"Edit\" onclick=\"EventEditor("+i+")\"><input type=\"submit\" value=\"Delete\" onclick=\"ConfirmDeleteEvent("+i+")\"></li>";
		}
		$("#events").html(out);
	});
}
drawRSSList = () => {
	$.getJSON("./rss.json", (data) => {
		rssData = data;
		let out = "";
		for (let i = 0; i < data.length; i++) {
			out += "<li>"+drawRSSItem(data[i])+"<input type=\"submit\" value=\"Edit\" onclick=\"RSSEditor("+i+")\"><input type=\"submit\" value=\"Delete\" onclick=\"ConfirmDeleteRSS("+i+")\"></li>";
		}
		$("#rss").html(out);
	});
}

RSSEditor = (id) => {
	console.log(id);
	$("#screen_main").css("display", "none");
	$("#screen_newRSS").css("display", "");
	let defaultValues;
	if (id == undefined) {
		defaultValues = {
			"url":"",
			"timelimit":"86400",
			"duration":"20"
		}
	} else {
		defaultValues = rssData[id];
	}
	
	$("#rss_url").val(defaultValues["url"]);
	$("#rss_timelimit").val(defaultValues["timelimit"]);
	$("#rss_duration").val(defaultValues["duration"]);
	$("#rss_timelimitText").html(secondsToReadableTime($("#rss_timelimit").val()));
}

EventEditor = (id) => {
	$("#screen_main").css("display", "none");
	$("#screen_newEvent").css("display", "");
	let defaultValues;
	if (id == undefined) {
		defaultValues = {
			"title":"",
			"text":"",
			"time":"15",
			"startTime":Math.floor(Date.now() / 1000),
			"endTime":"",
		}
	} else {
		defaultValues = eventData[id];
	}
	console.log(defaultValues);
	$("#event_title").val(defaultValues["title"]);
	$("#event_text").val(defaultValues["text"]);
	
	$("#event_startTime").val(defaultValues["startTime"]);
	$("#event_endTime").val(defaultValues["endTime"]);
	$("#event_duration").val(defaultValues["time"]);
	
	editingId = defaultValues["id"];
	$("#event_endTimeText").html(timestampToReadableTime($("#event_endTime").val()));
	$("#event_startTimeText").html(timestampToReadableTime($("#event_startTime").val()));
	
}

ConfirmDeleteRSS = (id) => {
	if (confirm("Delete RSS source \""+rssData[id]["url"]+"\"?")) {
		$.post("./edit.php", {"action": "rss_delete", "url": rssData[id]["url"]}, function() {
			location = "./edit.php";
		});
	}
}

ConfirmDeleteEvent = (id) => {
	if (confirm("Delete event \""+eventData[id]["title"]+"\"?")) {
		$.post("./edit.php", {"action": "remove", "id": eventData[id]["id"]}, function() {
			location = "./edit.php";
		});
	}
}

drawRSSItem = (data) => {
	console.log(data);
	let out = "<div>";

	out += "<p>"+s(data["url"])+"</p><p>Posts <b>newer than "+secondsToReadableTime(data["timelimit"])+"</b>, showing for <b>"+data["duration"]+" seconds</b>.</p></div>";
	return out;
	
}





secondsToReadableTime = (seconds) => {
	let days = Math.floor(seconds/86400);
	let hours = Math.floor(seconds/3600)%24;
	let minutes = Math.floor(seconds/60)%60;
	seconds = Math.floor(seconds)%60;
	
	return days+" days, "+hours+"h "+minutes+"min "+seconds+"sec.";
}

timestampToReadableTime = (seconds) => {
	if (seconds == undefined ||seconds == 0) return "(no limit set)";
	return new Date(seconds*1000).toLocaleString();
}



s = (str) => {
	if (str == undefined) return "";
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}



$(document).ready(function() {
	$("#input_loginButton").click(function() {
		console.log("asdasd");
		let hash = sjcl.hash.sha256.hash($("#input_passwd").val());
		console.log(sjcl.codec.hex.fromBits(hash));
		document.cookie = "infoeditor-access="+(String)(sjcl.codec.hex.fromBits(hash));
		location = "./edit.php";
	});
	$("#input_newRSS").click(function() {
		RSSEditor();
	});
	$("#input_newEvent").click(function() {
		EventEditor();
	});
	$("#rss_save").click(function() {
		$.post("./edit.php", {"action": "rss_add", "new": JSON.stringify({"url": $("#rss_url").val(), "timelimit": $("#rss_timelimit").val(), "duration": $("#rss_duration").val()})}, function() {
			location = "./edit.php";
		});
	});
	$("#event_cancel, #rss_cancel").click(function () {
		$("#screen_main").css("display", "");
		$("#screen_newRSS").css("display", "none");
		$("#screen_newEvent").css("display", "none");
	});
	$("#event_save").click(function() {
		console.log({"title":$("#event_title").val(), "text": $("#event_text").val(), "startTime": $("#event_startTime").val(), "endTime": $("#event_endTime").val(), "time": $("#event_duration").val()});
		if (editingId == undefined) {
			$.post("./edit.php", {"action": "add", "new": JSON.stringify({"title":$("#event_title").val(), "text": $("#event_text").val(), "startTime": $("#event_startTime").val(), "endTime": $("#event_endTime").val(), "time": $("#event_duration").val()})}, function() {
				location = "./edit.php";
			});
		} else {
			$.post("./edit.php", {"action": "replace", "id":editingId, "new": JSON.stringify({"title":$("#event_title").val(), "text": $("#event_text").val(), "startTime": $("#event_startTime").val(), "endTime": $("#event_endTime").val(), "time": $("#event_duration").val()})}, function() {
				location = "./edit.php";
			});
		}
	});
	$("#event_startTime").change(function() {
		$("#event_startTimeText").html(timestampToReadableTime($("#event_startTime").val()));
	});
	$("#event_endTime").change(function() {
		$("#event_endTimeText").html(timestampToReadableTime($("#event_endTime").val()));
	});
	$("#rss_timelimit").change(function() {
		$("#rss_timelimitText").html(secondsToReadableTime($("#rss_timelimit").val()));
	});
	drawEventList();
	drawRSSList();
});

let editingId = undefined;

