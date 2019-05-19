// public file js

function createCORSRequest(method, url) {
  let xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  return xhr;
}

// When user hits enter:
function getTranslationRequest() {
  let url = "/translate?english="+document.getELementById("input").value;
  let xhr = createCORSRequest('GET', url);

  if(!xhr){
    alert('CORS not supported');
    return;
  }
  xhr.onload = function() {
    let res = xhr.responseText; // gives translation
    document.getElementById('output').textContent = res;
  }
  xhr.onerror = function() {
    alert('Error');
  }
  xhr.send();
}

// When user hits save:
function getSaveRequest() {
  let input = document.getELementById("input").value;
  let output = document.getELementById("output").value;

  let url = "/store?english="+input+'&korean='+output;
  let xhr = createCORSRequest('POST', url);

  if(!xhr){
    alert('CORS not supported');
    return;
  }
  xhr.onload = function() {
    console.log(xhr);
  }
  xhr.onerror = function() {
    alert('Error');
  }
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
