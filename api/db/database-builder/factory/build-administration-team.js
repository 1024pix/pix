import { databaseBuffer } from '../database-buffer.ts';

const buildAdministrationTeam = function ({
  id = databaseBuffer.getNextId(),
  name = `Équipe ${id}`,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  const values = {
    id,
    name,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'administration_teams',
    values,
  });
};

export { buildAdministrationTeam };
