const express = require("express");
const { nanoid } = require("nanoid");
const { authMiddleware, requireRole } = require("../middleware/authJWT");
const store = require("../store/productsStore")
const router = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *      Product:
 *          type: object
 *          required:
 *              - title
 *              - price
 *              - description
 *          properties:
 *              id:
 *                  type: string
 *                  description: Уникальный ID товара
 *              title:
 *                  type: string
 *                  description: Название товара
 *              price:
 *                  type: number
 *                  description: Цена товара
 *              description: 
 *                  type: string
 *                  description: Описание товара
 *          example:
 *              id: Wfn2e8Q2
 *              title: Печенье
 *              price: 150
 *              description: Очень вкусное печенье
 */

/**
 * @swagger
 * /api/products:
 *  get:
 *      summary: Возвращает список товаров
 *      tags: [Products]
 *      responses:
 *          200:
 *              description: Список товаров
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Product'
 *  post:
 *      summary: Добавляет новый продукт
 *      tags: [Products]
 *      responses:
 *          201:
 *              description: Товар создан
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 *          400:
 *              description: Необходимое поле не заполнено или заполнено неверно
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  example: "title must be a non-empty string"
 */
//GET /api/products
router.get("/", authMiddleware, async (req, res, next) => {
    try {
        const products = await store.readAll();
        res.json(products);
    } catch (e) {
        next(e);
    }
});

router.post("/", authMiddleware, requireRole("admin"), async (req, res, next) => {
    try {
        const { title, price, description } = req.body;
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "title is required (string)" });
        }
        if (typeof description !== "string" || description.trim() === "") {
            return res.status(400).json({ error: "description is required (string)" });
        }
        const numPrice = Number(price);
        if (Number.isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ error: "price is required (number >= 0)" });
        }
        const newProduct = {
            id: nanoid(8),
            title: title.trim(),
            price: Number(price),
            description: description.trim(),
        };
        await store.add(newProduct);
        res.status(201).json(newProduct);
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/products/:id:
 *  patch:
 *      summary: Изменяет указанные поля
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: string
 *          description: Уникальный идентификатор продукта
 *          example: Wfn2e8Q2
 *      responses:
 *          200:
 *              description: Продукт изменен
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
 *          400:
 *              description: Необходимое поле не заполнено или заполнено неверно
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  example: "title must be a non-empty string"
 *          404:
 *              description: Продукт не найден
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  example: "Product not found"
 *  delete:
 *      summary: Удаляет продукт
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: string
 *          description: Уникальный идентификатор продукта
 *          example: 1
 *      responses:
 *          204:
 *              description: Продукт удален
 *          404:
 *              description: Продукт не найден
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  example: "Product not found"
 *          400:
 *              description: Неверный формат id
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              error:
 *                                  type: string
 *                                  example: "id must be a number"
 *          
 */

router.get("/:id", authMiddleware, async (req, res, next) => {
    try{
        const list = await store.readAll();
        const product = list.find((p) => p.id === req.params.id) || null;
        if (!product){
            return res.status(404).json({
                error: "product_not_found",
                message: "Товар не найден",
            })
        };
        res.json(product);
    }catch(err){
        next(err);
    }
});

router.put("/:id", authMiddleware, requireRole("admin"), async (req, res, next) => {
    try {
        const products = await store.readAll();
        const product = products.find(p => p.id === req.params.id);

        if (!product) return res.status(404).json({ error: "Product not fount" });

        const { title, price, description } = req.body;
        if (title === undefined || price === undefined || description === undefined) {
            return res.status(400).json({ error: "Empty field(s)" });
        }
        if (typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ error: "title must be a non-empty string" });
        }
        product.title = title.trim();
        const numPrice = Number(price);
        if (Number.isNaN(numPrice) || numPrice < 0) {
            return res.status(400).json({ error: "price must be a number >= 0" });
        }
        product.price = numPrice;
        if (typeof description !== "string" || description.trim() === "") {
            return res.status(400).json({ error: "description must be a non-empty string" });
        }
        product.description = description.trim();

        await store.put(product);
        res.status(200).json(product);
    } catch(e){
        next(e);
    }
});

router.patch("/:id", authMiddleware, requireRole("admin"), async (req, res, next) => {
    try {
        const products = await store.readAll();
        const product = products.find(p => p.id === req.params.id);

        if (!product) return res.status(404).json({ error: "Product not found" });

        const { title, price, description } = req.body;

        if (title !== undefined) {
            if (typeof title !== "string" || title.trim() === "") {
                return res.status(400).json({ error: "title must be a non-empty string" });
            }
            product.title = title.trim();
        }

        if (price !== undefined) {
            const numPrice = Number(price);
            if (Number.isNaN(numPrice) || numPrice < 0) {
                return res.status(400).json({ error: "price must be a number >= 0" });
            }
            product.price = numPrice;
        }

        if (description !== undefined) {
            if (typeof description !== "string" || description.trim() === "") {
                return res.status(400).json({ error: "description must be a non-empty string" });
            }
            product.description = description.trim();
        }

        await store.patch(product);
        res.status(200).json(product);
    } catch (e) {
        next(e);
    }
});

router.delete("/:id", authMiddleware, requireRole("admin"), async (req, res, next) => {
    try {
        const ok = await store.remove(req.params.id);
        if (!ok) return res.status(404).json({ error: "Not found" });
        res.status(204).json({ ok: true });
    } catch (e) {
        next(e);
    }
});

/**
 * @swagger
 * /api/products/search:
 *  get:
 *      summary: Поиск товаров по названию
 *      tags: [Products]
 *      parameters:
 *        - in: query
 *          name: title 
 *          required: false
 *          schema:
 *              type: string
 *          description: Строка для поиска в названиях товаров
 *          example: "сок"
 *      responses:
 *          200:
 *              description: Успешный поиск
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Product'
 *                      example:
 *                         - id: "Wfn2e8Q2"
 *                           title: "сок"
 *                           price: 150
 *                           description: "вкусный сок"
 *                         - id: "Xy7k9pL3"
 *                           title: "апельсиновый сок"
 *                           price: 200
 *                           description: "свежевыжатый сок"
 */

router.get("/search", authMiddleware, async (req, res, next) => {
    try {
        const { title } = req.query;   //параметр из запроса
        const products = await store.readAll();

        if (!title) {
            return res.json(products);
        }

        const searchTerm = title.toLowerCase().trim();
        const filtered = products.filter(p => p.title && p.title.toLowerCase().includes(searchTerm));
        res.status(200).json(filtered);
    } catch (e) {
        next(e);
    }
});

module.exports = router;