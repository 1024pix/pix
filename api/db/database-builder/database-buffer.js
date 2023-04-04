const INITIAL_ID = 100000;
const databaseBuffer = {
  objectsToInsert: [],
  nextId: INITIAL_ID,

  pushInsertable({ tableName, values }) {
    this.objectsToInsert.push({ tableName, values });

    return values;
  },

  getNextId() {
    return this.nextId++;
  },

  purge() {
    this.objectsToInsert = [];
  },
};

export { databaseBuffer };
