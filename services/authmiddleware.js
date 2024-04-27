const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.header("accessToken");

  if (!accessToken) {
    return res.json({ error: "User not logged in!" });
  }
  try {
    const validToken = verify(accessToken, process.env.TOKENKEY);
    if (validToken) {
      req.userToken = validToken;
      console.log("S0021: Token validated");
      console.log(validToken);
      return next();
    }
  } catch (err) {
    return res.json({ error: err }); //400
  }
};

const validateTokenWithoutExpress = function (token, callback) {
  if (!token) {
    return callback({ error: "User not logged in!" }, null);
  }

  try {
    const validToken = verify(token, process.env.TOKENKEY);
    if (validToken) {
      callback(null, validToken);
    } else {
      callback({ error: "Invalid token!" }, null);
    }
  } catch (err) {
    callback(err, null);
  }
}

module.exports = { validateToken, validateTokenWithoutExpress };
