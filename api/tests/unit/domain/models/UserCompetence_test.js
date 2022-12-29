const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | UserCompetence', function () {
  describe('#isCertifiable', function () {
    it('should return false when the user competence is not certifiable', function () {
      // given
      const userCompetence = domainBuilder.buildUserCompetence({ estimatedLevel: 0 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.false;
    });

    it('should return false when the user competence is certifiable', function () {
      // given
      const userCompetence = domainBuilder.buildUserCompetence({ estimatedLevel: 1 });

      // when
      const result = userCompetence.isCertifiable();

      // then
      expect(result).to.be.true;
    });
  });

  describe('#getSkillsAtLatestVersion', function () {
    it('should return only the latest versions', function () {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@url4', version: 1 });
      const skill2 = domainBuilder.buildSkill({ name: '@web2', version: 1 });
      const skill3 = domainBuilder.buildSkill({ name: '@url4', version: 2 });
      const userCompetence = domainBuilder.buildUserCompetence({ skills: [skill1, skill2, skill3] });

      // when
      const result = userCompetence.getSkillsAtLatestVersion();
      // then
      expect(result).to.deepEqualArray([skill3, skill2]);
    });
  });
});
