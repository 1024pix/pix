import { BadRequestError } from '../../../../lib/application/http-errors.js';
import * as targetProfileForUpdateRepository from '../../../../lib/infrastructure/repositories/target-profile-for-update-repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | Target-profile-for-update', function () {
  describe('#update', function () {
    it('should update the target profile without tubes', async function () {
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

  describe('#updateWithTubes', function () {
    context('when the target profile exists', function () {
      it('should update the target profile and the tubes', async function () {
        // given
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
          name: 'old name',
          category: 'old category',
          description: 'old description',
          comment: 'old comment',
          isPublic: false,
          imageUrl: 'old image url',
        });

        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: '1', level: 1 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: '2', level: 2 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: '99', level: 99 });

        await databaseBuilder.commit();

        const updatedData = {
          name: 'new-name',
          category: 'new category',
          description: 'new description',
          comment: 'new comment',
          isPublic: true,
          imageUrl: 'new-image-url',
          tubes: [
            {
              id: '1',
              level: 2,
            },
            {
              id: '3',
              level: 8,
            },
          ],
        };

        // when
        await targetProfileForUpdateRepository.updateWithTubes(targetProfileId, updatedData);

        // then
        const targetProfileFromDB = await knex('target-profiles').where({ id: targetProfileId }).first();
        expect(targetProfileFromDB.name).to.equal('new-name');
        expect(targetProfileFromDB.imageUrl).to.equal('new-image-url');
        expect(targetProfileFromDB.description).to.equal('new description');
        expect(targetProfileFromDB.comment).to.equal('new comment');
        expect(targetProfileFromDB.category).to.equal('new category');

        const targetProfileTubesFromDB = await knex('target-profile_tubes').where({ targetProfileId });
        expect(targetProfileTubesFromDB).to.have.length(2);
        // eslint-disable-next-line no-unused-vars
        expect(targetProfileTubesFromDB.map(({ id, ...tube }) => tube)).to.deep.equal([
          {
            tubeId: '1',
            level: 2,
            targetProfileId,
          },
          {
            tubeId: '3',
            level: 8,
            targetProfileId,
          },
        ]);
      });
    });

    context('when no attributes are going to be updated', function () {
      it('should throw a bad request error', async function () {
        // given
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
        await databaseBuilder.commit();

        const attributesToUpdate = {};

        // when
        const error = await catchErr(targetProfileForUpdateRepository.updateWithTubes)(
          targetProfileId,
          attributesToUpdate,
        );

        // then
        expect(error).to.be.instanceOf(BadRequestError);
      });
    });
  });
});
