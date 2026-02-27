const express = require("express");
const { nanoid } = require("nanoid")

const router = express.Router();

let products = require("../data/products");

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
 *                  type: number
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
 *              id: 1
 *              title: Печенье
 *              price: 150
 *              description: Очень вкусное печенье
 */

/**
 * 
 * вспомогательная функция: найти товар по id
 */
function findById(id){
    const num = Number(id);
    if (Number.isNaN(num)) return null;
    return products.find((p) => p.id === num) || null;
}

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
router.get("/", (req, res)=>{
    res.json(products);
});

router.post("/", (req, res)=>{
    const {title, price, description} = req.body;
    if (typeof title !== "string" || title.trim() === ""){
        return res.status(400).json({error:"title is required (string)"});
    }
    if (typeof description !== "string" || description.trim() === ""){
        return res.status(400).json({error:"description is required (string)"});
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0){
        return res.status(400).json({error:"price is required (number >= 0)"});
    }

    const nextId = products.length? Math.max(...products.map((p) => p.id))+1:1;
    const newProduct = {id: nextId, title: title.trim(), price: numPrice, description: description.trim()};
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/:id:
 *  get:
 *      summary: Возвращает продукт с id
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *          description: Уникальный идентификатор продукта
 *          example: 1
 *      responses:
 *          200:
 *              description: Продукт найдет
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Product'
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
 *  patch:
 *      summary: Изменяет указанные поля
 *      tags: [Products]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *              type: integer
 *          description: Уникальный идентификатор продукта
 *          example: 1
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
 *              type: integer
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

router.get("/:id", (req, res) => {
    const product = findById(req.params.id);
    if (!product) return res.status(404).json({error:"Product not found"});
    res.json(product);
});


router.patch("/:id", (req, res) => {
    const product = findById(req.params.id);
    if (!product) return res.status(404).json({error:"Product not found"});

    const {title, price, description} = req.body;

    if (title != undefined){
        if (typeof(title) !== "string" || title.trim()===""){
            return res.status(400).json({error:"title must be a non-empty string"});
        }
        product.title = title.trim();
    }

    if (price != undefined){
        const numPrice = Number(price);
        if (Number.isNaN(numPrice) || numPrice < 0){
            return res.status(400).json({error: "price must be a number >= 0"});
        }
        product.price = numPrice;
    }

    if (description != undefined){
        if (typeof(description) !== "string" || description.trim() === ""){
            return res.status(400).json({error: "description must be a non-empty string"});
        }
        product.description = description.trim();
    }

    res.status(200).json(product);
});

router.delete("/:id", (req, res)=>{
    const before = products.length;
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({error:"id must be a number"});
    products = products.filter((p) => p.id !== id);
    if (products.length === before){
        return res.status(404).json({error:"Product not found"});
    } 
    return res.status(204).send();
});

module.exports = router;