import { buildTargetProfile } from './build-target-profile.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildTargetProfileSkill = function ({
  id = databaseBuffer.getNextId(),
  targetProfileId,
  skillId = 'recSKI456',
} = {}) {
  targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile().id : targetProfileId;

  const values = {
    id,
    targetProfileId,
    skillId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profiles_skills',
    values,
  });
};

export { buildTargetProfileSkill };
