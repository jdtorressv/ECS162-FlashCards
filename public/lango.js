'use strict';
//import React from 'react';

// An element to go into the DOM

var lango = React.createElement(
	"h1",
	{ id: "lango" },
	"Lango!"
);

function createLogo() {
	return React.createElement(
		"div",
		{ id: "logo" },
		React.createElement(startReviewButton, null),
		lango);
}

// A component - function that returns some elements 
function SecondCard() {
	return React.createElement(
			"div",
			{ id: "textCard2" },
			React.createElement(
				"p",
				{ id: "output" },
				
			)
	);
}

// Another component
function FirstInputCard() {
	return React.createElement(
		"div",
		{ id: "textCard" },
		React.createElement("textarea", { id: "input", onKeyPress: checkReturn })
	);
}

function flashcards() {
	return React.createElement(
		"div",
		{ id: "flashcards" },
		React.createElement(FirstInputCard, null),
		React.createElement(SecondCard, null),
//		React.createElement(createSaveButton, null),
	);
}

function createSaveButton() {
	return React.createElement(
		"div",
		{ id: "saveButton" },
		React.createElement( 
			"button",
			{ id: "save", onClick: getSaveRequest},
			"Save"),
		);
}

function startReviewButton() {
	return React.createElement(
		"button",
		{ id: "startReview" },
		"Start Review");
}

// An element with some contents, including a variable
// that has to be evaluated to get an element, and some
// functions that have to be run to get elements. 
var main = React.createElement(
	"main",
	null,
	React.createElement(createLogo, null),
	React.createElement(flashcards, null),
//	React.createElement(FirstInputCard, null),
//	React.createElement(SecondCard, null),
	React.createElement(createSaveButton, null),
);

ReactDOM.render(main, document.getElementById('root'));

// onKeyPress function for the textarea element
// When the charCode is 13, the user has hit the return key
function checkReturn(event) {
	if(event.charCode == 13)
		getTranslationRequest();
}

function createCORSRequest(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  return xhr;
}

// When user hits enter:
function getTranslationRequest() {
  console.log(document.getElementById("input").value);
  let url = "/translate?english="+document.getElementById("input").value;
  let xhr = createCORSRequest('GET', url);

  if(!xhr){
    alert('CORS not supported');
    return;
  }
  xhr.onload = function() {
    let res = xhr.responseText; // gives translation
    document.getElementById('output').textContent = res;
    console.log(res);
  }
  xhr.onerror = function() {
    alert('Error');
  }
  xhr.send();
}

// When user hits save:
function getSaveRequest() {
  let input = document.getElementById("input").value;
  let output = document.getElementById("output").textContent;
  let url = "/store?english="+input+'&spanish='+output;
  let xhr = createCORSRequest('POST', url);
  if(!xhr){
    alert('CORS not supported');
    return;
  }
  xhr.onload = function() {
    console.log(xhr.responseText);
  }
  xhr.onerror = function() {
    alert('Error');
    return;
  }
  
  document.getElementById("input").value = "";
  document.getElementById("output").textContent = "";
  xhr.send();
}

// for next part of the project
// function getNext(){
//
// }
//
// function isCorrect() {
//
// }
//
// function getReview() {
//
// }
//
// function resetReview() {
//
// }
