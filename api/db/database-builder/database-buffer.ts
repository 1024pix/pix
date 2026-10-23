const INITIAL_ID = 100000;

type Insertable = Record<string, unknown>;

const databaseBuffer = {
  objectsToInsert: {} as Record<string, Insertable[]>,
  nextId: INITIAL_ID,

  pushInsertable<T extends Insertable>({ tableName, values }: { tableName: string; values: T }): T {
    if (!this.objectsToInsert[tableName]) this.objectsToInsert[tableName] = [];
    this.objectsToInsert[tableName].push(values);

    return values;
  },

  getNextId(): number {
    return this.nextId++;
  },

  purge(): void {
    this.objectsToInsert = {};
    this.nextId = INITIAL_ID;
  },
};

type DatabaseBuffer = typeof databaseBuffer;

export { type DatabaseBuffer, databaseBuffer };
