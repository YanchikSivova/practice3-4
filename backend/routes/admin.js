const express = require("express");

const {authMiddleware, requireRole } = require("../middleware/authJWT");
const {users, publicUser } = require('../store/usersStore');

const router = express.Router();

/**
 * @swagger
 * /api/admin/users:
 *  get:
 *      summary: Возвращает список пользователей
 *      tags: [Admin]
 *      responses:
 *          200:
 *              description: Список пользователей
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/User'
 * 
 * /api/admin/users/:id/role:
 *  patch:
 *      summary: Изменяет роль пользователя
 *      tags: [Admin]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type:
 *                  string
 *              description: Уникальный идентификатор пользователя
 *              example: Wfn2e8Q2
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - role
 *                      properties:
 *                          role:
 *                              type: string
 *                      example:
 *                          role: admin
 *      responses:
 *          200:
 *              description: Роль поользователя изменена
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *          400:
 *              description: Неправильная роль
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: validation_error
 *                              message: должна быть роль 'admin' или 'user'
 *          404:
 *              description: Пользователь не найден
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: user_not_found
 *                              message: Пользователь не найден
 *  
 */

router.get("/users", authMiddleware, requireRole("admin"), (req, res) => {
    res.status(200).json(users.map(publicUser));
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
    return res.status(200).json(publicUser(u));
});

module.exports = router;