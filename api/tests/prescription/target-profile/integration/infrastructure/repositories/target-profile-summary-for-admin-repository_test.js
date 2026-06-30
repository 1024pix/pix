import * as targetProfileSummaryForAdminRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-summary-for-admin-repository.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { TargetProfile } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | Target-profile-summary-for-admin', function () {
  describe('#findPaginatedFiltered', function () {
    it('return TargetProfileSummaryForAdmins model', async function () {
      // given
      const targetProfile = {
        id: 1,
        internalName: 'Go go target profile',
        outdated: false,
        createdAt: new Date('2021-01-01'),
        category: TargetProfile.categories.PREDEFINED,
      };
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
          { id: 1, internalName: 'TPA', outdated: false },
          { id: 2, internalName: 'TPA', outdated: true },
          { id: 5, internalName: 'TPA', outdated: true },
          { id: 6, internalName: 'TPA', outdated: true },
          { id: 7, internalName: 'TPA', outdated: false },
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
        expect(actualTargetProfileSummaries).to.have.lengthOf(5);
        expect(actualTargetProfileSummaries[0].outdated).to.be.false;
        expect(actualTargetProfileSummaries[1].outdated).to.be.false;
      });

      it('return sorted by name target profile first', async function () {
        // given
        const targetProfileData = [
          { id: 2, internalName: 'TPE', outdated: true },
          { id: 4, internalName: 'TPD', outdated: true },
          { id: 5, internalName: 'TPC', outdated: false },
          { id: 6, internalName: 'TPB', outdated: true },
          { id: 7, internalName: 'TPA', outdated: false },
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
        expect(actualTargetProfileSummaries).to.have.lengthOf(5);
        expect(actualTargetProfileSummaries[0].internalName).to.equal('TPA');
        expect(actualTargetProfileSummaries[1].internalName).to.equal('TPC');
      });
    });

    context('when searched target profiles fit in one page', function () {
      it('return TargetProfileSummariesForAdmin in the page', async function () {
        // given
        const targetProfileData = [
          { id: 1, internalName: 'TPA', outdated: false },
          { id: 2, internalName: 'TPB', outdated: true },
          { id: 3, internalName: 'TPC', outdated: false },
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
        expect(actualTargetProfileSummaries).to.have.lengthOf(3);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context("when searched target profiles  doesn't fit in one page", function () {
      it('return TargetProfileSummariesForAdmin in the page', async function () {
        // given
        const targetProfileData = [
          { id: 1, internalName: 'TPA', outdated: false },
          { id: 2, internalName: 'TPB', outdated: true },
          { id: 3, internalName: 'TPC', outdated: false },
          { id: 5, internalName: 'TPE', outdated: true },
          { id: 4, internalName: 'TPD', outdated: false },
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
        expect(actualTargetProfileSummaries).to.have.lengthOf(2);
        expect(meta).to.deep.equal(expectedMeta);
      });
    });

    context('when passing a filter', function () {
      let disciplineTargetProfile, otherTargetProfile, backToSchoolTargetProfile;

      beforeEach(function () {
        disciplineTargetProfile = {
          id: 1,
          internalName: 'TP DISCIPLINE',
          outdated: false,
          createdAt: new Date('2021-01-01'),
          category: TargetProfile.categories.DISCIPLINE,
        };
        otherTargetProfile = {
          id: 2,
          internalName: 'TP OTHER',
          outdated: true,
          createdAt: new Date('2021-01-01'),
          category: TargetProfile.categories.OTHER,
        };
        backToSchoolTargetProfile = {
          id: 3,
          internalName: 'TP BACK_TO_SCHOOL',
          outdated: false,
          createdAt: new Date('2021-01-01'),
          category: TargetProfile.categories.BACK_TO_SCHOOL,
        };

        [disciplineTargetProfile, otherTargetProfile, backToSchoolTargetProfile].map(
          databaseBuilder.factory.buildTargetProfile,
        );
        return databaseBuilder.commit();
      });

      context('internalName filter', function () {
        it('should return only target profiles matching "internalName" discipline in filter', async function () {
          // given
          const filter = { internalName: 'discipline' };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          expect(actualTargetProfileSummaries).to.deep.include(disciplineTargetProfile);
        });
      });

      context('id filter', function () {
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
          expect(actualTargetProfileSummaries).to.deep.include(disciplineTargetProfile);
        });
      });

      context('category filter', function () {
        it('should return only target profiles with matching category discipline', async function () {
          // given
          const filter = { categories: [TargetProfile.categories.DISCIPLINE, TargetProfile.categories.BACK_TO_SCHOOL] };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then

          expect(actualTargetProfileSummaries[0]).to.deep.include(backToSchoolTargetProfile);
          expect(actualTargetProfileSummaries[1]).to.deep.include(disciplineTargetProfile);
        });

        it('should return not result', async function () {
          // given
          const filter = { categories: [TargetProfile.categories.COMPETENCES] };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });
          // then
          expect(actualTargetProfileSummaries).to.have.lengthOf(0);
        });

        it('should return all result when categories is falsy', async function () {
          // given
          const filter = { categories: null };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });
          // then
          expect(actualTargetProfileSummaries).to.have.lengthOf(3);
        });
      });

      context('no match', function () {
        it('should return an empty array when no records match the filter', async function () {
          // given
          const filter = { internalName: 'COUCOU' };
          const page = { number: 1, size: 10 };

          // when
          const { models: actualTargetProfileSummaries } =
            await targetProfileSummaryForAdminRepository.findPaginatedFiltered({
              filter,
              page,
            });

          // then
          expect(actualTargetProfileSummaries).to.have.lengthOf(0);
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
        domainBuilder.buildTargetProfileSummaryForAdmin({
          ...targetProfile1,
          createdAt: undefined,
          category: undefined,
          isPartOfCombinedCourse: false,
        }),
        domainBuilder.buildTargetProfileSummaryForAdmin({
          ...targetProfile2,
          createdAt: undefined,
          category: undefined,
          isPartOfCombinedCourse: false,
        }),
      ];
      expect(targetProfileSummaries).to.deep.members(expectedTargetProfileSummaries);
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

    it('should return a targetProfileSummary instance with correct attribute when target profile is used in a combined course', async function () {
      // given
      const training = databaseBuilder.factory.buildTraining();

      const targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile();

      const organization = databaseBuilder.factory.buildOrganization();
      const campaignIdInCombinedCourse = databaseBuilder.factory.buildCampaign({
        targetProfileId: targetProfile1.id,
        organizationId: organization.id,
      }).id;

      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile1.id,
      });
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile2.id,
      });

      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaignIdInCombinedCourse }).toDTO(),
        ],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'ABCDE1234',
        name: 'Mon parcours Combiné',
        organizationId: organization.id,
        questId,
      });

      await databaseBuilder.commit();

      // when
      const targetProfileSummaries = await targetProfileSummaryForAdminRepository.findByTraining({
        trainingId: training.id,
      });

      // then
      expect(targetProfileSummaries).lengthOf(2);
      expect(targetProfileSummaries).to.deep.equal([
        {
          id: targetProfile1.id,
          internalName: targetProfile1.internalName,
          outdated: targetProfile1.outdated,
          createdAt: undefined,
          category: undefined,
          isPartOfCombinedCourse: true,
        },
        {
          id: targetProfile2.id,
          internalName: targetProfile2.internalName,
          outdated: targetProfile2.outdated,
          createdAt: undefined,
          category: undefined,
          isPartOfCombinedCourse: false,
        },
      ]);
    });
  });
});
