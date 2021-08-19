const { expect } = require('../../../test-helper');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Unit | Domain | Models | UserCompetence', function() {

  describe('#constructor', function() {

    it('should construct a model UserCompetence from attributes', function() {
      // given
      const userCompetenceRawData = {
        id: 1,
        index: '1',
        name: 'UCName',
        area: 'area',
        pixScore: 10,
        estimatedLevel: 5,
        skills: ['some skills'],
      };

      // when
      const actualUserCompetence = new UserCompetence(userCompetenceRawData);

      // then
      expect(actualUserCompetence).to.be.an.instanceof(UserCompetence);
      expect(actualUserCompetence).to.deep.equal(userCompetenceRawData);
    });
  });

  describe('#isCertifiable', function() {

    it('should return false when the user competence is not certifiable', function() {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 0 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return false when the user competence is certifiable', function() {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 1 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.true;
    });

  });

});
