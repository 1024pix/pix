module.exports = {
  objectsToInsert: [],
  objectsToDelete: [],

  pushInsertable({ tableName, values }) {
    this.objectsToInsert.push({ tableName, values });
  },

  purge() {
    this.objectsToInsert = [];
    this.objectsToDelete = [];
  },
};
