const router_login = require("../../routes/auth");
// var User, app, mongoose, request, server, should, user, agent;
// should   = require("should");
// app      = require("../server");
// mongoose = require("mongoose");
// User     = mongoose.model("User");


const express = require('express');
const app = express();
var router = express.Router();
var path = require("path");
const session = require("client-sessions");
var logger = require("morgan");
var cors = require("cors");
var Cookies;
request  = require("test");
agent = request.agent(app)

// req.body.username = "naorbe";
// req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

describe('Functional Test <Sessions>:', function () {
  it('should create user session for valid user', function (done) {
      request(app)
        .post("../../routes/auth")
        .set('Login','application/json')
        .send({"username": "naorbe", "password": "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK"})
        // .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.id.should.equal('3');
          res.body.username.should.equal('naorbe');
          res.body.password.should.equal('$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK');
          // Save the cookie to use it later to retrieve the session
          Cookies = res.headers['set-cookie'].pop().split(';')[0];
          done();
        });
    });
  // it('should get user session for current user', function (done) {
  //     var req = request(app).get('/v1/sessions');
  //     // Set cookie to get saved user session
  //     req.cookies = Cookies;
  //     req.set('Accept','application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(200)
  //       .end(function (err, res) {
  //         res.body.id.should.equal('1');
  //         res.body.short_name.should.equal('Test user');
  //         res.body.email.should.equal('user_test@example.com');
  //         done();
  //       });
  //   });
  });


// var x = 0;
// describe('Login API', function() {
//   it('successful user login', function(done) {
//       var res 
//       var req = request(router_login).post(router_login);
//       res.status = 400;
//       res.send = "bad request";


//       req.body.username = "naorbe";
//       req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

//       var res_toBe = new object;
//       res_toBe.status = 200;
//       res_toBe.send = "login succeeded";

//       expect(router_login.post("/Login", (req, res, next))
//       ).toBe(res_toBe);
//     });
//   });

  /*--------------------------------------------------*/
  
// var requestp = require("supertest-as-promised");
// var agent1 = requestp.agent(app)

//   beforeEach(function (done) {
//     // Clear data before testing
//     user1 = {
//         name: 'Fake User',
//         username: 'test',
//         email: 'test@test.com',
//         password: 'password'
//     };

//     user2 = {
//         name: 'Fake User2',
//         username: 'test2',
//         email: 'test2@test.com',
//         password: 'password2'
//     };

//     job = {
//         email: 'job@test.com'
//         , title: 'Title'
//         , description: 'Job description that is at least 60 characters with much detail'
//         , apply: 'Application instructions'
//         , company: 'Company'
//         , location: 'Location'
//     };

//     function createUser1(cb){
//       agent1
//           .post('/api/users')
//           .send(user1)
//           .expect(200)
//           .end(function(err, res){
//               if ( err ) throw err;

//               loginUser1.call(null, cb);
//           });
//   }
//   function loginUser1(cb){
//     agent1
//         .post('/api/session')
//         .send({
//             email: user1.email
//             , password: user1.password
//         })
//         .expect(200)
//         .end(function(err, res){
//             if ( err ) throw err;

//             loggedInUser1 = res.body;

//             cb();
//         });
// }

// function createUser2(cb){
//     agent2
//         .post('/api/users')
//         .expect(200)
//         .send(user2)
//         .end(function(err, res){
//             if (err) throw err;

//             loginUser2.call(null, cb);
//         });
// }

// function loginUser2(cb){
//     agent2
//         .post('/api/session')
//         .send({
//             email: user2.email
//             , password: user2.password
//         })
//         .end(function(err, res){
//             if ( err ) throw err;

//             loggedInUser2 = res.body;

//             cb();
//         });
// }
// });

// async.series([function(cb){
//     createUser1(cb);
// }, function(cb){
//     createUser2(cb);
// }], done);

// afterEach(function (done) {
//   User.remove()
//       .execQ()
//       .then(function(){
//           return Job.remove().execQ()
//       })
//       .done(function(){
//           done();
//       });
// });