const moment = require('moment');
const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

const modelName = 'KnowledgeElement';

module.exports = Bookshelf.model(modelName, {

  tableName: 'knowledge-elements',
  hasTimestamps: ['createdAt', null],
  requireFetch: false,

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User');
  },

  isCoveredByTargetProfile(targetProfileSkillIds) {
    return targetProfileSkillIds.includes(this.get('skillId'));
  },

  wasCreatedBefore(comparingDate) {
    const keCreatedAt = moment(this.get('createdAt'));
    return keCreatedAt.isBefore(comparingDate);
  },

  isValidated() {
    return this.get('status') === 'validated';
  },

}, {
  modelName
});
