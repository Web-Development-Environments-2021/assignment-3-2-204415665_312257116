// const express = require("express");
// const app = express();

// const request = require("supertest");
// const router_login = require("../../routes/auth");

// // describe("Test Login Procedure", () => {
// //   test("It should response status 200", done => {
// //     request(app.use(router_login))
// //       .post("/Login").send({
// //             username : "naorbe",
// //             password : "naor@55",
// //       })
// //       .then(response => {
// //         expect(response.statusCode).toBe(200);
// //         done();
// //       });
// //   });
// // });

// describe('Test Login Procedure', () => {
//     it('should login successful', async () => {
//       const res = await request(app.use(router_login))
//         .post('/Login', {
//             body : {
//                username :  "naorbe",
//                password : "naor@55"
//         },})
//         // .send()
        
//       expect(res.statusCode).toEqual(200)
//     //   expect(res.body).toHaveProperty('post')
//     })
//   });








// // const router_login = require("../../routes/auth");

// // var express = require("express");

// // var app = express();

// // test('successful user login', () => {
// //     var res = app.response;

// //     var req = app.request;
// //     req.body = new Object();
// //     req.body.username = new Object();
// //     req.body.password = new Object();
// //     req.body.username = "naorbe";
// //     req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

// //     var next = app.next;

// //     var res_toBe = new Object();
// //     res_toBe.statusCode = 200;
// //     res_toBe.send = "login succeeded";


// //     app.use(router_login.post("/Login"));
// //     expect(res.statusCode
// //     ).toBe(res_toBe.statusCode);
// //   });


// // first try - with Err

// //   test('successful user login', () => {
// //     var res = new Object();
// //     res.status = 400;
// //     res.send = "bad request";

// //     var req = new Object();
// //     req.body = new Object();
// //     req.body.username = "naorbe";
// //     req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

// //     var next = new Object();

// //     var res_toBe = new Object();
// //     res_toBe.status = 200;
// //     res_toBe.send = "login succeeded";

// //     expect(app.use(router_login.post((req, res, next)))
// //     ).toBe(app.use(async function(req, res_toBe) {res_toBe}));
// //   });
