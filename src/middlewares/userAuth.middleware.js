import jwt from "jsonwebtoken";

async function fetchUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).send("Please authenticate using a valid token");
        return;
    }

    try {
        const data = jwt.verify(token, "grepit-backend");
        req.user = data.user;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send("Please authenticate using a valid token");
    }
}

export { fetchUser };
