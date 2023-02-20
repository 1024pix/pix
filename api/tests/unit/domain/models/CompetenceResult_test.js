import { expect } from '../../../test-helper';
import CompetenceResult from '../../../../lib/domain/models/CompetenceResult';

describe('Unit | Domain | Models | CompetenceResult', function () {
  describe('#masteryPercentage', function () {
    it('should return the correct masteryPercentage when totalSkillsCount is different than 0', function () {
      // given
      const expectedMasteryPercentage = 50;

      // when
      const competenceResult = new CompetenceResult({
        totalSkillsCount: 10,
        testedSkillsCount: 6,
        validatedSkillsCount: 5,
      });

      // then
      expect(competenceResult.masteryPercentage).to.be.equal(expectedMasteryPercentage);
    });

    it('should return 0 when totalSkillsCount is equal to 0', function () {
      // given
      const expectedMasteryPercentage = 0;

      // when
      const competenceResult = new CompetenceResult({
        totalSkillsCount: 0,
        testedSkillsCount: 6,
        validatedSkillsCount: 5,
      });

      // then
      expect(competenceResult.masteryPercentage).to.be.equal(expectedMasteryPercentage);
    });
  });
});
