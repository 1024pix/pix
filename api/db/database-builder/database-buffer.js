const INITIAL_ID = 100000;
const databaseBuffer = {
  objectsToInsert: {},
  nextId: INITIAL_ID,

  pushInsertable({ tableName, values }) {
    if (!this.objectsToInsert[tableName]) this.objectsToInsert[tableName] = [];
    this.objectsToInsert[tableName].push(values);

    return values;
  },

  getNextId() {
    return this.nextId++;
  },

  purge() {
    this.objectsToInsert = {};
    this.nextId = INITIAL_ID;
  },
};

export { databaseBuffer };
