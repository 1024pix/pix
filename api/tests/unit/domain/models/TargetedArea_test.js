const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Target-Profile/TargetedArea', function() {

  describe('hasCompetence', function() {

    it('should return true when the competence is in area', function() {
      // given
      const competence = domainBuilder.buildTargetedCompetence({ id: 'competenceId', areaId: 'areaId' });
      const area = domainBuilder.buildTargetedArea({ id: 'areaId', competences: [competence] });

      // when
      const isIncluded = area.hasCompetence(competence.id);

      // then
      expect(isIncluded).to.be.true;
    });

    it('should return false when the skill is not in tube', function() {
      // given
      const area = domainBuilder.buildTargetedArea({ id: 'areaId', competences: [] });

      // when
      const isIncluded = area.hasCompetence('someCompetenceId');

      // then
      expect(isIncluded).to.be.false;
    });
  });
});
