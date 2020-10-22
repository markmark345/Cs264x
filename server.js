'use strict';
var express = require('express');
var path = require('path');
var https = require('https');
var http = require('http');

var PORT  = process.env.PORT || 5000;

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.render('index', {fname: 'gutohrs', lName: 'hewgors'});
});

app.listen(PORT, function () {
    console.log(`Listening on ${PORT}`)
});

app.get('/api', function (req, res) {
    const queryParams = req.query;
    if(queryParams['user'] == 'a' && queryParams['pwd'] == '123'){
        res.send('login sucess');
    }
    else{
         
        res.send('login fail');
    }

});





//var options = {
//    'method': 'POST',
//    'hostname': 'restapi.tu.ac.th',
//    'path': '/api/v1/auth/Ad/verify',
//    'headers': {
//        'Content-Type': 'application/json',
//        'Application-Key': 'TUa4e553b83aa271d3411a4ad88395265801fcfb074110e8b0e03962c01f2aed6ab1662db3a0e1451df7835880c6828fcf'
//    }
//};

//var req = https.request(options, function (res) {
//    var chunks = [];

//    res.on("data", function (chunk) {
//        chunks.push(chunk);
//    });

//    res.on("end", function (chunk) {
//        var body = Buffer.concat(chunks);
//        console.log(body.toString());
//    });

//    res.on("error", function (error) {
//        console.error(error);
//    });
//});


//var options = {
//    'method': 'GET',
//    'hostname': 'restapi.tu.ac.th',
//    'path': '/api/v2/std/fac/all',
//    'headers': {
//        'Content-Type': 'application/json',
//        'Application-Key': 'TUa4e553b83aa271d3411a4ad88395265801fcfb074110e8b0e03962c01f2aed6ab1662db3a0e1451df7835880c6828fcf'
//    }
//};

//var req = https.request(options, function (res) {
//    var chunks = [];

//    res.on("data", function (chunk) {
//        chunks.push(chunk);
//    });

//    res.on("end", function (chunk) {
//        var body = Buffer.concat(chunks);
//        console.log(body.toString());
//    });

//    res.on("error", function (error) {
//        console.error(error);
//    });
//});

//req.end();


const options = {
    hostname: 'jsonplaceholder.typicode.com',
    path: '/posts/1/comments',
    method: 'GET',
    'headers': {
        'Content-Type': 'application/json',
    }
};

function dataCounter(inputs) {
    let counter = 0;
    for (const input of inputs) {
        if (input.postId === 1) {
            counter += 1;
            console.log('input.postId:' + input.postId);
            console.log('input.email:' + input.email);
        }
    }
    return counter;
};

const req = http.request(options, function(response) {
    response.setEncoding('utf8');
    var body = '';
    response.on('data', chunk => {
        body += chunk;
    });

    response.on('end', () => {
        console.log('body:' + body);
        var data = JSON.parse(body);
        console.log('number of posts:' + dataCounter(data));
        console.log('data:' + data);
        console.log('data[0]:' + data[0]);
        console.log('data[0].id:' + data[0].id);
        console.log('data[0].email:' + data[0].email);
        console.log('end of GET request');
    });
});

req.on('error', e => {
    console.log('Problem with request:', e.message);
});
req.end();