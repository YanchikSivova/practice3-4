const express = require("express");
const router = express.Router();

let products = require("../data/products");

function findById(id){
    const num = Number(id);
    if (Number.isNaN(num)) return null;
    return products.find((p) => p.id === num) || null;
}

router.get("/", (req, res)=>{
    res.json(products);
});

router.get("/:id", (req, res) => {
    const product = findById(req.params.id);
    if (!product) return res.status(404).json({error:"Product not found"});
    res.json(product);
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
    if (Number.isNaN(id)) return res.status(404).json({error:"id must be a number"});
    products = products.filter((p) => p.id !== id);
    if (products.length === before){
        return res.status(404).json({error:"Product not found"});
    } 
    return res.status(204).send();
});

module.exports = router;