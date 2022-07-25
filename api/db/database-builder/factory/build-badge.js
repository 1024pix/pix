const databaseBuffer = require('../database-buffer');
const buildTargetProfile = require('./build-target-profile');

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
  targetProfileId = targetProfileId ? targetProfileId : buildTargetProfile().id;

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

module.exports = buildBadge;
