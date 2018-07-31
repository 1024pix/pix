module.exports = {
  objectsToInsert: [],

  pushInsertable({ tableName, values }) {
    this.objectsToInsert.push({ tableName, values });
  },

  purge() {
    this.objectsToInsert = [];
  },
};
