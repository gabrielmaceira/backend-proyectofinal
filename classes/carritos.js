const fs = require("fs")

module.exports = class Carritos {

  constructor(fileName) {
    this.fileName = fileName;
  }

  async createCart() {
    let initialData = [];

    try {
      const fileData = await fs.promises.readFile(this.fileName, 'utf-8')
      try {
        initialData = JSON.parse(fileData)
      }
      catch (err) {
        console.log(err)
        console.log("The file has incorrect data - starting over")
        try {
          await fs.promises.writeFile(`${this.fileName}.bak`, fileData)
          console.log("Backup file saved")
        }
        catch (err) {
          throw new Error(err)
        }
      }
    }
    catch (err) {
      throw new Error(err)
    }

    try {
      const id = initialData.length === 0 ? 1 : initialData[initialData.length - 1].id + 1
      initialData.push({ id, timestamp: Date.now(), productos: [] })

      await fs.promises.writeFile(this.fileName, JSON.stringify(initialData))
      return id;
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async getById(providedId) {
    try {
      const fileData = await fs.promises.readFile(this.fileName, 'utf-8')
      const parsedData = JSON.parse(fileData)

      const foundCart = parsedData.find(cart => cart.id === providedId)

      if (foundCart) {
        return foundCart.productos
      }
      else {
        throw new Error("El id no existe")
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async getAll() {
    try {
      const fileData = await fs.promises.readFile(this.fileName, 'utf-8')
      const parsedData = JSON.parse(fileData)

      return parsedData
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async deleteById(providedId) {
    try {
      const fileData = await fs.promises.readFile(this.fileName, 'utf-8')
      const parsedData = JSON.parse(fileData)

      const filteredData = parsedData.filter(cart => cart.id !== providedId)

      if (filteredData.length === parsedData.length) {
        throw new Error("El id no existe")
      }
      else {
        await fs.promises.writeFile(this.fileName, JSON.stringify(filteredData))
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async addProduct(id, newData) {
    try {
      const allCarts = await this.getAll()
      let cartPosition = allCarts.findIndex(cart => cart.id === id)

      if (cartPosition < 0) {
        throw new Error("El id ingresado no existe")
      }
      else {
        allCarts[cartPosition].productos = [...allCarts[cartPosition].productos, newData]
        await fs.promises.writeFile(this.fileName, JSON.stringify(allCarts))
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async deleteProductInCart(cartId, itemId) {
    try {
      const allCarts = await this.getAll()
      let cartPosition = allCarts.findIndex(cart => cart.id === cartId)

      if (cartPosition < 0) {
        throw new Error("El id del carrito ingresado no existe")
      }
      else {
        const filteredProducts = allCarts[cartPosition].productos.filter(el => el.id !== itemId)

        if (filteredProducts.length === allCarts[cartPosition].productos.length) {
          throw new Error("El producto no esta en el carrito")
        }
        else {
          allCarts[cartPosition].productos = filteredProducts
          await fs.promises.writeFile(this.fileName, JSON.stringify(allCarts))
        }
        
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

}