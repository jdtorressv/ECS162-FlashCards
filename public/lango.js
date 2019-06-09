'use strict';

var card = {};

let lango = React.createElement(
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

function AnswerBox() {
        return React.createElement(
                "div",
                { id: "answerBox" },
                React.createElement("textarea", { id: "answer", onKeyPress: checkCorrect })
        );

}

function flashcards() {
	return React.createElement(
		"div",
		{ id: "flashcards" },
		React.createElement(createAnswerCard, null),
		React.createElement(FirstInputCard, null),
		React.createElement(SecondCard, null),
		React.createElement(AnswerBox, null)
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

function createNextButton() {
	return React.createElement(
		"div",
		{ id: "nextButton"},
		React.createElement("button", { id: "next", onClick: nextCard }, "Next")
		);
}

function startReviewButton() {
	return React.createElement(
		"button",
		{ id: "startReview", onClick: toStartReview },
		"Start Review");
}

function usernameP() {
	return React.createElement("p", { id: 'username' });
}

function createUsername() {
	setupPage();
	return React.createElement(
		"div",
		{ id: 'usernameBar' },
		React.createElement(usernameP, null),
		// username
	);
}

function createFlipBtn() {
	return React.createElement(
		"button",
		{ id: 'flip', onClick: flipCard },
		"Flip"
	);
}

function createAnswerCard() {
	return React.createElement(
		"div",
		{ id: 'answerCard' },
		React.createElement(createFlipBtn, null),
		React.createElement(createFrontCard, null),
		React.createElement(createBackCard, null)
	)
}

function createFrontCard() {
	return React.createElement(
		"div",
		{ id: 'frontCard' },
		React.createElement(createFrontText, null)
	)
}

function createFrontText() {
	return React.createElement(
		"p",
		{ id: 'frontText' }
	)
}

function createBackCard() {
	return React.createElement(
		"div",
		{ id: 'backCard' },
		React.createElement(createBackText, null)
	)
}

function createBackText() {
	return React.createElement(
		"p",
		{ id: 'backText' }
	)
}

// An element with some contents, including a variable
// that has to be evaluated to get an element, and some
// functions that have to be run to get elements.
var main = React.createElement(
	"main",
	null,
	React.createElement(createLogo, null),
	React.createElement(flashcards, null),
	React.createElement(createSaveButton, null),
	React.createElement(createNextButton, null),
	React.createElement(createUsername, null)
);
ReactDOM.render(main, document.getElementById('root'));

// onKeyPress function for the textarea element
// When the charCode is 13, the user has hit the return key
function checkReturn(event) {
	if(event.charCode == 13)
		getTranslationRequest();
}

function checkCorrect(event) {
	if(event.charCode == 13){
		let input = document.getElementById("answerBox").value;
		let answer = document.getElementById("output").textContent;
		if(input == answer){
			let url = '/updateCorrect';
			let xhr = createCORSRequest('GET', url);
			if(!xhr){
				alert('CORS not supported');
			}
			xhr.onload = function() {
				console.log("updated Correct");
			}
			xhr.onerror = function() {
				alert('Error');
			}
			xhr.send();
			// flip card and display correct and update correct
		}
		else {
			// flip card and show answer
		}
	}
}

function flipCard() {
//	document.getElementById('frontCard').style.transform = rotateY(180deg);
//	document.getElementById('backCard').style.transform = rotateY(0deg);
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

function nextCard() {
	let url = '/updateSeen';
	let xhr = createCORSRequest('GET', url);
	if(!xhr){
		alert("CORS not supported");
	}
	xhr.onload = function() {
		let temp = JSON.parse(xhr.responseText);
		this.card = temp;
		console.log(temp);
		document.getElementById('frontText').textContent = temp.input;
		document.getElementById('backText').textContent = temp.output;
		// document.getElementById('frontCard').style.transform = perspective(600px) rotateY(0deg);
		// document.getElementById('backCard').style.transform = perspective(600px) rotateY(180deg);
	}
	xhr.onerror = function() {
		alert('Error');
	}
	xhr.send();
}

function addBtn() {
	document.getElementById("textCard2").style.display = 'flex';
	document.getElementById("answerBox").style.display = 'none';
	document.getElementById("startReview").textContent = 'Start Review';
	document.getElementById("save").style.display = 'block';
	document.getElementById("flashcards").style.flexDirection = 'row';
	document.getElementById("next").style.display = 'none';
	document.getElementById("answerCard").style.display = 'none';
}

function setupPage() {
	let url = "/getUser";
	let xhr = createCORSRequest('GET', url);
	if(!xhr){
		alert('CORS not supported');
	}
	xhr.onload = function() {
		let temp = JSON.parse(xhr.responseText);
		console.log(temp[1].firstname);
		// username = temp[1].firstname;
		document.getElementById('username').textContent = temp[1].firstname;
		let url = "/getCards";
		let xhr = createCORSRequest('GET', url);
		if(!xhr){
			alert('CORS not supported');
		}
		xhr.onload = function() {
			console.log(xhr.responseText);
			let temp = JSON.parse(xhr.responseText);
			if(temp.length != 0){
				toStartReview();
			}
			else{
				console.log('No cards from this user');
			}
		}
		xhr.onerror = function() {
			alert('Error');
			return;
		}
		xhr.send();
	}
	xhr.onerror = function() { alert('Error'); return; }
	xhr.send();
}

function toStartReview() {
	let url = "/getCards";
	let xhr = createCORSRequest('GET', url);
	if(!xhr){
		alert('CORS not supported');
	}
	xhr.onload = function() {
		this.cards = JSON.parse(xhr.responseText);
		console.log("cards: ", this.cards);
		nextCard();
	}
	xhr.onerror = function() {
		alert('Error');
		return;
	}
	
	// shuffle cards
	document.getElementById("textCard").style.display = 'none';
	document.getElementById("textCard2").style.display = 'none';
	document.getElementById("answerBox").style.display = 'block';
	document.getElementById("startReview").textContent = 'Add';
	document.getElementById("save").style.display = 'none';
	document.getElementById("flashcards").style.flexDirection = 'column';
	document.getElementById("next").style.display = 'block';
	document.getElementById("answerCard").style.display = 'flex';

	xhr.send();
}
