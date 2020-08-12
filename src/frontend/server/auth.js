const SECRET = "adopasino-secret-secret";

const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const compose = require("composable-middleware");

function sign(user) {
  return jwt.sign({ _id: user._id }, SECRET, { expiresIn: 60 * 60 });
}

function sendUnauthorized(req, res) {
  console.log(req.headers.authorization);
  console.log(req.user);
  res.status(401).json({ message: "Unathorized" });
}

const validateJwt = expressJwt({
  secret: SECRET,
  fail: sendUnauthorized,
  getToken(req) {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer"
    ) {
      return req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.access_token) {
      return req.query.access_token;
    }
    return null;
  },
});

function isAuthenticated(User) {
  console.log("isAuthenticated is called");
  return compose()
    .use(validateJwt)
    .use((req, res, next) => {
      // Attach user to request
      console.log(req.user);
      let { _id } = req.user;
      User.findById(_id, "-hashedPassword -salt", function (err, user) {
        if (err) {
          console.log("unable to authenticate");
          return next(err);
        }
        if (!user) return sendUnauthorized(req, res);
        req.user = user;
        console.log("Successfully verified user by token: ", user.email);
        next();
      });
    });
}

module.exports = {
  sign,
  sendUnauthorized,
  isAuthenticated,
};
