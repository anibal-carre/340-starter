'use strict'

const classificationList = document.querySelector("#classificationList")

classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value
    if (!classification_id) {
        document.getElementById("inventoryDisplay").innerHTML = ""
        return
    }

    const url = `/inv/getInventory/${classification_id}`
    fetch(url)
        .then(response => {
            if (response.ok) return response.json()
            throw new Error("Network response was not OK")
        })
        .then(data => {
            buildInventoryList(data)
        })
        .catch(error => {
            console.log("There was a problem:", error.message)
        })
})

function buildInventoryList(data) {
    const inventoryDisplay = document.getElementById("inventoryDisplay")
    if (data.length === 0) {
        inventoryDisplay.innerHTML = "<p>No vehicles found for this classification.</p>"
        return
    }

    let tableHTML = '<thead><tr><th>Vehicle Name</th><th>&nbsp;</th><th>&nbsp;</th></tr></thead>'
    tableHTML += "<tbody>"
    data.forEach(vehicle => {
        tableHTML += `<tr>
            <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
            <td><a href='/inv/edit/${vehicle.inv_id}' title='Click to update'>Modify</a></td>
            <td><a href='/inv/delete/${vehicle.inv_id}' title='Click to delete'>Delete</a></td>
        </tr>`
    })
    tableHTML += "</tbody>"

    inventoryDisplay.innerHTML = tableHTML
}
