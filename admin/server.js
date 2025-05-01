const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsDocs = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET'],
}));

app.use(bodyParser.json());
const productPath = '../data/products.json';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Product API',
            version: '1.0.0',
            description: 'API for managing products',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
            },
        ],
    },
    apis: ['./openapi.yaml'],
};

const swaggerDocs = swaggerJsDocs(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/api/products', (req, res) => {
    file = fs.readFileSync(productPath, 'utf8');
    const products = JSON.parse(file);
    activeProducts = products.filter(product => product.isActive);
    res.json(activeProducts);
});

app.post('/api/products', (req, res) => {
    let newProducts = req.body;
    if (!Array.isArray(newProducts)) {
        newProducts = [newProducts];
    }
    
    const products = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const newProductsWithId = newProducts.map((product, index) => {
        return {
            id: products.length + index + 1,
            ...product,
            isActive: true,
        }
    })

    fs.writeFileSync(productPath, JSON.stringify([...products, ...newProductsWithId], null, 2), 'utf8');
    res.status(201).json(newProductsWithId);
});

app.get('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const product = products.find(p => p.id === productId);
    if (product && product.isActive) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
})

app.put('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1 && products[productIndex].isActive) {
        const updatedProduct = { ...products[productIndex], ...req.body };
        products[productIndex] = updatedProduct;
        fs.writeFileSync(productPath, JSON.stringify(products, null, 2), 'utf8');
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const products = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1 && products[productIndex].isActive) {
        products[productIndex].isActive = false;
        fs.writeFileSync(productPath, JSON.stringify(products, null, 2), 'utf8');
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
