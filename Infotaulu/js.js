let eventData;
let eventIndex = 0;
update = () => {
	console.log("update");
	$.getJSON("./events.php", (data) => {
		eventData = data;
		console.log("data received");
	});
}

updateEvents = () => {
	console.log("updateEvents, event index "+eventIndex);
	console.log(eventData);
	if (eventData == undefined) {
		console.log("waiting for data");
		setTimeout(updateEvents, 1000);
		return;
	}
	const uutiset = $("#uutiset");
	const div = $("#laatikko");
	const bar = $("#progressbar");
	uutiset.html(parseEvent(eventData[eventIndex]));
	div.removeClass("fadeOut");
	div.addClass("fadeIn");
	bar.css("animation", "progress "+(eventData[eventIndex].time)+"s linear");
	setTimeout(() => {
		div.addClass("fadeOut");
		div.removeClass("fadeIn");
		bar.removeAttr("style");
	}, eventData[eventIndex].time*1000);
	
	setTimeout(updateEvents, eventData[eventIndex].time*1000+1000);
	eventIndex++;
	if (eventIndex >= eventData.length) {
		eventIndex = 0;
		update();
	}
}

parseEvent = (rawEvent) => {
	let out = "";
	if ("title" in rawEvent) {
		out = out+"<h2>"+rawEvent.title+"</h2>";
	}
	if ("startTime" in rawEvent) {
		let d = new Date(0);
		d.setUTCSeconds(rawEvent.startTime);
		const options = {dateStyle: 'short', timeStyle: 'short'};
		out = out+"<p style=\"color:rgba(0,0,0,0.5);\">"+(new Date(d).toLocaleDateString('fi-FI', options))+"</p>";
	}
	if ("text" in rawEvent) {
		out = out+rawEvent.text;
	}

	return out;
}

window.onload = () => {
	update();
	updateEvents();
}