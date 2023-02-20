const INITIAL_ID = 100000;

export default {
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
