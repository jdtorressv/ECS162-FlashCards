// public file js

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

