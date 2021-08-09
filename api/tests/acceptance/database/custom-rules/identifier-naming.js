const identifierNaming = {
  name: 'identifier-naming',
  docs: {
    description: 'Identifier columns should follow "id" convention',
    url: '...',
  },
  process({ schemaObject, report }) {
    const validator = ({ columns, name: tableName }) => {
      const idColumns = columns.filter((c) => c.isPrimary);
      if (idColumns.length > 0) {
        const [idColumn] = idColumns;
        const expectedName = 'id';
        if (idColumn.name !== expectedName) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${tableName}`,
            message: `The primary column on ${tableName} is called ${idColumn.name} which doesn't follow the convention. Expected name was: ${expectedName}`,
            suggestedMigration: `ALTER TABLE "${tableName}" RENAME COLUMN "${idColumn.name}" TO "${expectedName}";`,
          });
        }
      }
    };
    schemaObject.tables.forEach(validator);
  },
};

module.exports = identifierNaming;
