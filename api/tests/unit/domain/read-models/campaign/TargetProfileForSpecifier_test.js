import { expect } from '../../../../test-helper';
import TargetProfileForSpecifier from '../../../../../lib/domain/read-models/campaign/TargetProfileForSpecifier';

describe('TargetProfileForSpecifier', function () {
  describe('#constructor', function () {
    it('returns the properties', function () {
      const targetProfile = new TargetProfileForSpecifier({
        id: 1,
        name: 'name',
        tubeCount: 0,
        thematicResultCount: 2,
        hasStage: true,
        description: 'description',
        category: 'category',
      });

      expect(targetProfile.id).to.equal(1);
      expect(targetProfile.name).to.equal('name');
      expect(targetProfile.tubeCount).to.equal(0);
      expect(targetProfile.thematicResultCount).to.equal(2);
      expect(targetProfile.hasStage).to.eql(true);
      expect(targetProfile.description).to.eql('description');
      expect(targetProfile.category).to.eql('category');
    });
  });
});
