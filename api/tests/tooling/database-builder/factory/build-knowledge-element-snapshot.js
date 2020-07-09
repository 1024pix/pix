const faker = require('faker');
const buildKnowledgeElement = require('./build-knowledge-element');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildKnowledgeElementSnapshot({
  id,
  userId,
  createdAt = faker.date.recent(),
  snapshot,
} = {}) {

  userId = _.isUndefined(userId) ? buildUser().id : userId;
  if (!snapshot) {
    const knowledgeElements = [];
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt }));
    knowledgeElements.push(buildKnowledgeElement({ userId, createdAt }));
    snapshot = JSON.stringify(knowledgeElements);
  }

  const values = {
    id,
    userId,
    createdAt,
    snapshot
  };

  return databaseBuffer.pushInsertable({
    tableName: 'knowledge-element-snapshots',
    values,
  });
};

