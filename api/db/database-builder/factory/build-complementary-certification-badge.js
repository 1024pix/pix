import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildBadge } from './build-badge.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';

const buildComplementaryCertificationBadge = function ({
  id = databaseBuffer.getNextId(),
  level = 1,
  complementaryCertificationId,
  badgeId,
  createdAt = new Date('2020-01-01'),
  imageUrl = 'http://badge-image-url.fr',
  label = 'Label par defaut',
  certificateMessage,
  temporaryCertificateMessage,
  stickerUrl = 'http://stiker-url.fr',
  detachedAt = null,
  createdBy,
} = {}) {
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;
  badgeId = _.isNull(badgeId) ? buildBadge().id : badgeId;

  const values = {
    id,
    level,
    complementaryCertificationId,
    badgeId,
    createdAt,
    imageUrl,
    label,
    certificateMessage,
    temporaryCertificateMessage,
    stickerUrl,
    detachedAt,
    createdBy,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-badges',
    values,
  });
};

export { buildComplementaryCertificationBadge };
