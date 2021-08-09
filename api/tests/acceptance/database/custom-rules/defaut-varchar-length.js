const defaultVarcharLength = {
  name: 'default-varchar-length',
  docs: {
    description: 'Varchar columns should not use knex default length',
    url: '...',
  },
  process({ schemaObject, report }) {
    const columnValidator = ({ column, tableName }) => {
      const defaultKnexStringLength = 255;

      if ((column.type = 'varchar' && column.maxLength === defaultKnexStringLength)) {
        report({
          rule: this.name,
          identifier: `${schemaObject.name}.${tableName}`,
          message:
            `${tableName}.${column.name} length is ${defaultKnexStringLength} characters long.\n` +
            `This is the length knex give to "string" type when no length is supplied (check https://knexjs.org/#Schema-string).\n` +
            `Maximum length should be explicitly supplied, and its value properly calculated (see ADR 31).`,
          suggestedMigration:
            `Calculate maximum length, using actual maximum length in existing rows. \n` +
            `SELECT MAX(CHAR_LENGTH("${column.name}")) AS maximum_length FROM ${tableName}; \n` +
            `Then actually set it: ALTER TABLE "${tableName}" ALTER COLUMN "${column.name}" TYPE VARCHAR(<MAXIMUM_LENGTH>);\n` +
            `Nevertheless, if 255 characters is the length you actually need, add ${column.name} to the /whitelist/default-varchat-length.js file. \n`,
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

module.exports = defaultVarcharLength;
