const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const targetProfileSummaryForAdminRepository = require('../../../../lib/infrastructure/repositories/target-profile-summary-for-admin-repository');

describe('Integration | Repository | Target-profile-summary-for-admin', function () {
  describe('#findPaginatedFiltered', function () {
    context('when searched target profiles fit in one page', function () {
      let targetProfileData;
      beforeEach(function () {
        targetProfileData = [
          { id: 1, name: 'TPA', outdated: false },
          { id: 2, name: 'TPB', outdated: true },
          { id: 3, name: 'TPC', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return an array of TargetProfileSummariesForAdmin in the page', async function () {
        // given
        const filter = {};
        const page = { number: 1, size: 10 };

        // when
        const { models: actualTargetProfileSummaries, meta } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        const expectedTargetProfileSummaries = targetProfileData.map(domainBuilder.buildTargetProfileSummaryForAdmin);
        const expectedMeta = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };
        expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context("when searched target profiles don't fit in one page", function () {
      let targetProfileData;
      beforeEach(function () {
        targetProfileData = [
          { id: 1, name: 'TPA', outdated: false },
          { id: 2, name: 'TPB', outdated: true },
          { id: 3, name: 'TPC', outdated: false },
          { id: 5, name: 'TPE', outdated: true },
          { id: 4, name: 'TPD', outdated: false },
        ];
        targetProfileData.map(databaseBuilder.factory.buildTargetProfile);
        return databaseBuilder.commit();
      });

      it('should return the queried page of TargetProfileSummariesForAdmin array', async function () {
        // given
        const filter = {};
        const page = { number: 2, size: 3 };

        // when
        const { models: actualTargetProfileSummaries, meta } =
          await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
            filter,
            page,
          });

        // then
        const expectedTargetProfileSummaries = [
          domainBuilder.buildTargetProfileSummaryForAdmin({ id: 4, name: 'TPD', outdated: false }),
          domainBuilder.buildTargetProfileSummaryForAdmin({ id: 5, name: 'TPE', outdated: true }),
        ];
        const expectedMeta = { page: page.number, pageSize: page.size, pageCount: 2, rowCount: 5 };
        expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context('when passing a filter', function () {
      context('name filter', function () {
        let targetProfileData;
        beforeEach(function () {
          targetProfileData = [
            { id: 1, name: 'paTtErN', outdated: false },
            { id: 2, name: 'AApatterNOo', outdated: true },
            { id: 3, name: 'NotUnderTheRadar', outdated: false },
            { id: 4, name: 'PaTternXXXX', outdated: true },
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
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 1, name: 'paTtErN', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 2, name: 'AApatterNOo', outdated: true }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 4, name: 'PaTternXXXX', outdated: true }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
      });
      context('id filter', function () {
        let targetProfileData;
        beforeEach(function () {
          targetProfileData = [
            { id: 1, name: 'TPA', outdated: false },
            { id: 11, name: 'TPB', outdated: true },
            { id: 21, name: 'TPC', outdated: false },
            { id: 4, name: 'TPD', outdated: true },
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
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 1, name: 'TPA', outdated: false }),
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
});
