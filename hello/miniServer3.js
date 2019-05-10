
const express = require('express')
const port = 57443 // you need to put your port number here

function queryHandler(req, res, next) {
    let url = req.url;
    let qObj = req.query;
    if (qObj.word != undefined) {
	let flipped = qObj.word.split("").reverse().join("");
    	res.json({"palindrome" : qObj.word + flipped}); 	
    } 
    else if (qObj.animal != undefined) {
	res.json( {"beast" : qObj.animal} );
    }
    else {
	next();
    }
}

function fileNotFound(req, res) {
    let url = req.url;
    res.type('text/plain');
    res.status(404);
    res.send('Cannot find '+url); // response cannot be changed after "send"
    }

// put together the server pipeline
const app = express()
app.use(express.static('public'));  // can I find a static file?
app.get('/query', queryHandler );   // if not, is it a valid query?
app.use( fileNotFound );            // otherwise not found

app.listen(port, function (){console.log('Listening...');} )
