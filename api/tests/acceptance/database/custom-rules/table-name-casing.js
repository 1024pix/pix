const { detectCasing, recase } = require('@kristiandupont/recase');

const tableNameCasing = {
  name: 'table-name-casing',
  docs: {
    description: 'Table name should be kebab-case',
    url: '...',
  },
  process({ schemaObject, report }) {
    const expectedCasing = 'dash';

    const validator =
      (entityType) =>
      ({ name: entityName }) => {
        const casing = detectCasing(entityName);
        const matches = casing === null || casing === expectedCasing;
        if (!matches) {
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${entityName}`,
            message: `The ${entityType} ${entityName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
            suggestedMigration: `ALTER ${entityType.toUpperCase()} "${entityName}" RENAME TO "${recase(
              casing,
              expectedCasing,
              entityName
            )}";`,
          });
        }
      };

    schemaObject.tables.forEach((entity) => {
      validator('table')(entity);
    });
  },
};

module.exports = tableNameCasing;
