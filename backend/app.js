const express = require("express");
// const cors = require("cors");

const logger = require("./middleware/logger");
const productsRouter = require("./routes/products");

const app  = express();
const PORT = process.env.PORT || 3000

// app.use(cors());

app.use(express.json());

app.use(logger);
app.get("/", (req, res) =>{
    res.send("Express API is running. Try /api/products");
});

app.use("/api/products", productsRouter);

app.use((req, res) => {
    res.status(404).json({error:"Not found"});
});
app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`);
});