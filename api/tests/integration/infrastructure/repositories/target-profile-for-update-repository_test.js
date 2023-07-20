import { expect, databaseBuilder, knex } from '../../../test-helper.js';
import * as targetProfileForUpdateRepository from '../../../../lib/infrastructure/repositories/target-profile-for-update-repository.js';

describe('Integration | Repository | Target-profile-for-update', function () {
  describe('#update', function () {
    it('should update the target profile', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({
        id: 123,
        name: 'old name',
        imageUrl: 'old image url',
        description: 'old description',
        comment: 'old comment',
        category: 'old category',
        areKnowledgeElementsResettable: false,
      });
      await databaseBuilder.commit();
      const updatedData = {
        targetProfileId: 123,
        name: 'new-name',
        imageUrl: 'new-image-url',
        description: 'new description',
        comment: 'new comment',
        category: 'new category',
        areKnowledgeElementsResettable: true,
      };

      // when
      await targetProfileForUpdateRepository.update(updatedData);

      // then
      const targetProfileFromDB = await knex('target-profiles').where({ id: 123 }).first();
      expect(targetProfileFromDB.name).to.equal('new-name');
      expect(targetProfileFromDB.imageUrl).to.equal('new-image-url');
      expect(targetProfileFromDB.description).to.equal('new description');
      expect(targetProfileFromDB.comment).to.equal('new comment');
      expect(targetProfileFromDB.category).to.equal('new category');
      expect(targetProfileFromDB.areKnowledgeElementsResettable).to.be.true;
    });
  });
});
