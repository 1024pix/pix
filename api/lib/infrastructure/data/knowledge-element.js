const moment = require('moment');
const Bookshelf = require('../bookshelf');

require('./assessment');
require('./user');

module.exports = Bookshelf.model('KnowledgeElement', {

  tableName: 'knowledge-elements',
  hasTimestamps: ['createdAt', null],

  assessment() {
    return this.belongsTo('Assessment', 'assessmentId');
  },

  user() {
    return this.belongsTo('User');
  },

  isConcernedByTargetProfile(targetProfileSkillIds) {
    return targetProfileSkillIds.includes(this.get('skillId'));
  },

  wasCreatedBefore(comparingDate) {
    const keCreatedAt = moment(this.get('createdAt'));
    return keCreatedAt.isBefore(comparingDate);
  },

  isTheLastOneForGivenSkill(participantsKEs) {
    const matchingKEs = participantsKEs
      .filter((otherKE) => this.get('skillId') === otherKE.get('skillId'))
      .sort((ke1, ke2) => {
        const ke1Date = moment(ke1.get('createdAt'));
        const ke2Date = moment(ke2.get('createdAt'));

        if (ke1Date.isBefore(ke2Date)) return -1;
        if (ke1Date.isAfter(ke2Date)) return 1;
        return 0;
      });
    return this === matchingKEs.pop();
  },

  isValidated() {
    return this.get('status') === 'validated';
  },

});
