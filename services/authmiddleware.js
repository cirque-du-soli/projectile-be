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
      return next();
    }
  } catch (err) {
    return res.json({ error: err }); //400
  }
};

module.exports = { validateToken };
