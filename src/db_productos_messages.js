const knex = require("knex")({
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      database: "ecommerce_project",
    },
    pool: { min: 2, max: 8 },
  });

  // id, nombre, thumbnail
  knex.schema
    .createTableIfNotExists("products", (table) => {
      table.increments("id").primary(),
        table.string("title"),
        table.float("price"),
        table.string("thumbnail")
    })
    .then(() => {
      console.log("Tabla creada products! :D");
    })
    .catch((err) => {
      console.log(err);
    });

    knex.schema
    .createTableIfNotExists("messages", (table) => {
      table.increments("id").primary(),
        table.string("name"),
        table.string("message"),
        table.string("shippingDate")
    })
    .then(() => {
      console.log("Tabla creada message! :D");
    })
    .catch((err) => {
      console.log(err);
    });
  
  module.exports = knex;

module.exports = knex;