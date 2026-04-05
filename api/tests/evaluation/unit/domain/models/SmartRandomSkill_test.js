import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Unit | Domain | Models | SmartRandomSkill', function () {
  const baseData = {
    id: 'skillId00',
    name: 'someName',
    difficulty: 2,
  };

  describe('#getter tubeName', function () {
    it('returns the tube name from skill name', function () {
      const smartRandomSkill = domainBuilder.evaluation.buildSmartRandomSkill({
        ...baseData,
        name: '@theTubeName4',
      });

      expect(smartRandomSkill.tubeName).to.equal('@theTubeName');
    });
  });

  describe('#getter tubeNameWithoutPrefix', function () {
    it('returns the tube name without prefix from skill name', function () {
      const smartRandomSkill = domainBuilder.evaluation.buildSmartRandomSkill({
        ...baseData,
        name: '@theTubeName4',
      });

      expect(smartRandomSkill.tubeNameWithoutPrefix).to.equal('theTubeName');
    });
  });
});
