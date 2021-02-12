const INITIAL_ID = 100000;

module.exports = {
  objectsToInsert: [],
  nextId: INITIAL_ID,

  pushInsertable({ tableName, values, customIdKey }) {
    let idKey = 'id';
    if (customIdKey) {
      idKey = customIdKey;
    }
    if (!values[idKey]) {
      values = { ...values };
      values[idKey] = this.nextId++;
    }
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
