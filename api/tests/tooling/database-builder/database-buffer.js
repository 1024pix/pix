const INITIAL_ID = 100000;

module.exports = {
  objectsToInsert: [],
  tablesToDelete: [],
  nextId: INITIAL_ID,

  pushInsertable({ tableName, values }) {
    if (!values.id) {
      values = { ...values, id: this.nextId++ };
    }
    this.objectsToInsert.push({ tableName, values });

    return values;
  },

  purge() {
    this.objectsToInsert = [];
    this.tablesToDelete = [];
  },
};
