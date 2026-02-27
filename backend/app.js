const express = require("express");
const cors = require("cors");

const swaggerJsdocs = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const logger = require("./middleware/logger");
const productsRouter = require("./routes/products");

const app  = express();
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: "http://localhost:3001"
}));

app.use(express.json());

app.use(logger);


const swaggerOptions = {
    definition:{
        openapi: "3.0.0",
        info:{
            title: "Products API",
            version: "1.0.0",
            description: "Учебный REST API для управления товарами интернет-магазина",
        },
        servers:[
            {
                url:`http://localhost:${PORT}`,
                description: "Локальный сервер",
            },
        ],
    },
    apis: ["./routes/*js", "/app.js"],
};

const swaggerSpec = swaggerJsdocs(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) =>{
    res.send("Express API is running. Try /api/products");
});

app.use("/api/products", productsRouter);

app.use((err,req, res, next) => {
    console.error("Unhandled error: ", err);
    res.status(500).json({error: "Internal server error"});
})

app.use((req, res) => {
    res.status(404).json({error:"Not found"});
});
app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});