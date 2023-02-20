import { expect, catchErr } from '../../../test-helper';
import TargetProfileForUpdate from '../../../../lib/domain/models/TargetProfileForUpdate';
import TargetProfile from '../../../../lib/domain/models/TargetProfile';
import { EntityValidationError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | TargetProfileForUpdate', function () {
  describe('#update', function () {
    it('should update attributes', function () {
      const targetProfile = new TargetProfileForUpdate({
        name: 'name',
        description: 'description',
        comment: 'commment',
        category: TargetProfile.categories.OTHER,
      });

      targetProfile.update({
        name: 'changedName',
        description: 'changedDescription',
        comment: 'changedComment',
        category: TargetProfile.categories.COMPETENCES,
      });

      expect(targetProfile.name).to.eq('changedName');
      expect(targetProfile.description).to.eq('changedDescription');
      expect(targetProfile.comment).to.eq('changedComment');
      expect(targetProfile.category).to.eq(TargetProfile.categories.COMPETENCES);
    });

    it('should throw error when name is null', async function () {
      const targetProfile = new TargetProfileForUpdate({ name: 'name', category: TargetProfile.categories.OTHER });
      const error = await catchErr(
        targetProfile.update,
        targetProfile
      )({
        name: null,
        category: TargetProfile.categories.OTHER,
      });

      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.eq('name');
      expect(error.invalidAttributes[0].message).to.eq('NAME_IS_REQUIRED');
    });

    it('should throw error when category no match', async function () {
      const targetProfile = new TargetProfileForUpdate({ name: 'name', category: TargetProfile.categories.OTHER });
      const error = await catchErr(
        targetProfile.update,
        targetProfile
      )({
        name: 'Godzilla',
        category: null,
      });

      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.eq('category');
      expect(error.invalidAttributes[0].message).to.eq('CATEGORY_IS_REQUIRED');
    });
  });
});
