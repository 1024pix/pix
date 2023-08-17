import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildTargetProfile } from './build-target-profile.js';

function buildStage({
  id = databaseBuffer.getNextId(),
  message = 'Courage !',
  title = 'Encouragement, il en a bien besoin',
  level = null,
  threshold = 10,
  isFirstSkill = false,
  targetProfileId,
  prescriberTitle = null,
  prescriberDescription = null,
} = {}) {
  targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile().id : targetProfileId;
  const values = {
    id,
    message,
    title,
    level,
    threshold,
    isFirstSkill,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'stages',
    values,
  });
}

buildStage.withLevel = function ({
  id,
  message,
  title,
  level = 3,
  isFirstSkill,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {
  return buildStage({
    id,
    message,
    title,
    level,
    isFirstSkill,
    threshold: null,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  });
};

buildStage.withLevel.zero = function ({
  id,
  message,
  title,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {
  return buildStage({
    id,
    message,
    title,
    level: 0,
    isFirstSkill: false,
    threshold: null,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  });
};

buildStage.firstSkill = function ({
  id,
  message,
  title,
  targetProfileId,
  prescriberTitle,
  prescriberDescription,
} = {}) {
  return buildStage({
    id,
    message,
    title,
    level: null,
    isFirstSkill: true,
    threshold: null,
    targetProfileId,
    prescriberTitle,
    prescriberDescription,
  });
};

export { buildStage };
