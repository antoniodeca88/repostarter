'use strict'

document.addEventListener("DOMContentLoaded", function () {
  const classificationList = document.querySelector("#classificationList")
  if (!classificationList) {
    console.error("No se encontró el elemento #classificationList")
    return
  }

  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)

    const classIdURL = `/inv/getInventory/${classification_id}`

    fetch(classIdURL)
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error("Network response was not OK")
      })
      .then((data) => {
        console.log("Datos recibidos:", data)
        buildInventoryList(data)
      })
      .catch((error) => {
        console.error("Error:", error.message)
      })
  })
})

function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay")
  if (!inventoryDisplay) {
    console.error("No se encontró el elemento #inventoryDisplay")
    return
  }

  let dataTable = "<thead>"
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>"
  dataTable += "</thead><tbody>"

  data.forEach((item) => {
    dataTable += `<tr><td>${item.inv_make} ${item.inv_model}</td>`
    dataTable += `<td><a href='/inv/edit/${item.inv_id}'>Modify</a></td>`
    dataTable += `<td><a href='/inv/delete/${item.inv_id}'>Delete</a></td></tr>`
  })

  dataTable += "</tbody>"
  inventoryDisplay.innerHTML = dataTable
}
