import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;


function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

function extractPayloadFromToken(decodedToken) {
  if (decodedToken && decodedToken.userID && decodedToken.userName) {
    return {id:decodedToken.userID,name:decodedToken.userName,isCreator:decodedToken.isCreator}
  } else {
    throw new Error("Invalid or missing user ID and user name in the token");
  }
}

function authVerify(req, res, next) {
  const token = req.headers.authorization;
  try {
    const decoded = verifyToken(token);
    const payload = extractPayloadFromToken(decoded);
    req.user = { ...payload };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorised access, please add the token" });
  }
}

export { authVerify };
