import { expect, databaseBuilder, domainBuilder } from '../../../test-helper.js';
import * as targetProfileSummaryForAdminRepository from '../../../../lib/infrastructure/repositories/target-profile-summary-for-admin-repository.js';

describe('Integration | Repository | Target-profile-summary-for-admin', function () {
  describe('#findPaginatedFiltered', function () {
    it('return TargetProfileSummaryForAdmins model', async function () {
      // given
      const targetProfile = { id: 1, name: 'Go go target profile', outdated: false, createdAt: new Date('2021-01-01') };
      databaseBuilder.factory.buildTargetProfile(targetProfile);
      await databaseBuilder.commit();

      const filter = {};
      const page = { number: 1, size: 10 };

      // when
      const {
        models: [actualTargetProfileSummary],
      } = await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
        filter,
        page,
      });

      // then
      expect(actualTargetProfileSummary).to.deep.equal(targetProfile);
    });

    context('ordered target profile list', function () {
      it('return sorted active target profile first', async function () {
        // given
        const targetProfileData = [
          { id: 1, name: 'TPA', outdated: false },
          { id: 2, name: 'TPA', outdated: true },
          { id: 5, name: 'TPA', outdated: true },
          { id: 6, name: 'TPA', outdated: true },
          { id: 7, name: 'TPA', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };

        // when
        const { models: actualTargetProfileSummaries } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(actualTargetProfileSummaries.length).to.equal(5);
        expect(actualTargetProfileSummaries[0].outdated).to.be.false;
        expect(actualTargetProfileSummaries[1].outdated).to.be.false;
      });

      it('return sorted by name target profile first', async function () {
        // given
        const targetProfileData = [
          { id: 2, name: 'TPE', outdated: true },
          { id: 4, name: 'TPD', outdated: true },
          { id: 5, name: 'TPC', outdated: false },
          { id: 6, name: 'TPB', outdated: true },
          { id: 7, name: 'TPA', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };

        // when
        const { models: actualTargetProfileSummaries } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        expect(actualTargetProfileSummaries.length).to.equal(5);
        expect(actualTargetProfileSummaries[0].name).to.equal('TPA');
        expect(actualTargetProfileSummaries[1].name).to.equal('TPC');
      });
    });

    context('when searched target profiles fit in one page', function () {
      it('return TargetProfileSummariesForAdmin in the page', async function () {
        // given
        const targetProfileData = [
          { id: 1, name: 'TPA', outdated: false },
          { id: 2, name: 'TPB', outdated: true },
          { id: 3, name: 'TPC', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };

        // when
        const { models: actualTargetProfileSummaries, meta } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        const expectedMeta = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };
        expect(actualTargetProfileSummaries.length).to.equal(3);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context("when searched target profiles  doesn't fit in one page", function () {
      it('return TargetProfileSummariesForAdmin in the page', async function () {
        // given
        const targetProfileData = [
          { id: 1, name: 'TPA', outdated: false },
          { id: 2, name: 'TPB', outdated: true },
          { id: 3, name: 'TPC', outdated: false },
          { id: 5, name: 'TPE', outdated: true },
          { id: 4, name: 'TPD', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 2, size: 3 };

        // when
        const { models: actualTargetProfileSummaries, meta } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        const expectedMeta = { page: page.number, pageSize: page.size, pageCount: 2, rowCount: 5 };
        expect(actualTargetProfileSummaries.length).to.equal(2);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context('when passing a filter', function () {
      context('name filter', function () {
        let targetProfileData;
        beforeEach(function () {
          targetProfileData = [
            { id: 1, name: 'paTtErN', outdated: false, createdAt: new Date('2021-01-01') },
            { id: 2, name: 'AApatterNOo', outdated: true, createdAt: new Date('2021-01-01') },
            { id: 3, name: 'NotUnderTheRadar', outdated: false, createdAt: new Date('2021-01-01') },
            { id: 4, name: 'PaTternXXXX', outdated: true, createdAt: new Date('2021-01-01') },
          ];
          targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
          return databaseBuilder.commit();
        });

        it('should return only target profiles matching "name" pattern in filter', async function () {
          // given
          const filter = { name: 'pattern' };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({
              id: 1,
              name: 'paTtErN',
              outdated: false,
              createdAt: new Date('2021-01-01'),
            }),
            domainBuilder.buildTargetProfileSummaryForAdmin({
              id: 2,
              name: 'AApatterNOo',
              outdated: true,
              createdAt: new Date('2021-01-01'),
            }),
            domainBuilder.buildTargetProfileSummaryForAdmin({
              id: 4,
              name: 'PaTternXXXX',
              outdated: true,
              createdAt: new Date('2021-01-01'),
            }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
      });
      context('id filter', function () {
        let targetProfileData;
        beforeEach(function () {
          targetProfileData = [
            { id: 1, name: 'TPA', outdated: false, createdAt: new Date('2021-01-01') },
            { id: 11, name: 'TPB', outdated: true, createdAt: new Date('2021-01-01') },
            { id: 21, name: 'TPC', outdated: false, createdAt: new Date('2021-01-01') },
            { id: 4, name: 'TPD', outdated: true, createdAt: new Date('2021-01-01') },
          ];
          targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
          return databaseBuilder.commit();
        });

        it('should return only target profiles with exact match ID', async function () {
          // given
          const filter = { id: 1 };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({
              id: 1,
              name: 'TPA',
              outdated: false,
              createdAt: new Date('2021-01-01'),
            }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
      });
      context('no match', function () {
        let targetProfileData;
        beforeEach(function () {
          targetProfileData = [
            { id: 1, name: 'HELLO', outdated: false },
            { id: 2, name: 'SALUT', outdated: true },
          ];
          targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
          return databaseBuilder.commit();
        });

        it('should return an empty array when no records match the filter', async function () {
          // given
          const filter = { name: 'COUCOU' };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          expect(actualTargetProfileSummaries).to.deepEqualArray([]);
        });
      });
    });
  });

  describe('#findByOrganization', function () {
    context('when organization does not exist', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ id: 1 });
        databaseBuilder.factory.buildTargetProfile({
          id: 10,
          ownerOrganizationId: 1,
          outdated: false,
          isPublic: false,
        });
        await databaseBuilder.commit();

        // when
        const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
          organizationId: 55,
        });

        // then
        expect(actualTargetProfileSummaries).to.deepEqualArray([]);
      });
    });

    context('when organization exists', function () {
      context('when organization has no target profiles attached', function () {
        it('should return an empty array', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            ownerOrganizationId: 1,
            outdated: false,
            isPublic: false,
          });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 2,
          });

          // then
          expect(actualTargetProfileSummaries).to.deepEqualArray([]);
        });
      });

      context('when organization has some target profiles attached', function () {
        it('should return summaries for owned target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'A_tp',
            ownerOrganizationId: 1,
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'B_tp',
            ownerOrganizationId: 1,
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'Not_Mine',
            ownerOrganizationId: 2,
            outdated: false,
            isPublic: false,
          });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 10, name: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });

        it('should return once if target profile is owned and shared', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'A_tp',
            ownerOrganizationId: 1,
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildOrganization({ id: 3 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 11, organizationId: 2 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 11, organizationId: 3 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });

        it('should return summaries for attached target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'A_tp',
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'B_tp',
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'Not_Mine',
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 10, organizationId: 1 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 11, organizationId: 1 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: 2 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 10, name: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
        it('should return summaries for public target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'A_tp',
            outdated: false,
            isPublic: true,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'B_tp',
            outdated: false,
            isPublic: true,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'Not_Mine',
            outdated: false,
            isPublic: false,
          });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 10, name: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
        it('should ignore outdated target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'A_tp',
            outdated: false,
            isPublic: true,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'B_tp',
            outdated: true,
            isPublic: true,
          });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
        it('should return summaries within constraints (mix)', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'A_tp',
            outdated: false,
            isPublic: true,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'B_tp',
            ownerOrganizationId: 1,
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'C_tp',
            outdated: false,
            isPublic: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 13,
            name: 'D_tp',
            outdated: true,
            isPublic: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: 1 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileSummaryForAdminRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 10, name: 'A_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, name: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 12, name: 'C_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
      });
    });
  });

  describe('#findByTraining', function () {
    it('should return summaries related to given training', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();
      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile1.id,
      });
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile2.id,
      });

      const anotherTraining = databaseBuilder.factory.buildTraining();
      const targetProfileLinkedToAnotherTraining = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: anotherTraining.id,
        targetProfileId: targetProfileLinkedToAnotherTraining.id,
      });
      await databaseBuilder.commit();

      // when
      const targetProfileSummaries = await targetProfileSummaryForAdminRepository.findByTraining({
        trainingId: training.id,
      });

      // then
      const expectedTargetProfileSummaries = [
        domainBuilder.buildTargetProfileSummaryForAdmin({ ...targetProfile1, createdAt: undefined }),
        domainBuilder.buildTargetProfileSummaryForAdmin({ ...targetProfile2, createdAt: undefined }),
      ];
      expect(targetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
    });

    it('should return empty array when no target profile is linked to given training', async function () {
      const training = databaseBuilder.factory.buildTraining();
      await databaseBuilder.commit();

      const targetProfileSummaries = await targetProfileSummaryForAdminRepository.findByTraining({
        trainingId: training.id,
      });

      expect(targetProfileSummaries).to.be.empty;
    });

    it('should return empty array when no training is found', async function () {
      const targetProfileSummaries = await targetProfileSummaryForAdminRepository.findByTraining({
        trainingId: 123,
      });

      expect(targetProfileSummaries).to.be.empty;
    });
  });
});
