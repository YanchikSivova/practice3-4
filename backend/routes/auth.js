const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {nanoid} = require("nanoid");
const { 
    JWT_SECRET, 
    authMiddleware,
    REFRESH_SECRET,
    ACCESS_EXPIRES_IN,
    REFRESH_EXPIRES_IN,
} = require("../middleware/authJWT");

const router = express.Router();

const {users} = require("../store/usersStore");

const refreshTokens = new Set();

function generateAccessToken(user){
    return jwt.sign(
        {sub: user.id, email: user.email, role: user.role},
        JWT_SECRET,
        {expiresIn: ACCESS_EXPIRES_IN}
    );
}

function generateRefreshToken(user){
    return jwt.sign(
        {sub: user.id, email: user.email, role: user.role},
        REFRESH_SECRET,
        {expiresIn: REFRESH_EXPIRES_IN}
    );
}
/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          required:
 *              - id
 *              - email
 *              - first_name
 *              - last_name
 *              - passwordHash
 *              - role
 *          properties:
 *              id:
 *                  type: string
 *                  description: Уникальный ID пользователя
 *              email:
 *                  type: string
 *                  description: Уникальный логин пользователя
 *              first_name:
 *                  type: string
 *                  description: Имя пользователя 
 *              last_name:
 *                  type: string
 *                  description: Фамилия пользвателя
 *              passwordHash:
 *                  type: string
 *                  description: Хэш пароля
 *              role:
 *                  type: string
 *                  description: Роль пользователя
 *          example:
 *              id: Wfn2e8Q2
 *              email: yana-sivova06@yandex.ru
 *              first_name: Yana
 *              last_name: Sivova
 *              passwordHash: $2b$10$psVQ07qB5nikDNqkd7dfPOx7ad1tCCtoMWhBeSvpUIK1mZ0aFoBki
 *              role: admin
 */

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      summary: Создает нового пользователя
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - first_name
 *                          - last_name
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                          first_name:
 *                              type: string
 *                          last_name:
 *                              type: string
 *                          password:
 *                              type: string
 *                      example:
 *                          email: yana_sivova06@yandex.ru
 *                          first_name: Yana
 *                          last_name: Sivova
 *                          password: 12345678
 *      responses:
 *          400:
 *              description: Поля не заполнены или пользователь уже сущетвует
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: object
 *                                  properties:
 *                                      error: string
 *                                      message: string
 *                                  example:
 *                                     error: "validation_error"
 *                                     message: "Все поля должны быть заполнены"
 *          201:
 *              description: Пользователь создан
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/User'
 *                          
 *                       
 *                                  
 */
router.post("/register", async(req, res) => {
    const {email, first_name, last_name, password } = req.body;

    if(!email || !first_name || !last_name || !password){
        return res.status(400).json({
            error: "validation_error",
            message: "Все поля должны быть заполнены",
        });
    }

    const normalizedEmail = String(email).toLowerCase();
    const exists = users.find((u) => u.email === normalizedEmail);
    if (exists){
        return res.status(400).json({
            error: "user exists",
            message: "Пользователь с таким email уже существует",
        });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = {
        id: nanoid(8),
        email: normalizedEmail,
        first_name: String(first_name),
        last_name: String(last_name),
        passwordHash,
        role: users.length === 0? "admin" : "user",
    };

    users.push(user);
    return res.status(201).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
    });
});

/**@swagger
 * /api/auth/login:
 *  post:
 *      summary: Осуществляет вход в систему
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                      example:
 *                          email: yana-sivova06@yandex.ru
 *                          password: 12345678
 *      responses:
 *          200:
 *              description: Успешный вход
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              accessToken: string
 *                              refreshToken: string
 *                          example:
 *                              accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiItYU5lUWpUWSIsImVtYWlsIjoieWFuYS1zaXZvdmEwNkB5YW5kZXgucnUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQwMDM2MTksImV4cCI6MTc3NDAwNDUxOX0.RAlwctCR7ZlLO_jgVKRJopVyBycdMwpGXeWPL9fa2d8
 *                              refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUdWN5a3ctYyIsImVtYWlsIjoiaWdvckBtYWlsLnJ1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzQwMDM4ODAsImV4cCI6MTc3NDYwODY4MH0.7OO08dUkQ9vNwLo-OQev_HJeSujZpQXTbK-jwpCddGQ
 *          400:
 *              description: Поля не заполнены
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: validation error
 *                              message: Введите email и пароль
 * 
 *          401:
 *              description: Неавторизован
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: Unauthorized 
 *                              message: Пользователь не найден
 */

router.post("/login", async(req, res) =>{
    const {email, password} = req.body;

    if( !email || !password){
        return res.status(400).json({
            error: "validation error",
            message: "Введите email и пароль",
        });
    }; 
    const normalizedEmail = String(email).toLowerCase();
    const user = users.find((u) => u.email=== normalizedEmail);
    if(!user){
        return res.status(401).json({
            error: "Unauthorized",
            message: "Пользователь не найден",
        });
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if(!ok){
        return res.status(401).json({
            error: "Invalid credentials",
            message: "Неверный email или пароль",
        });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.add(refreshToken);

    return res.status(200).json({accessToken, refreshToken});
});

/**
 * @swagger
 * /api/auth/refresh:
 *  post:
 *      summary: Обновляет токены
 *      tags: [User]
 *      requestBody:
 *          required: false
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - refreshToken
 *                      properties:
 *                          refreshToken:
 *                              type: string
 *                      example:
 *                          refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUdWN5a3ctYyIsImVtYWlsIjoiaWdvckBtYWlsLnJ1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzQwMDM4ODAsImV4cCI6MTc3NDYwODY4MH0.7OO08dUkQ9vNwLo-OQev_HJeSujZpQXTbK-jwpCddGQ
 *      responses:
 *          200:
 *              description: Выданы новые токены
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              accessToken: string
 *                              refreshToken: string
 *                          example:
 *                              accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiItYU5lUWpUWSIsImVtYWlsIjoieWFuYS1zaXZvdmEwNkB5YW5kZXgucnUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQwMDM2MTksImV4cCI6MTc3NDAwNDUxOX0.RAlwctCR7ZlLO_jgVKRJopVyBycdMwpGXeWPL9fa2d8
 *                              refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUdWN5a3ctYyIsImVtYWlsIjoiaWdvckBtYWlsLnJ1Iiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzQwMDM4ODAsImV4cCI6MTc3NDYwODY4MH0.7OO08dUkQ9vNwLo-OQev_HJeSujZpQXTbK-jwpCddGQ
 *          400:
 *              description: Отсутствует refresh-токен
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: refresh-token_required
 *                              message: Нужен refresh токен в заголовке x-refresh-token или в теле запроса
 *          401:
 *              description: refresh-токен недействителен
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error: string
 *                              message: string
 *                          example:
 *                              error: Invalid_refresh_token
 *                              message: Refresh-токен недействителен (не найден в хранилище)
 */

router.post("/refresh", (req, res) => {
    const headerToken = req.headers["x-refresh-token"];
    const refreshToken = headerToken || req.body?.refreshToken;

    if (!refreshToken){
        return res.status(400).json({
            error: "refresh-token_required",
            message: "Нужен refresh токен в заголовке x-refresh-token или в теле запроса",
        });
    }
    if (!refreshTokens.has(refreshToken)){
        return res.status(401).json({
            error: "Invalid_refresh_token",
            message: "Refresh-токен недействителен (не найден в хранилище)",
        });
    }
    try{
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = users.find((u) => u.id === payload.sub);
        if(!user){
            return res.status(401).json({
                error: "user_not_found",
                message: "Пользователь не найден",
            });
        }
        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);
        return res.status(200).json({accessToken: newAccessToken, refreshToken: newRefreshToken});
    }   catch(err){
        refreshTokens.delete(refreshToken);
        return res.status(401).json({
            error: "refresh_token_invalid_or_expired",
            message: "Refresh-токен недействителен или его срок действия истек",
        });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *  get:
 *      summary: Проверяет авторизацию пользователя
 *      tags: [User]
 *      responses:
 *          200:
 *              description: Пользователь авторизован
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/User'
 *          401:
 *              description: Неавторизован
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
 */

router.get("/me", authMiddleware, (req, res) =>{
    const userId = req.user.sub;

    const user = users.find((u) => u.id === userId);
    if(!user){
        return res.status(401).json({
            error: "user_not_found",
            message: "Пользователь не найден",
        });
    }

    return res.status(200).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
    });
});

module.exports = router; 