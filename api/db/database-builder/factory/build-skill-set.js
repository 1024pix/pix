import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildSkillSet = function ({ id = databaseBuffer.getNextId(), name = 'name', skillIds = [], badgeId } = {}) {
  if (_.isEmpty(skillIds)) {
    skillIds = ['recABC123', 'recDEF456'];
  }

  const values = {
    id,
    name,
    skillIds,
    badgeId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'skill-sets',
    values,
  });
};

export { buildSkillSet };
