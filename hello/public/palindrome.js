function run() {
let input = document.getElementById("word").value;
let url = "query?word=" + input;
let xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.onload = function() {
	res = xhr.responseText;
	document.getElementById('outputGoesHere').textContent = res;
};
xhr.onerror = function() {
	console.log("An error occurred");
};
xhr.send();

}
