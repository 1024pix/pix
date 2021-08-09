const { detectCasing, recase } = require('@kristiandupont/recase');
const { casings } = require('../utils');
const expectedCasing = casings.camelCase;

const columnNameCasing = {
  name: 'column-name-casing',
  docs: {
    description: `Column name should be ${expectedCasing} cased`,
    url: '...',
  },
  process({ schemaObject, report }) {
    const columnValidator =
      (entityType) =>
      ({ name: entityName }) =>
      ({ name: columnName }) => {
        const casing = detectCasing(columnName);
        const matches = casing === null || casing === expectedCasing;
        if (!matches) {
          const expectedColumnName = recase(casing, expectedCasing, columnName);
          const suggestedAction = `Fix the knex migration you created by replacing t.string('${columnName}') by t.string('${expectedColumnName}')`;
          report({
            rule: this.name,
            identifier: `${schemaObject.name}.${entityName}.${columnName}`,
            message: `The column ${columnName} on the ${entityType} ${entityName} seems to be ${casing}-cased rather than ${expectedCasing}-cased.`,
            suggestedMigration: suggestedAction,
          });
        }
      };

    schemaObject.tables.forEach((entity) => {
      entity.columns.forEach(columnValidator('table')(entity));
    });
  },
};

module.exports = columnNameCasing;
