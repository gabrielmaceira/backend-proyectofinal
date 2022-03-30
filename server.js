const express = require('express')
const { Router } = express
const Productos = require("./classes/productos")
const Carritos = require("./classes/carritos")

const app = express()
const route_products = Router()
const route_cart = Router()

const PORT = process.env.ENVIRONMENT === "production" ? process.env.PORT : 8080

const server = app.listen(PORT, () => {
    console.log(`Servidor http escuchando en el puerto ${server.address().port}`)
})

server.on("error", error => console.log(`Error en servidor ${error}`))

const APIPRODROUTE = '/productos'
const APICARTROUTE = '/carrito'

app.use(APIPRODROUTE, route_products)
app.use(APICARTROUTE, route_cart)
app.use('/static', express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
route_products.use(express.json())
route_products.use(express.urlencoded({ extended: true }))
route_cart.use(express.json())
route_cart.use(express.urlencoded({ extended: true }))

const db = new Productos("./db/productos.txt")
const carts = new Carritos("./db/carritos.txt")

app.use('*', function (req, res) {
    res.sendStatus = 404
    res.send({ error: -2, descripcion: "ruta no implementada"})
})

route_products.get('/:id?', async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (!isNaN(id)) {
            const product = await db.getById(id)
            res.send(product)
        }
        else {
            const products = await db.getAll()
            res.send(products)
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})

route_products.post('/', async (req, res) => {
    if (req.body.administrador) {
        try {
            const newProduct = await db.save(req.body.item)
            res.send({ "id": newProduct })
        }
        catch (err) {
            res.statusCode = 400
            res.send(err.message)
        }
    }
    else {
        res.statusCode = 400
        res.send({ error: -1, descripcion: "ruta '/', método 'POST' no autorizado" })
    }
})

route_products.put('/:id', async (req, res) => {
    if (req.body.administrador) {
        try {
            await db.updateItem(Number(req.params.id), req.body.item)
            res.send("El producto fue actualizado exitosamente!")
        }
        catch (err) {
            res.statusCode = 400
            res.send(err.message)
        }
    }
    else {
        res.statusCode = 400
        res.send({ error: -1, descripcion: `ruta '${APIPRODROUTE}/${req.params.id}', método 'PUT' no autorizado` })
    }
})

route_products.delete('/:id', async (req, res) => {
    if (req.body.administrador) {
        try {
            await db.deleteById(Number(req.params.id))
            res.send("El producto fue borrado exitosamente!")
        }
        catch (err) {
            res.statusCode = 400
            res.send(err.message)
        }
    }
    else {
        res.statusCode = 400
        res.send({ error: -1, descripcion: `ruta '${APIPRODROUTE}/${req.params.id}', método 'DELETE' no autorizado` })
    }
})

route_cart.post('/', async (req, res) => {
    try {
        const newCart = await carts.createCart()
        res.send({ "id": newCart })
    }
    catch (err) {
        res.statusCode = 400
        res.send(err.message)
    }
})

route_cart.delete('/:id', async (req, res) => {
    try {
        await carts.deleteById(Number(req.params.id))
        res.send("El carrito fue vaciado y borrado exitosamente!")
    }
    catch (err) {
        res.statusCode = 400
        res.send(err.message)
    }
})

route_cart.get('/:id/productos', async (req, res) => {
    try {
        const id = Number(req.params.id)

        if (!isNaN(id)) {
            const productsInCart = await carts.getById(id)
            res.send(productsInCart)
        }
        else {
            throw new Error("El id es invalido")
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})

route_cart.post('/:id/productos', async (req, res) => {
    try {
        const id = Number(req.params.id)
        const idItem = Number(req.body.item.id)

        if (!isNaN(id) && !isNaN(idItem)) {
            const item = await db.getById(idItem)

            await carts.addProduct(id, item)
            res.send("Item agregado.")
        }
        else {
            throw new Error("Revisar los ids ingresados")
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})

route_cart.delete('/:id/productos/:id_prod', async (req, res) => {
    try {
        const id = Number(req.params.id)
        const idItem = Number(req.params.id_prod)

        if (!isNaN(id) && !isNaN(idItem)) {
            await carts.deleteProductInCart(id, idItem)
            res.send("Item borrado del carrito.")
        }
        else {
            throw new Error("Revisar los ids ingresados")
        }
    }
    catch (err) {
        res.status(400).send(err.message)
    }
})