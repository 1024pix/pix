import { seedSchema } from "../../../../db/seeds/seed.js";
import { knex } from "../../../../db/knex-database-connection.js";

const get = async function (request, h) {
  const seedsSchema = await seedSchema(knex, true);
  const result = seedsSchema.getContent;
  // await seedsSchema.clean();
  return h.response({ ...result }).code(200);
};

const seedsController = {
  get,
};

export default seedsController;
