const INITIAL_ID = 100000;
const databaseBuffer = {
  objectsToInsert: {},
  // Tout ce qui a été construit depuis le dernier nettoyage, y compris ce qui a
  // déjà été inséré. `commit()` vide `objectsToInsert`, ce qui ferait perdre le
  // référentiel aux constructeurs qui ont besoin de s'y situer — celui des
  // acquis, notamment, pour rattacher un état de connaissance à son tube.
  builtObjects: {},
  nextId: INITIAL_ID,

  pushInsertable({ tableName, values }) {
    if (!this.objectsToInsert[tableName]) this.objectsToInsert[tableName] = [];
    this.objectsToInsert[tableName].push(values);

    if (!this.builtObjects[tableName]) this.builtObjects[tableName] = [];
    this.builtObjects[tableName].push(values);

    return values;
  },

  getNextId() {
    return this.nextId++;
  },

  purge() {
    this.objectsToInsert = {};
    this.builtObjects = {};
  },
};

export { databaseBuffer };
