import * as targetProfileForUpdateRepository from '../../../../lib/infrastructure/repositories/target-profile-for-update-repository.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | Target-profile-for-update', function () {
  describe('#update', function () {
    let existingTargetProfile, tube1, tube2;

    beforeEach(async function () {
      existingTargetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'old name',
        category: 'old category',
        description: 'old description',
        comment: 'old comment',
        isPublic: false,
        imageUrl: 'old image url',
      });

      tube1 = {
        targetProfileId: existingTargetProfile.id,
        tubeId: '1',
        level: 1,
      };
      tube2 = {
        targetProfileId: existingTargetProfile.id,
        tubeId: '2',
        level: 2,
      };
      databaseBuilder.factory.buildTargetProfileTube(tube1);
      databaseBuilder.factory.buildTargetProfileTube(tube2);

      await databaseBuilder.commit();
    });

    context('with tubes', function () {
      it('should update the target profile and the tubes', async function () {
        // given
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
        await targetProfileForUpdateRepository.update({ ...existingTargetProfile, ...updatedData });

        // then
        const targetProfileFromDB = await knex('target-profiles').where({ id: existingTargetProfile.id }).first();

        expect(targetProfileFromDB.name).to.equal('new-name');
        expect(targetProfileFromDB.imageUrl).to.equal('new-image-url');
        expect(targetProfileFromDB.description).to.equal('new description');
        expect(targetProfileFromDB.comment).to.equal('new comment');
        expect(targetProfileFromDB.category).to.equal('new category');

        const targetProfileTubesFromDB = await knex('target-profile_tubes').where({
          targetProfileId: existingTargetProfile.id,
        });
        expect(targetProfileTubesFromDB).to.have.length(2);
        // eslint-disable-next-line no-unused-vars
        expect(targetProfileTubesFromDB.map(({ id, ...tube }) => tube)).to.deep.equal([
          {
            ...tube1,
            level: 2,
          },
          {
            tubeId: '3',
            level: 8,
            targetProfileId: existingTargetProfile.id,
          },
        ]);
      });
    });

    context('without tubes', function () {
      it('should update the target profile informations', async function () {
        // given
        const updatedData = {
          name: 'new-name',
          category: 'new category',
          description: 'new description',
          comment: 'new comment',
          isPublic: true,
          imageUrl: 'new-image-url',
        };

        // when
        await targetProfileForUpdateRepository.update({ ...existingTargetProfile, ...updatedData });

        // then
        const targetProfileFromDB = await knex('target-profiles').where({ id: existingTargetProfile.id }).first();

        expect(targetProfileFromDB.name).to.equal('new-name');
        expect(targetProfileFromDB.imageUrl).to.equal('new-image-url');
        expect(targetProfileFromDB.description).to.equal('new description');
        expect(targetProfileFromDB.comment).to.equal('new comment');
        expect(targetProfileFromDB.category).to.equal('new category');

        const targetProfileTubesFromDB = await knex('target-profile_tubes').where({
          targetProfileId: existingTargetProfile.id,
        });
        expect(targetProfileTubesFromDB).to.have.length(2);
        // eslint-disable-next-line no-unused-vars
        expect(targetProfileTubesFromDB.map(({ id, ...tube }) => tube)).to.deep.equal([tube1, tube2]);
      });
    });
  });
});
