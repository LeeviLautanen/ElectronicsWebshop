const SERVER_KEY = process.env.SERVER_KEY;

function productAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];
  if (token !== SERVER_KEY) {
    return res.status(403).send("Forbidden");
  }

  next();
}

module.exports = productAuth;
