const { expect } = require('../../../test-helper');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Unit | Domain | Models | UserCompetence', () => {

  describe('#constructor', () => {

    it('should construct a model UserCompetence from attributes', () => {
      // given
      const userCompetenceRawData = {
        id: 1,
        index: '1',
        name: 'UCName',
        area: 'area',
        pixScore: 10,
        estimatedLevel: 5,
        skills: [],
        challenges: [],
      };

      // when
      const actualUserCompetence = new UserCompetence(userCompetenceRawData);

      // then
      expect(actualUserCompetence).to.be.an.instanceof(UserCompetence);
      expect(actualUserCompetence).to.deep.equal(userCompetenceRawData);
    });
  });

  describe('#isCertifiable', () => {

    it('should return false when the user competence is not certifiable', () => {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 0 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return false when the user competence is certifiable', () => {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 1 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.true;
    });

  });

});
