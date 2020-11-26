const faker = require('faker');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildKnowledgeElementSnapshot({
  id,
  userId,
  snappedAt = faker.date.recent(),
  snapshot,
} = {}) {

  const dateMinusOneDay = new Date(snappedAt.getTime() - 1000 * 60 * 60 * 24 * 7);
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  if (!snapshot) {
    const knowledgeElements = [];
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: dateMinusOneDay }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt: dateMinusOneDay }));
    snapshot = JSON.stringify(knowledgeElements);
  }

  const values = {
    id,
    userId,
    snappedAt,
    snapshot,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
};
