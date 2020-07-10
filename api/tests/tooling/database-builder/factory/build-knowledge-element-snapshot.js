const faker = require('faker');
const _ = require('lodash');
const moment = require('moment');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');

module.exports = function buildKnowledgeElementSnapshot({
  id,
  userId,
  snappedAt = faker.date.recent(),
  snapshot,
} = {}) {
  const referenceDate = moment(snappedAt);
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  if (!snapshot) {
    const knowledgeElements = [];
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: referenceDate.subtract(1, 'd') }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: referenceDate.subtract(1, 'd') }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: referenceDate.subtract(1, 'd') }));
    snapshot = JSON.stringify(knowledgeElements);
  }

  const values = {
    id,
    userId,
    snappedAt,
    snapshot
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
};

