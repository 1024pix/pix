const { detectCasing, recase } = require('@kristiandupont/recase');

const columnNameCasing = {
  name: 'column-name-casing',
  docs: {
    description: 'Column name should be camelCase',
    url: '...',
  },
  process({ schemaObject, report }) {
    const expectedCasing = 'camel';

    const columnValidator =
      (entityType) =>
      ({ name: entityName }) =>
      ({ name: columnName }) => {
        const casing = detectCasing(columnName);
        const matches = casing === null || casing === expectedCasing;
        if (!matches) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${entityName}.${columnName}`,
            message: `The column ${columnName} on the ${entityType} ${entityName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
            suggestedMigration: `ALTER ${entityType.toUpperCase()} "${entityName}" RENAME COLUMN "${columnName}" TO "${recase(
              casing,
              expectedCasing,
              columnName
            )}";`,
          });
        }
      };

    schemaObject.tables.forEach((entity) => {
      entity.columns.forEach(columnValidator('table')(entity));
    });
  },
};

module.exports = columnNameCasing;
