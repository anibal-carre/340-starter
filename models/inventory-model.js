const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const sql = `
            SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles, 
                   inv_image, inv_thumbnail, inv_description, classification_id
            FROM public.inventory
            WHERE classification_id = $1
            ORDER BY inv_make, inv_model
        `
        const data = await pool.query(sql, [classification_id])
        return data.rows
    } catch (error) {
        console.error("getInventoryByClassificationId error:", error)
        throw error
    }
}

async function getInventoryItemById(inv_id) {
    try {
        const sql = `
            SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles, 
                   inv_image, inv_thumbnail, inv_description, inv_color, classification_id
            FROM public.inventory
            WHERE inv_id = $1
        `
        const data = await pool.query(sql, [inv_id])
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryItemById error:", error)
        throw error
    }
}

/* ***************************
 *  Insert new classification
 * ************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
        const data = await pool.query(sql, [classification_name])
        return data.rows[0]
    } catch (error) {
        console.error("addClassification error:", error)
        return null
    }
}

/* ***************************
 *  Insert new inventory vehicle
 * ************************** */
async function addInventory(vehicleData) {
    try {
        const sql = `INSERT INTO public.inventory 
      (classification_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_image, inv_thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`

        const values = [
            vehicleData.classification_id,
            vehicleData.inv_make,
            vehicleData.inv_model,
            vehicleData.inv_year,
            vehicleData.inv_description,
            vehicleData.inv_price,
            vehicleData.inv_image,
            vehicleData.inv_thumbnail
        ]

        const data = await pool.query(sql, values)
        return data.rows[0]
    } catch (error) {
        console.error("addInventory error:", error)
        return null
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryItemById, addClassification };



