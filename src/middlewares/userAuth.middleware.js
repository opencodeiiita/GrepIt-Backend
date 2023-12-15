import jwt from "jsonwebtoken";

async function fetchUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(".")[1];
    if (!token) {
        res.status(401).send("Please authenticate using a valid token");
        return;
    }

    try {
        const data = jwt.verify(authHeader, process.env.JWT_SECRET);
        req.user = data;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).send("Please authenticate using a valid token");
    }
}

export { fetchUser };
