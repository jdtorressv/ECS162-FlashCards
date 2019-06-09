'use strict';

function loginRequest() {
	url = 'auth/google';
	xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function () {console.log("logged in!");};
	xhr.onerror = function () {console.log("browser sees error");};
	xhr.send();
}

function title() {
	return React.createElement("h1", { id: 'title' }, "Welcome to Lango!");
}

function titleMessage() {
	return React.createElement("h2", { id: 'message' }, "Customize your vocabulary");
}

function welcomeSide() {
	return React.createElement("div", { id: 'welcome' }, React.createElement(title, null), React.createElement(titleMessage, null));
}

function loginButton() {
	return React.createElement("a", { href: 'auth/google' }, "Login with Google" ); //id: 'loginButton', onClick: loginRequest }, "Log in with Google");
}

function loginSide() {
	return React.createElement("div", { id: 'login' }, React.createElement(loginButton, null));
}


var main = React.createElement(
		"main",
		null,
		React.createElement(welcomeSide, null),
		React.createElement(loginSide, null)
	);

ReactDOM.render(main, document.getElementById('root'));
