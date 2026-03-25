const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

function authMiddleware(req, res, next){
    const header = req.headers.authorization || "";
    const [schema, token] = header.split(" ");

    if(schema !== "Bearer" || !token){
        return res.status(401).json({
            error: "auth_header_missing",
            message: "Нужен заголовок Authorization: Bearer <token>",
        });
    }

    try{
        const payload = jwt.verify(token, JWT_SECRET);

        req.user = payload;
        next();
    }catch(err){
        return res.status(401).json({
            error: "invalid_token",
            message: "Токен недействителен или его срок действия истек",
        });
    }
}

function requireRole(requiredRole){
    return (req, res, next) => {
        const actualRole = req.user?.role;
        if (actualRole !== requiredRole){
            return res.status(403).json({
                error: "forbidden",
                message: `Доступ запрещен. Нужна роль ${requiredRole}`,
            });
        }
        next();
    };
}

module.exports = {
    authMiddleware, 
    requireRole,
    JWT_SECRET,
    REFRESH_SECRET,
    ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN,
};