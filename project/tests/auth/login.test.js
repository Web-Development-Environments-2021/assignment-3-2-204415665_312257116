const router_login = require("../../routes/auth");

var express = require("express");

var app = express();

test('successful user login', () => {
    var res = app.response;

    var req = app.request;
    req.body = new Object();
    req.body.username = new Object();
    req.body.password = new Object();
    req.body.username = "naorbe";
    req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

    var next = app.next;

    var res_toBe = new Object();
    res_toBe.statusCode = 200;
    res_toBe.send = "login succeeded";


    app.use(router_login.post("/Login"));
    expect(res.statusCode
    ).toBe(res_toBe.statusCode);
  });


// first try - with Err

//   test('successful user login', () => {
//     var res = new Object();
//     res.status = 400;
//     res.send = "bad request";

//     var req = new Object();
//     req.body = new Object();
//     req.body.username = "naorbe";
//     req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

//     var next = new Object();

//     var res_toBe = new Object();
//     res_toBe.status = 200;
//     res_toBe.send = "login succeeded";

//     expect(app.use(router_login.post((req, res, next)))
//     ).toBe(app.use(async function(req, res_toBe) {res_toBe}));
//   });
