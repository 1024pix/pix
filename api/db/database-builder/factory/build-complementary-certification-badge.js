import _ from 'lodash';
import buildBadge from './build-badge';
import buildComplementaryCertification from './build-complementary-certification';
import databaseBuffer from '../database-buffer';

export default function buildComplementaryCertificationBadge({
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-badges',
    values,
  });
}
