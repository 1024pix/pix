const _ = require('lodash');
const buildBadge = require('./build-badge');
const buildComplementaryCertification = require('./build-complementary-certification');
const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertificationBadge({
  id = databaseBuffer.getNextId(),
  complementaryCertificationId,
  badgeId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;
  badgeId = _.isNull(badgeId) ? buildBadge().id : badgeId;

  const values = {
    id,
    complementaryCertificationId,
    badgeId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-badges',
    values,
  });
};
