import { databaseBuffer } from '../database-buffer.js';
import { buildTargetProfile } from './build-target-profile.js';
import _ from 'lodash';
import { randomUUID } from 'crypto';

function buildBadge({
  id = databaseBuffer.getNextId(),
  altMessage = 'alt message',
  imageUrl = '/img_funny.svg',
  message = 'message',
  title = 'title',
  key,
  isCertifiable = false,
  targetProfileId,
  isAlwaysVisible = false,
} = {}) {
  key = _.isUndefined(key) ? `key_${randomUUID()}` : key;
  targetProfileId = !_.isUndefined(targetProfileId) ? targetProfileId : buildTargetProfile().id;

  const values = {
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    targetProfileId,
    isAlwaysVisible,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badges',
    values,
  });
}

buildBadge.certifiable = function ({
  id = databaseBuffer.getNextId(),
  altMessage = 'alt message',
  imageUrl = '/img_funny.svg',
  message = 'message',
  title = 'title',
  key = 'key',
  targetProfileId,
  isAlwaysVisible = false,
}) {
  return buildBadge({
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable: true,
    targetProfileId,
    isAlwaysVisible,
  });
};

buildBadge.notCertifiable = function ({
  id = databaseBuffer.getNextId(),
  altMessage = 'alt message',
  imageUrl = '/img_funny.svg',
  message = 'message',
  title = 'title',
  key = 'key',
  targetProfileId,
  isAlwaysVisible = false,
}) {
  return buildBadge({
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable: false,
    targetProfileId,
    isAlwaysVisible,
  });
};

export { buildBadge };
