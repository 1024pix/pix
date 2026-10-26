const INITIAL_ID = 100000;

// Any row object, a model instance included: a class type has no index signature and would not fit a Record.
type Insertable = object;

type DatabaseBuffer = {
  // Read and reset directly by DatabaseBuilder.commit(), hence writable.
  objectsToInsert: Record<string, Insertable[]>;
  nextId: number;
  pushInsertable<T extends Insertable>(insertable: { tableName: string; values: T }): T;
  getNextId(): number;
  purge(): void;
};

const databaseBuffer: DatabaseBuffer = {
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

export { type DatabaseBuffer, databaseBuffer };
