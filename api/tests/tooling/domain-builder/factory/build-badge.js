import { Badge } from '../../../../src/shared/domain/models/Badge.js';

const buildBadge = function ({
  id = 1,
  altMessage = 'altMessage',
  imageUrl = '/img/banana',
  message = 'message',
  title = 'title',
  key = 'key',
  isCertifiable = false,
  targetProfileId = 456,
  isAlwaysVisible = false,
  complementaryCertificationBadge = null,
} = {}) {
  return new Badge({
    id,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    targetProfileId,
    isAlwaysVisible,
    complementaryCertificationBadge,
  });
};

export { buildBadge };
