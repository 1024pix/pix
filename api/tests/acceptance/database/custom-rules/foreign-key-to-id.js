const foreignKeyToId = {
  name: 'foreign-key-to-id',
  docs: {
    description: 'Foreign keys should reference "id" columns',
    url: '...',
  },
  process({ schemaObject, report }) {
    const columnValidator = ({ column, tableName }) => {
      const expectedReferencedColumn = 'id';

      if (column.reference && column.reference.column !== expectedReferencedColumn) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message:
            `The foreign key from ${tableName}.${column.name} references ${column.reference.table}.${column.reference.column}.\n` +
            `Expected reference was to: ${column.reference.table}.${expectedReferencedColumn}`,
          suggestedMigration:
            `Create a new column ${tableName}.${column.reference.table}Id of the same type as ${column.reference.table}.id.\n` +
            `Copy values from ${column.reference.table}.id to ${tableName}.${column.reference.table}Id matching ${tableName}.${column.name}.\n` +
            `Add the foreign key on ${tableName}.${column.reference.table}Id, then drop the ${tableName}.${column.name} column.\n`,
        });
      }
    };

    schemaObject.tables.forEach((table) => {
      table.columns.forEach((column) => {
        columnValidator({ column, tableName: table.name });
      });
    });
  },
};

module.exports = foreignKeyToId;
