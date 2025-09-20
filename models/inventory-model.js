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

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryItemById };



