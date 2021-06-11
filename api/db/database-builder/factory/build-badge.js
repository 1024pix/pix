const databaseBuffer = require('../database-buffer');
const buildTargetProfile = require('./build-target-profile');

module.exports = function buildBadge({
  id = databaseBuffer.getNextId(),
  altMessage = 'alt message',
  imageUrl = '/img_funny.svg',
  message = 'message',
  title = 'title',
  key = 'key',
  isCertifiable = false,
  targetProfileId,
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badges',
    values,
  });
};
