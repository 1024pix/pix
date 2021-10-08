const { expect, domainBuilder } = require('../../../test-helper');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

describe('Unit | Domain | Models | UserCompetence', function () {
  describe('#constructor', function () {
    it('should construct a model UserCompetence from attributes', function () {
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

  describe('#isCertifiable', function () {
    it('should return false when the user competence is not certifiable', function () {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 0 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return false when the user competence is certifiable', function () {
      // given
      const userCompetence = new UserCompetence({ estimatedLevel: 1 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.true;
    });
  });

  describe('#sortSkillsByDecreasingDifficulty', function () {
    it('sorts skills, most difficult first', function () {
      const skill1 = domainBuilder.buildSkill({ difficulty: 2 });
      const skill2 = domainBuilder.buildSkill({ difficulty: 8 });
      const skill3 = domainBuilder.buildSkill({ difficulty: 4 });
      const uc = domainBuilder.buildUserCompetence({ skills: [skill1, skill2, skill3] });

      uc.sortSkillsByDecreasingDifficulty();

      expect(uc.skills).to.deep.equal([skill2, skill3, skill1]);
    });
  });
});
