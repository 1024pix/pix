const { expect } = require('../../../test-helper');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Unit | Domain | Models | UserCompetence', () => {

  describe('#constructor', () => {

    it('should construct a model UserCompetence from attributes and set skills and challenges to an empty array', () => {
      // given
      const userCompetenceRawData = {
        id: 1,
        index: '1',
        name: 'UCName',
        area: 'area',
        pixScore: 10,
        estimatedLevel: 5,
        skills: ['some skills'],
        challenges: ['some challenges'],
      };

      // when
      const actualUserCompetence = new UserCompetence(userCompetenceRawData);

      // then
      expect(actualUserCompetence).to.be.an.instanceof(UserCompetence);
      expect(actualUserCompetence.id).to.deep.equal(userCompetenceRawData.id);
      expect(actualUserCompetence.index).to.deep.equal(userCompetenceRawData.index);
      expect(actualUserCompetence.name).to.deep.equal(userCompetenceRawData.name);
      expect(actualUserCompetence.area).to.deep.equal(userCompetenceRawData.area);
      expect(actualUserCompetence.pixScore).to.deep.equal(userCompetenceRawData.pixScore);
      expect(actualUserCompetence.estimatedLevel).to.deep.equal(userCompetenceRawData.estimatedLevel);
      expect(actualUserCompetence.skills).to.be.empty;
      expect(actualUserCompetence.challenges).to.be.empty;
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
