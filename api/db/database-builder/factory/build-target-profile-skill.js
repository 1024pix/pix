import buildTargetProfile from './build-target-profile';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildTargetProfileSkill({
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
}
