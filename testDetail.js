const util = require("./utilities")
const vehicle = {
  inv_make: "Toyota",
  inv_model: "Camry",
  inv_year: 2022,
  inv_price: 24999,
  inv_miles: 32100,
  inv_color: "Silver",
  inv_description: "A reliable and fuel-efficient sedan.",
  inv_image: "/images/vehicles/camry.jpg"
}

const html = util.buildDetailView(vehicle)
console.log(html)
