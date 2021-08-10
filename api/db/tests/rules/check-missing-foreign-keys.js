const _ = require('lodash');
const { knex } = require('../../knex-database-connection');

const query = `SELECT c.table_name,
        c.column_name
 FROM information_schema.columns c
 WHERE 1 = 1
   AND c.table_catalog = 'pix'
   AND c.table_schema = 'public'
   AND c.column_name LIKE '%Id'
   AND length(c.column_name) > 2
   AND c.data_type = 'integer'
 --
 EXCEPT
 --
 SELECT tc.table_name,
        kcu.column_name
 FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
               ON tc.constraint_name = kcu.constraint_name
                   AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
               ON ccu.constraint_name = tc.constraint_name
                   AND ccu.table_schema = tc.table_schema
 WHERE 1 = 1
   AND tc.constraint_type = 'FOREIGN KEY'`;

const execute = async (whiteList) => {
  const { rows: candidates } = await knex.raw(query);

  const missingForeignKeys = _.differenceWith(candidates, whiteList, (a, b) => {
    return a.table_name === b.table_name && a.column_name === b.column_name;
  });

  return missingForeignKeys;
};

module.exports = { execute };
