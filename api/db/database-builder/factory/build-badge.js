import databaseBuffer from '../database-buffer';
import buildTargetProfile from './build-target-profile';
import _ from 'lodash';

function buildBadge({
  id = databaseBuffer.getNextId(),
  altMessage = 'alt message',
  imageUrl = '/img_funny.svg',
  message = 'message',
  title = 'title',
  key = 'key',
  isCertifiable = false,
  targetProfileId,
  isAlwaysVisible = false,
} = {}) {
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

export default buildBadge;
