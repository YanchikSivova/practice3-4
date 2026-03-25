const express = require("express");

const {authMiddleware, requireRole } = require("../middleware/authJWT");
const {users, publicUser } = require('../store/usersStore');

const router = express.Router();

router.get("/users", authMiddleware, requireRole("admin"), (req, res) => {
    res.json(users.map(publicUser));
});

router.patch("/users/:id/role", authMiddleware, requireRole("admin"), (req, res) => {
    const {role} = req.body || {};

    if(role !== "admin" && role !== "user"){
        return res.status(400).json({
            error: "validation_error",
            message: "должна быть роль 'admin' или 'user'",
        });
    }

    const u = users.find((x) => x.id === req.params.id);
    if(!u){
        res.status(404).json({
            error: "user_not_found",
            message: "Пользователь не найден",
        });
    }
    u.role = role;
    return res.json(publicUser(u));
});

module.exports = router;