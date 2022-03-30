const isValidHttpUrl = require('../helpers/isValidHttpUrl')
const fs = require("fs")

module.exports = class Productos {

  constructor(fileName) {
    this.fileName = fileName;
  }

  async save(item) {
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

      if (typeof item.nombre === "string" &&
        item.nombre.length > 0 &&
        typeof item.descripcion === "string" &&
        item.descripcion.length > 0 &&
        typeof item.codigo === "string" &&
        item.codigo.length > 0 &&
        !isNaN(Number(item.precio)) &&
        !isNaN(Number(item.stock)) &&
        isValidHttpUrl(item.foto)
      ) {

        const newItem = {
          id, timestamp: Date.now(), nombre: item.nombre, descripcion: item.descripcion,
          codigo: item.codigo, foto: item.foto, precio: Number(item.precio), stock: Number(item.stock)
        }
        initialData.push(newItem)

        await fs.promises.writeFile(this.fileName, JSON.stringify(initialData))

        return id;
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async getById(providedId) {
    try {
      const fileData = await fs.promises.readFile(this.fileName, 'utf-8')
      const parsedData = JSON.parse(fileData)

      const foundItem = parsedData.find(item => item.id === providedId)

      if (foundItem) {
        return foundItem
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

      const filteredData = parsedData.filter(item => item.id !== providedId)

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

  async deleteAll() {
    try {
      await fs.promises.writeFile(this.fileName, "[]")
    }
    catch (err) {
      throw new Error(err)
    }
  }

  async updateItem(id, newData) {
    try {
      const allItems = await this.getAll()
      let itemPosition = allItems.findIndex(item => item.id === id)

      if (itemPosition < 0) {
        throw new Error("El id ingresado no existe")
      }
      else {
        allItems[itemPosition] = { ...allItems[itemPosition], ...newData }
        await fs.promises.writeFile(this.fileName, JSON.stringify(allItems))
      }
    }
    catch (err) {
      throw new Error(err)
    }
  }

}