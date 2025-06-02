const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    jwt.verify(token, "68fc12381029c23cd31c4fa3ce4e75b9852629d747d6fd1990da0080e1b3e1489ca5a287111c7bfa4a133993d44d3ac6b58bb72fcc011e8c42ab71dfddab1b8c", (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token." });
        }
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
