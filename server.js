// TU2791e6ef3a03ece19159c4309b047384b84008287834e184cef9943a97936ce4436bb097531501a1c3fdf8029ec9332f
"use strict";

var express = require("express");
var path = require("path");
var https = require("https");
var http = require("https");
var bodyParser = require("body-parser");
const jwt = require("jwt-simple");
const passport = require("passport");
//ใช้ในการ decode jwt ออกมา
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;
var cookieParser = require('cookie-parser');


var PORT = process.env.PORT || 5000;
var app = express();

const SECRET = "5555"; //ในการใช้งานจริง คีย์นี้ให้เก็บเป็นความลับ

var cookieExtractor = function(req) {
  var token = null;
  if (req && req.cookies) token = req.cookies['jwt'];
  return token;
};
//สร้าง Strategy
// ExtractJwt.fromHeader("authorization"),
const jwtOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: SECRET
};
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  done(null, true);
});
//เสียบ Strategy เข้า Passport
passport.use(jwtAuth);
//ทำ Passport Middleware
const requireJWTAuth = passport.authenticate("jwt",{session:false});

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.listen(PORT, function () {
  console.log(`Listening on ${PORT}`);
});

const loginMiddleware = async (req, res, next) => {
  const temp = await getlogin(req.body.user, req.body.pwd); 
  if (temp) {
    let j = JSON.parse(temp);
    if (j.status == true) {
      res.userInfo = temp;
      next();
    } else{
      res.status(422).send('{"status":false}');
    }

  } else {
    res.status(422).send('{"status":false}');
  }
}


app.get("/", function (req, res) {
  res.render("index", { });
});

app.get("/test", requireJWTAuth, function (req, res) {
  res.send("test");
});
app.get("/welcome/:id", requireJWTAuth, async function(req, res){ 
  var name_id = req.params.id;
  console.log(name_id);
  const data = await getStudentInfo(name_id);
  console.log(data);
  if (data) {
    let j = JSON.parse(data);
    res.render("welcome", 
    {prefix: j.data.prefixname,
     name_th: j.data.displayname_th,
     name_en: j.data.displayname_en,
     email: j.data.email,
     faculty: j.data.faculty,
     department: j.data.department,
     name_id: name_id
     });
  }
});

app.get("/setCase/:id", requireJWTAuth , async function (req, res) {
  var name_id = req.params.id;
  const data = await getStudentInfo(name_id);
  console.log(data);
  if (data) {
    let j = JSON.parse(data);
    res.render("setCase", 
    {prefix: j.data.prefixname,
     name_th: j.data.displayname_th,
     name_en: j.data.displayname_en,
     email: j.data.email,
     faculty: j.data.faculty,
     department: j.data.department,
     name_id: name_id
     });
  }
});

app.get("/from/:id", requireJWTAuth , async function (req, res) {
  var name_id = req.params.id;
  const data = await getStudentInfo(name_id);
  console.log(data);
  if (data) {
    let j = JSON.parse(data);
    res.render("from", 
    {prefix: j.data.prefixname,
     name_th: j.data.displayname_th,
     name_en: j.data.displayname_en,
     email: j.data.email,
     faculty: j.data.faculty,
     department: j.data.department,
     name_id: name_id
     });
  }
});


app.post("/login", loginMiddleware, (req, res) => {
  console.log(res.userInfo);
  let userInfo = JSON.parse(res.userInfo);
  const payload = {
    sub: userInfo.username,
    iat: new Date().getTime()//มาจากคำว่า issued at time (สร้างเมื่อ)
 };
 let token = jwt.encode(payload, SECRET);
 res.cookie('jwt', token, {maxAge: 360000});
 res.send(userInfo);
});

app.get('/logout', function(req, res){
  //res.clearCookie('jwt', { path: '/' });
  res.cookie('jwt', 'xxx', {maxAge: 0});
  //res.cookie('test', 'xxx', {maxAge: 100});
  //res.render('index', { });
  res.redirect('/');
});

app.post("/api", async (req, res) => {

  const temp = await getlogin(req.body.user, req.body.pwd); 

  if (temp) {
    let j = JSON.parse(temp);

    if (j.status == true) {
      res.send(temp);

    } else{
      res.send('{"status":false}');
    }

  } else {
    res.send('{"status":false}');
  }

});

const getlogin = (userName, password) => {
  return new Promise((resolve, reject) => {
    var options = {
      'method': 'POST',
      'hostname': 'restapi.tu.ac.th',
      'path': '/api/v1/auth/Ad/verify',
      'headers': {
        'Content-Type': 'application/json',
        'Application-Key': 'TU2791e6ef3a03ece19159c4309b047384b84008287834e184cef9943a97936ce4436bb097531501a1c3fdf8029ec9332f'
      }
    };

    var req = https.request(options, (res) => {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        //result = body;
        resolve(body.toString());
        //result = chunks;
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });
    var postData =  "{\n\t\"UserName\":\"" + userName + "\",\n\t\"PassWord\":\""+ password + "\"\n}";
    req.write(postData);
    req.end();
  });
};

const getStudentInfo = (username) => {
  return new Promise((resolve, reject) => {
    var options = {
      method: "GET",
      hostname: "restapi.tu.ac.th",
      path: "/api/v2/profile/std/info/?id=" + username,
      headers: {
        "Content-Type": "application/json",
        "Application-Key":
          "TU2791e6ef3a03ece19159c4309b047384b84008287834e184cef9943a97936ce4436bb097531501a1c3fdf8029ec9332f",
      },
    };

    var req = https.request(options, (res) => {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body = Buffer.concat(chunks);
        //result = body;
        resolve(body.toString());
        //result = chunks;
      });

      res.on("error", function (error) {
        console.error(error);
        reject(error);
      });
    });

    req.end();
  });
};

// function test() {

//     var options = {
//         'method': 'GET',
//         'hostname': 'restapi.tu.ac.th',
//         'path': '/api/v2/profile/std/info/?id=6209650016',
//         'headers': {
//           'Content-Type': 'application/json',
//           'Application-Key':'TU2791e6ef3a03ece19159c4309b047384b84008287834e184cef9943a97936ce4436bb097531501a1c3fdf8029ec9332f',
//         },
//       };

//   var req = https.request(options, function (res) {
//     var chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function (chunk) {

//        var body = Buffer.concat(chunks);
//        result = body.toString();

//         //result = chunks;
//     });

//     res.on("error", function (error) {
//       console.error(error);
//     });
//   });

//   req.end();

// }

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

// const options = {
//     hostname: 'jsonplaceholder.typicode.com',
//     path: '/posts/1/comments',
//     method: 'GET',
//     'headers': {
//         'Content-Type': 'application/json',
//     }
// };

// function dataCounter(inputs) {
//     let counter = 0;
//     for (const input of inputs) {
//         if (input.postId === 1) {
//             counter += 1;
//             console.log('input.postId:' + input.postId);
//             console.log('input.email:' + input.email);
//         }
//     }
//     return counter;
// };

// const req = http.request(options, function(response) {
//     response.setEncoding('utf8');
//     var body = '';
//     response.on('data', chunk => {
//         body += chunk;
//     });

//     response.on('end', () => {
//         console.log('body:' + body);
//         var data = JSON.parse(body);
//         console.log('number of posts:' + dataCounter(data));
//         console.log('data:' + data);
//         console.log('data[0]:' + data[0]);
//         console.log('data[0].id:' + data[0].id);
//         console.log('data[0].email:' + data[0].email);
//         console.log('end of GET request');
//     });
// });

// req.on('error', e => {
//     console.log('Problem with request:', e.message);
// });
// req.end();
