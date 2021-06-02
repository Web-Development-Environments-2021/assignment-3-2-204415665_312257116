const router_login = require("../../routes/auth");


var x = 0;

test('successful user login', () => {
    var res = new object;
    res.status = 400;
    res.send = "bad request";

    var req = new object;
    req.body = new object;
    req.body.username = "naorbe";
    req.body.password = "$2a$13$6HoWetVKgfuC0G6EwxnCMu0zkf6tZJO3Xct4lLvXReNstjgWgV9cK";

    var res_toBe = new object;
    res_toBe.status = 200;
    res_toBe.send = "login succeeded";

    expect(router_login.post("/Login", async (req, res, next))
    ).toBe(res_toBe);
  });
