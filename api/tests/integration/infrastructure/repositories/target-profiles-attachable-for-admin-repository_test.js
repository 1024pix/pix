import { databaseBuilder, expect } from '../../../test-helper.js';
import * as targetProfileAttachableForAdminRepository from '../../../../lib/infrastructure/repositories/target-profiles-attachable-for-admin-repository.js';

describe('Integration | Repository | target-profiles-attachable-for-admin', function () {
  describe('#findAttachable', function () {
    it('should return target profiles ordered by name asc, then id desc', async function () {
      // given
      const firstResult = {
        id: 100,
        name: 'AAA',
        isPublic: false,
        outdated: false,
      };
      databaseBuilder.factory.buildTargetProfile(firstResult);

      const secondResult = {
        id: 300,
        name: 'BBB',
        isPublic: true,
        outdated: false,
      };
      databaseBuilder.factory.buildTargetProfile(secondResult);
      const thirdResult = {
        id: 200,
        name: 'BBB',
        isPublic: false,
        outdated: false,
      };
      databaseBuilder.factory.buildTargetProfile(thirdResult);

      await databaseBuilder.commit();

      // when
      const results = await targetProfileAttachableForAdminRepository.find();

      // then
      expect(results).to.deep.equal([
        { id: 100, name: 'AAA' },
        { id: 300, name: 'BBB' },
        { id: 200, name: 'BBB' },
      ]);
    });

    it('should not return outdated target profiles', async function () {
      // given
      databaseBuilder.factory.buildTargetProfile({
        id: 100,
        name: 'NOTOUTDATED',
        isPublic: false,
        outdated: false,
      });

      databaseBuilder.factory.buildTargetProfile({
        id: 300,
        name: 'OUTDATED',
        isPublic: true,
        outdated: true,
      });
      await databaseBuilder.commit();

      // when
      const results = await targetProfileAttachableForAdminRepository.find();

      // then
      expect(results).to.deep.equal([{ id: 100, name: 'NOTOUTDATED' }]);
    });

    context('when the target profiles is not linked to any badges', function () {
      it('should return target profiles', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({
          id: 100,
          name: 'Not tied to a complementary',
          isPublic: false,
          outdated: false,
        });

        await databaseBuilder.commit();

        // when
        const results = await targetProfileAttachableForAdminRepository.find();

        // then
        expect(results).to.deep.equal([{ id: 100, name: 'Not tied to a complementary' }]);
      });
    });

    context('when the target profiles has been linked to a complementary certification', function () {
      it('should not return target profiles currently attached to a complementary', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile({
          id: 100,
          name: 'currentlyAttachedToATargetProfile',
          isPublic: false,
          outdated: false,
        });
        _createComplementaryCertificationBadge({
          targetProfileId: targetProfile.id,
          detachedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const results = await targetProfileAttachableForAdminRepository.find();

        // then
        expect(results).to.deep.equal([]);
      });

      it('should return target profiles detached from a complementary', async function () {
        // given
        const targetProfile = databaseBuilder.factory.buildTargetProfile({
          id: 100,
          name: 'currentlyDetached',
          isPublic: false,
          outdated: false,
        });
        _createComplementaryCertificationBadge({
          targetProfileId: targetProfile.id,
          detachedAt: new Date(),
        });

        await databaseBuilder.commit();

        // when
        const results = await targetProfileAttachableForAdminRepository.find();

        // then
        expect(results).to.deep.equal([{ id: 100, name: 'currentlyDetached' }]);
      });
    });

    context('when there is a term to search for', function () {
      context('when I am searching for a target profile by its name', function () {
        it('should return target profiles matching the search term in their name', async function () {
          // given
          databaseBuilder.factory.buildTargetProfile({
            id: 1,
            name: 'notAValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'notAValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 2,
            name: 'CLEA aValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 3,
            name: 'aValidResult CLEA',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 4,
            name: 'aValidCLEAResult',
            isPublic: false,
            outdated: false,
          });
          await databaseBuilder.commit();

          const searchTerm = 'CLEA';

          // when
          const results = await targetProfileAttachableForAdminRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 2, name: 'CLEA aValidResult' },
            { id: 4, name: 'aValidCLEAResult' },
            { id: 3, name: 'aValidResult CLEA' },
          ]);
        });

        it('should not be case sensitive', async function () {
          // given
          databaseBuilder.factory.buildTargetProfile({
            id: 2,
            name: 'CLÉA aValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 3,
            name: 'aValidResult CléA',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 4,
            name: 'aValidCLéAResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 5,
            name: 'cléa',
            isPublic: false,
            outdated: false,
          });
          await databaseBuilder.commit();

          const searchTerm = 'cléa';

          // when
          const results = await targetProfileAttachableForAdminRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 2, name: 'CLÉA aValidResult' },
            { id: 4, name: 'aValidCLéAResult' },
            { id: 3, name: 'aValidResult CléA' },
            { id: 5, name: 'cléa' },
          ]);
        });
      });

      context('when I am searching for a target profile by its ID', function () {
        it('should return target profiles matching the search term in their id', async function () {
          // given
          databaseBuilder.factory.buildTargetProfile({
            id: 1,
            name: 'notAValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 2,
            name: 'aValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'aValidResult',
            isPublic: false,
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 21,
            name: 'aValidResult',
            isPublic: false,
            outdated: false,
          });
          await databaseBuilder.commit();

          const searchTerm = '2';

          // when
          const results = await targetProfileAttachableForAdminRepository.find({ searchTerm });

          // then
          expect(results).to.deep.equal([
            { id: 21, name: 'aValidResult' },
            { id: 12, name: 'aValidResult' },
            { id: 2, name: 'aValidResult' },
          ]);
        });
      });
    });
  });
});

function _createComplementaryCertificationBadge({ targetProfileId, detachedAt }) {
  const badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
  }).id;

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId,
    complementaryCertificationId: null,
    detachedAt,
  });

  return badgeId;
}
