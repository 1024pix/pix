import { knex as datamartKnex } from '../../../../../../datamart/knex-database-connection.js';
import { TargetProfileForAdmin } from '../../../../../../src/prescription/target-profile/domain/models/TargetProfileForAdmin.js';
import * as targetProfileAdministrationRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import { constants } from '../../../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError, ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { TargetProfile } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import {
  catchErr,
  databaseBuilder,
  datamartBuilder,
  domainBuilder,
  expect,
  knex,
  learningContentBuilder,
  mockLearningContent,
  sinon,
} from '../../../../../test-helper.js';

describe('Integration | Repository | Target-profile', function () {
  describe('#get', function () {
    context('when target profile does not exist', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(targetProfileAdministrationRepository.get)({ id: 123 });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal("Le profil cible n'existe pas");
      });
    });

    context('when some target profile tubes do no exist in learning content', function () {
      it('should throw a NotFound error', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ id: 66 });
        const targetProfileDB = databaseBuilder.factory.buildTargetProfile({
          id: 1,
          name: 'Mon Super Profil Cible qui déchire',
          outdated: false,
          createdAt: new Date('2020-01-01'),
          imageUrl: 'some/image/url',
          description: 'cool stuff',
          comment: 'i like it',
          category: 'SOME_CATEGORY',
          isSimplifiedAccess: true,
          areKnowledgeElementsResettable: false,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube1',
          level: 4,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube2',
          level: 2,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube3',
          level: 8,
        });
        await databaseBuilder.commit();
        const learningContent = {
          areas: [
            {
              id: 'recAreaA',
              title_i18n: {
                fr: 'titleFRA',
              },
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              name_i18n: {
                fr: 'nameFRA',
              },
              index: '1',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemA', 'recThemB'],
            },
          ],
          thematics: [
            {
              id: 'recThemA',
              name: 'nameFRA',
              index: '1',
              competenceId: 'recCompA',
              tubeIds: ['recTube1'],
            },
          ],
          tubes: [
            {
              id: 'recTube2',
              competenceId: 'recCompA',
              name: 'tubeName2',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR2',
              },
              thematicId: 'recThemA',
            },
          ],
        };
        await mockLearningContent(learningContent);

        // when
        const err = await catchErr(targetProfileAdministrationRepository.get)({ id: 1 });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal(
          "Les sujets [recTube1, recTube3] du profil cible 1 n'existent pas dans le référentiel.",
        );
      });
    });

    context('when target profile exists and is valid', function () {
      it('should return target profile', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ id: 66 });
        const targetProfileDB = databaseBuilder.factory.buildTargetProfile({
          name: 'Mon Super Profil Cible qui déchire',
          internalName: 'Mon Super Profil Cible qui déchire en interne',
          outdated: false,
          createdAt: new Date('2020-01-01'),
          imageUrl: 'some/image/url',
          description: 'cool stuff',
          comment: 'i like it',
          category: 'SOME_CATEGORY',
          isSimplifiedAccess: true,
          areKnowledgeElementsResettable: true,
        });

        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube1',
          level: 4,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube2',
          level: 2,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube3',
          level: 8,
        });
        const firstStage = databaseBuilder.factory.buildStage.withLevel.zero({
          id: 100,
          targetProfileId: targetProfileDB.id,
          title: 'palier zero titre',
          message: 'palier zero message',
          prescriberTitle: 'palier zero titre prescripteur',
          prescriberDescription: 'palier zero description prescripteur',
        });
        const secondStage = databaseBuilder.factory.buildStage.withLevel({
          id: 101,
          targetProfileId: targetProfileDB.id,
          level: 4,
          title: 'palier 4 titre',
          message: 'palier 4 message',
          prescriberTitle: 'palier 4 titre prescripteur',
          prescriberDescription: 'palier 4 description prescripteur',
        });
        const badge1DTO = databaseBuilder.factory.buildBadge({
          targetProfileId: targetProfileDB.id,
          altMessage: 'altMessage badge1',
          imageUrl: 'image badge1',
          message: 'message badge1',
          title: 'title badge1',
          key: 'KEY_BADGE1',
          isCertifiable: true,
          isAlwaysVisible: false,
        });
        const badge1Criteria1DTO = databaseBuilder.factory.buildBadgeCriterion.scopeCampaignParticipation({
          badgeId: badge1DTO.id,
          threshold: 65,
        });
        const badge2DTO = databaseBuilder.factory.buildBadge({
          targetProfileId: targetProfileDB.id,
          altMessage: 'altMessage badge2',
          imageUrl: 'image badge2',
          message: 'message badge2',
          title: 'title badge2',
          key: 'KEY_BADGE2',
          isCertifiable: false,
          isAlwaysVisible: true,
        });
        const badge2Criteria1DTO = databaseBuilder.factory.buildBadgeCriterion.scopeCappedTubes({
          badgeId: badge2DTO.id,
          threshold: 65,
          cappedTubes: JSON.stringify([
            { id: 'recTube2', level: 6 },
            { id: 'recTube3', level: 3 },
          ]),
        });
        await databaseBuilder.commit();

        datamartBuilder.factory.buildTargetProfileCourseDuration({
          targetProfileId: targetProfileDB.id,
          median: 125,
          quantile_75: 150,
          quantile_95: 190,
        });

        await datamartBuilder.commit();

        const learningContent = {
          areas: [
            {
              id: 'recAreaA',
              title_i18n: {
                fr: 'titleFRA',
              },
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              name_i18n: {
                fr: 'nameFRA',
              },
              index: '1',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemA', 'recThemB'],
            },
            {
              id: 'recCompB',
              name_i18n: {
                fr: 'nameFRB',
              },
              index: '5',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemC', 'recThemD'],
            },
          ],
          thematics: [
            {
              id: 'recThemA',
              name_i18n: {
                fr: 'nameFRA',
              },
              index: '1',
              competenceId: 'recCompA',
              tubeIds: ['recTube1'],
            },
            {
              id: 'recThemB',
              name_i18n: {
                fr: 'nameFRB',
              },
              index: '2',
              competenceId: 'recCompA',
              tubeIds: ['recTube2'],
            },
            {
              id: 'recThemC',
              name_i18n: {
                fr: 'nameFRC',
              },
              index: '1',
              competenceId: 'recCompB',
              tubeIds: ['recTube3'],
            },
            {
              id: 'recThemD',
              name_i18n: {
                fr: 'nameFRD',
              },
              index: '4',
              competenceId: 'recCompB',
              tubeIds: ['recTube4'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              competenceId: 'recCompA',
              thematicId: 'recThemA',
              name: 'tubeName1',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR1',
              },
              isMobileCompliant: false,
              isTabletCompliant: true,
              skillIds: ['recSkillTube1'],
            },
            {
              id: 'recTube2',
              competenceId: 'recCompA',
              thematicId: 'recThemB',
              name: 'tubeName2',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR2',
              },
              isMobileCompliant: true,
              isTabletCompliant: true,
              skillIds: ['recSkillTube2'],
            },
            {
              id: 'recTube3',
              competenceId: 'recCompB',
              thematicId: 'recThemC',
              name: 'tubeName3',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR3',
              },
              isMobileCompliant: false,
              isTabletCompliant: false,
              skillIds: ['recSkillTube3'],
            },
            {
              id: 'recTube4',
              competenceId: 'recCompB',
              thematicId: 'recThemD',
              name: 'tubeName4',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR4',
              },
              isMobileCompliant: true,
              isTabletCompliant: false,
              skillIds: ['recSkillTube4'],
            },
          ],
          skills: [
            {
              id: 'recSkillTube1',
              tubeId: 'recTube1',
              status: 'actif',
              level: 1,
            },
            {
              id: 'recSkillTube2',
              tubeId: 'recTube2',
              status: 'actif',
              level: 3,
            },
            {
              id: 'recSkillTube3',
              tubeId: 'recTube3',
              status: 'archivé',
              level: 5,
            },
            {
              id: 'recSkillTube4',
              tubeId: 'recTube4',
              status: 'actif',
              level: 1,
            },
          ],
        };
        await mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileAdministrationRepository.get({ id: targetProfileDB.id });

        // then
        const skill1_tube1_themA_compA_areaA = {
          id: 'recSkillTube1',
          difficulty: 1,
          tubeId: 'recTube1',
        };
        const skill2_tube2_themB_compA_areaA = {
          difficulty: 3,
          id: 'recSkillTube2',
          tubeId: 'recTube2',
        };
        const tube1_themA_compA_areaA = {
          id: 'recTube1',
          name: 'tubeName1',
          practicalTitle: 'practicalTitleFR1',
          level: 4,
          isMobileCompliant: false,
          isTabletCompliant: true,
          thematicId: 'recThemA',
        };
        const tube2_themB_compA_areaA = {
          id: 'recTube2',
          name: 'tubeName2',
          practicalTitle: 'practicalTitleFR2',
          level: 2,
          isMobileCompliant: true,
          isTabletCompliant: true,
          thematicId: 'recThemB',
        };
        const tube3_themC_compB_areaA = {
          id: 'recTube3',
          name: 'tubeName3',
          practicalTitle: 'practicalTitleFR3',
          level: 8,
          isMobileCompliant: false,
          isTabletCompliant: false,
          thematicId: 'recThemC',
        };
        const themA_compA_areaA = {
          id: 'recThemA',
          name: 'nameFRA',
          index: 1,
          competenceId: 'recCompA',
        };
        const themB_compA_areaA = {
          id: 'recThemB',
          name: 'nameFRB',
          index: 2,
          competenceId: 'recCompA',
        };
        const themC_compB_areaA = {
          id: 'recThemC',
          name: 'nameFRC',
          index: 1,
          competenceId: 'recCompB',
        };
        const compA_areaA = {
          id: 'recCompA',
          name: 'nameFRA',
          index: '1',
          areaId: 'recAreaA',
        };
        const compB_areaA = {
          id: 'recCompB',
          name: 'nameFRB',
          index: '5',
          areaId: 'recAreaA',
        };
        const areaA = {
          id: 'recAreaA',
          title: 'titleFRA',
          code: 'codeA',
          color: 'colorA',
          frameworkId: 'fmk1',
        };
        const expectedStageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
          id: targetProfileDB.id,
          maxLevel: 8,
          stages: [firstStage, secondStage],
        });
        const criteria1Badge1 =
          domainBuilder.buildBadgeDetails.buildBadgeCriterion_CampaignParticipation(badge1Criteria1DTO);
        const expectedBadge1 = domainBuilder.buildBadgeDetails({
          ...badge1DTO,
          criteria: [criteria1Badge1],
        });
        const criteria1Badge2 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_CappedTubes({
          ...badge2Criteria1DTO,
          cappedTubesDTO: [
            { tubeId: 'recTube2', level: 6 },
            { tubeId: 'recTube3', level: 3 },
          ],
        });
        const expectedBadge2 = domainBuilder.buildBadgeDetails({
          ...badge2DTO,
          criteria: [criteria1Badge2],
        });
        const expectedTargetProfile = new TargetProfileForAdmin({
          id: targetProfileDB.id,
          name: targetProfileDB.name,
          internalName: targetProfileDB.internalName,
          createdAt: targetProfileDB.createdAt,
          outdated: targetProfileDB.outdated,
          description: targetProfileDB.description,
          comment: targetProfileDB.comment,
          imageUrl: targetProfileDB.imageUrl,
          category: targetProfileDB.category,
          isSimplifiedAccess: targetProfileDB.isSimplifiedAccess,
          areKnowledgeElementsResettable: targetProfileDB.areKnowledgeElementsResettable,
          hasLinkedCampaign: false,
          hasLinkedAutonomousCourse: false,
          badges: [expectedBadge1, expectedBadge2],
          stageCollection: expectedStageCollection,
          areas: [areaA],
          competences: [compA_areaA, compB_areaA],
          thematics: [themA_compA_areaA, themB_compA_areaA, themC_compB_areaA],
          tubes: [tube1_themA_compA_areaA, tube2_themB_compA_areaA, tube3_themC_compB_areaA],
          skills: [skill1_tube1_themA_compA_areaA, skill2_tube2_themB_compA_areaA],
          estimatedTime: 150,
        });
        expect(actualTargetProfile).to.deepEqualInstance(expectedTargetProfile);
      });

      it('should return target profile according to selected locale', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ id: 66 });
        const targetProfileDB = databaseBuilder.factory.buildTargetProfile({
          id: 1,
          name: 'Mon Super Profil Cible qui déchire',
          outdated: false,
          createdAt: new Date('2020-01-01'),
          imageUrl: 'some/image/url',
          description: 'cool stuff',
          comment: 'i like it',
          category: 'SOME_CATEGORY',
          isSimplifiedAccess: true,
          areKnowledgeElementsResettable: false,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfileDB.id,
          tubeId: 'recTube1',
          level: 4,
        });
        await databaseBuilder.commit();
        const learningContent = {
          areas: [
            {
              id: 'recAreaA',
              title_i18n: {
                fr: 'titleFRA',
                en: 'titleENA',
              },
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              name_i18n: {
                fr: 'nameFRA',
                en: 'nameENA',
              },
              index: '1',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemA', 'recThemB'],
            },
          ],
          thematics: [
            {
              id: 'recThemA',
              name_i18n: {
                fr: 'nameFRA',
                en: 'nameENA',
              },
              index: '1',
              competenceId: 'recCompA',
              tubeIds: ['recTube1'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              competenceId: 'recCompA',
              thematicId: 'recThemA',
              name: 'tubeName1',
              practicalTitle_i18n: {
                fr: 'practicalTitleFR1',
                en: 'practicalTitleEN1',
              },
              isMobileCompliant: false,
              isTabletCompliant: true,
              skillIds: ['recSkillTube1'],
            },
          ],
          skills: [
            {
              id: 'recSkillTube1',
              tubeId: 'recTube1',
              status: 'actif',
              level: 1,
            },
          ],
        };
        await mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileAdministrationRepository.get({ id: 1, locale: 'en' });

        // then
        const skill1_tube1_themA_compA_areaA = {
          id: 'recSkillTube1',
          difficulty: 1,
          tubeId: 'recTube1',
        };
        const tube1_themA_compA_areaA = {
          id: 'recTube1',
          name: 'tubeName1',
          practicalTitle: 'practicalTitleEN1',
          level: 4,
          isMobileCompliant: false,
          isTabletCompliant: true,
          thematicId: 'recThemA',
        };
        const themA_compA_areaA = {
          id: 'recThemA',
          name: 'nameENA',
          index: 1,
          competenceId: 'recCompA',
        };
        const compA_areaA = {
          id: 'recCompA',
          name: 'nameENA',
          index: '1',
          areaId: 'recAreaA',
        };
        const areaA = {
          id: 'recAreaA',
          title: 'titleENA',
          code: 'codeA',
          color: 'colorA',
          frameworkId: 'fmk1',
        };
        const expectedStageCollection = domainBuilder.buildStageCollectionForTargetProfileManagement({
          id: targetProfileDB.id,
          maxLevel: 4,
          stages: [],
        });
        const expectedTargetProfile = new TargetProfileForAdmin({
          id: targetProfileDB.id,
          name: targetProfileDB.name,
          internalName: targetProfileDB.internalName,
          createdAt: targetProfileDB.createdAt,
          outdated: targetProfileDB.outdated,
          description: targetProfileDB.description,
          comment: targetProfileDB.comment,
          imageUrl: targetProfileDB.imageUrl,
          category: targetProfileDB.category,
          isSimplifiedAccess: targetProfileDB.isSimplifiedAccess,
          areKnowledgeElementsResettable: targetProfileDB.areKnowledgeElementsResettable,
          hasLinkedCampaign: false,
          hasLinkedAutonomousCourse: false,
          areas: [areaA],
          competences: [compA_areaA],
          thematics: [themA_compA_areaA],
          tubes: [tube1_themA_compA_areaA],
          skills: [skill1_tube1_themA_compA_areaA],
          badges: [],
          stageCollection: expectedStageCollection,
        });
        expect(actualTargetProfile).to.deepEqualInstance(expectedTargetProfile);
      });

      context('when datamart is not available', function () {
        it('should return target profile with undefined duration', async function () {
          // given
          sinon.stub(datamartKnex, 'select').rejects(new Error('Datamart is down'));
          databaseBuilder.factory.buildOrganization({ id: 66 });
          const targetProfileDB = databaseBuilder.factory.buildTargetProfile();

          databaseBuilder.factory.buildTargetProfileTube({
            targetProfileId: targetProfileDB.id,
            tubeId: 'recTube1',
            level: 4,
          });
          await databaseBuilder.commit();

          const learningContent = {
            areas: [
              {
                id: 'recAreaA',
                title_i18n: {
                  fr: 'titleFRA',
                },
                color: 'colorA',
                code: 'codeA',
                frameworkId: 'fmk1',
                competenceIds: ['recCompA'],
              },
            ],
            competences: [
              {
                id: 'recCompA',
                name_i18n: {
                  fr: 'nameFRA',
                },
                index: '1',
                areaId: 'recAreaA',
                origin: 'Pix',
                thematicIds: ['recThemA'],
              },
            ],
            thematics: [
              {
                id: 'recThemA',
                name_i18n: {
                  fr: 'nameFRA',
                },
                index: '1',
                competenceId: 'recCompA',
                tubeIds: ['recTube1'],
              },
            ],
            tubes: [
              {
                id: 'recTube1',
                competenceId: 'recCompA',
                thematicId: 'recThemA',
                name: 'tubeName1',
                practicalTitle_i18n: {
                  fr: 'practicalTitleFR1',
                },
                isMobileCompliant: false,
                isTabletCompliant: true,
                skillIds: ['recSkillTube1'],
              },
            ],
            skills: [
              {
                id: 'recSkillTube1',
                tubeId: 'recTube1',
                status: 'actif',
                level: 1,
              },
            ],
          };
          await mockLearningContent(learningContent);

          // when
          const actualTargetProfile = await targetProfileAdministrationRepository.get({ id: targetProfileDB.id });

          // then
          expect(actualTargetProfile.id).to.equal(targetProfileDB.id);
          expect(actualTargetProfile.estimatedTime).to.be.null;
        });
      });
    });

    context('when target profile has a linked campaign', function () {
      it('should return target profile with hasLinkedCampaign at true', async function () {
        // given
        const { id } = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildCampaign({ targetProfileId: id });
        await databaseBuilder.commit();

        const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
        const learningContentObjects = learningContentBuilder([learningContent]);
        await mockLearningContent(learningContentObjects);

        // when
        const actualTargetProfile = await targetProfileAdministrationRepository.get({ id });

        // then
        expect(actualTargetProfile.hasLinkedCampaign).to.be.true;
      });
    });

    context('when target profile has a linked autonomous course', function () {
      context('when target profile owner organisation is autonomous course specific organization', function () {
        it('should return target profile with hasLinkedAutonomousCourse at true', async function () {
          // given
          sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const learningContentObjects = learningContentBuilder([learningContent]);
          await mockLearningContent(learningContentObjects);

          const { id: organizationId } = databaseBuilder.factory.buildOrganization({
            id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
          });

          const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
            isSimplifiedAccess: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({
            organizationId,
            targetProfileId,
          });
          databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId });

          await databaseBuilder.commit();

          // when
          const actualTargetProfile = await targetProfileAdministrationRepository.get({ id: targetProfileId });

          // then
          expect(actualTargetProfile.hasLinkedAutonomousCourse).to.be.true;
        });
      });

      context('when target profile is shared with autonomous course specific organization', function () {
        it('should return target profile with hasLinkedAutonomousCourse at true', async function () {
          // given
          sinon.stub(constants, 'AUTONOMOUS_COURSES_ORGANIZATION_ID').value(777);

          const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
          const learningContentObjects = learningContentBuilder([learningContent]);
          await mockLearningContent(learningContentObjects);

          const { id: organizationId } = databaseBuilder.factory.buildOrganization({ id: 9999 });

          const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile({
            isSimplifiedAccess: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({
            organizationId,
            targetProfileId,
          });
          const { id: autonomousCourseOrganizationId } = databaseBuilder.factory.buildOrganization({
            id: constants.AUTONOMOUS_COURSES_ORGANIZATION_ID,
          });

          databaseBuilder.factory.buildTargetProfileShare({
            organizationId: autonomousCourseOrganizationId,
            targetProfileId,
          });

          databaseBuilder.factory.buildCampaign({ targetProfileId, organizationId: autonomousCourseOrganizationId });

          await databaseBuilder.commit();

          // when
          const actualTargetProfile = await targetProfileAdministrationRepository.get({ id: targetProfileId });

          // then
          expect(actualTargetProfile.hasLinkedAutonomousCourse).to.be.true;
        });
      });
    });
  });

  describe('#update', function () {
    it('should update the target profile name', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = 'Karam';
      targetProfile.internalName = 'Karam';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { name, internalName } = await knex('target-profiles')
        .select('name', 'internalName')
        .where('id', targetProfile.id)
        .first();
      expect(name).to.equal(targetProfile.name);
      expect(internalName).to.equal(targetProfile.internalName);
    });

    it('should update the target profile description', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.description = 'Je change la description';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { description } = await knex('target-profiles').select('description').where('id', targetProfile.id).first();
      expect(description).to.equal(targetProfile.description);
    });

    it('should update the target profile comment', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.comment = 'Je change le commentaire';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { comment } = await knex('target-profiles').select('comment').where('id', targetProfile.id).first();
      expect(comment).to.equal(targetProfile.comment);
    });

    it('should outdate the target profile', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ outdated: true });
      await databaseBuilder.commit();

      // when
      targetProfile.outdate = true;
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { outdated } = await knex('target-profiles').select('outdated').where('id', targetProfile.id).first();
      expect(outdated).to.equal(targetProfile.outdated);
    });

    it('should update and return the target profile "isSimplifiedAccess" attribute', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      // when
      targetProfile.isSimplifiedAccess = true;
      const result = await targetProfileAdministrationRepository.update(targetProfile);

      // then
      expect(result).to.be.instanceOf(TargetProfile);
      expect(result.isSimplifiedAccess).to.equal(true);
    });

    it('should not update the target profile and throw an error while id not existing', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.id = 999999;
      targetProfile.name = 'Karam';
      const error = await catchErr(targetProfileAdministrationRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should not update the target profile name for an database error', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = null;
      const error = await catchErr(targetProfileAdministrationRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

  describe('#create', function () {
    it('should return the id and create the target profile in database', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        imageUrl: 'mon-image/stylée',
        areKnowledgeElementsResettable: true,
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async () => {
        return targetProfileAdministrationRepository.create({
          targetProfileForCreation,
        });
      });

      // then
      const targetProfileInDB = await knex('target-profiles')
        .select(['name', 'category', 'description', 'comment', 'imageUrl', 'areKnowledgeElementsResettable'])
        .where({ id: targetProfileId })
        .first();
      expect(targetProfileInDB).to.deep.equal({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        imageUrl: 'mon-image/stylée',
        areKnowledgeElementsResettable: true,
      });
    });

    it('should create the target profile tubes in database', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        tubes: [
          { id: 'recTube2', level: 5 },
          { id: 'recTube1', level: 8 },
        ],
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async () => {
        return targetProfileAdministrationRepository.create({
          targetProfileForCreation,
        });
      });

      // then
      const targetProfileTubesInDB = await knex('target-profile_tubes')
        .select(['targetProfileId', 'tubeId', 'level'])
        .where({ targetProfileId })
        .orderBy('tubeId', 'ASC');

      expect(targetProfileTubesInDB).to.deep.equal([
        { targetProfileId, tubeId: 'recTube1', level: 8 },
        { targetProfileId, tubeId: 'recTube2', level: 5 },
      ]);
    });

    it('should be transactional through DomainTransaction and do nothing if an error occurs', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        tubes: [{ id: 'recTube2', level: 5 }],
      });

      // when
      try {
        await DomainTransaction.execute(async () => {
          await targetProfileAdministrationRepository.create({
            targetProfileForCreation,
          });
          throw new Error();
        });
        // eslint-disable-next-line no-empty
      } catch {}

      // then
      const targetProfilesInDB = await knex('target-profiles').select('id');
      const targetProfileTubesInDB = await knex('target-profile_tubes').select('id');
      expect(targetProfilesInDB).to.deepEqualArray([]);
      expect(targetProfileTubesInDB).to.deepEqualArray([]);
    });
  });

  describe('#getTubesByTargetProfileId', function () {
    it('should return tubes linked to targetProfiles', async function () {
      // given
      const targetProfile1 = databaseBuilder.factory.buildTargetProfile({ id: 1 });
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile({ id: 2 });
      // profile 1
      const targetProfileTube1 = databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile1.id });
      const targetProfileTube2 = databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile1.id });
      // profile 2
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile2.id });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile2.id });
      await databaseBuilder.commit();

      // when
      const tubes = await targetProfileAdministrationRepository.getTubesByTargetProfileId(targetProfile1.id);

      // Then
      expect(tubes).to.have.lengthOf(2);
      expect(tubes[0].tubeId).to.equal(targetProfileTube1.tubeId);
      expect(tubes[1].tubeId).to.equal(targetProfileTube2.tubeId);
    });
  });

  describe('#findByOrganization', function () {
    context('when organization does not exist', function () {
      it('should return an empty array', async function () {
        // given
        databaseBuilder.factory.buildOrganization({ id: 1 });
        databaseBuilder.factory.buildTargetProfile({
          id: 10,
          outdated: false,
        });
        await databaseBuilder.commit();

        // when
        const actualTargetProfileSummaries = await targetProfileAdministrationRepository.findByOrganization({
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
            outdated: false,
          });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileAdministrationRepository.findByOrganization({
            organizationId: 2,
          });

          // then
          expect(actualTargetProfileSummaries).to.deepEqualArray([]);
        });
      });

      context('when organization has some target profiles attached', function () {
        it('should return summaries for attached target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildOrganization({ id: 2 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            internalName: 'A_tp',
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            internalName: 'B_tp',
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            internalName: 'Not_Mine',
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 10, organizationId: 1 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 11, organizationId: 1 });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: 2 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileAdministrationRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 10, internalName: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, internalName: 'A_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });

        it('should ignore outdated target profiles', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 10,
            name: 'B_tp',
            outdated: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 10, organizationId: 1 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileAdministrationRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          expect(actualTargetProfileSummaries).lengthOf(0);
        });

        it('should return summaries within constraints', async function () {
          // given
          databaseBuilder.factory.buildOrganization({ id: 1 });
          databaseBuilder.factory.buildTargetProfile({
            id: 11,
            name: 'B_tp',
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 12,
            name: 'C_tp',
            outdated: false,
          });
          databaseBuilder.factory.buildTargetProfile({
            id: 13,
            name: 'D_tp',
            outdated: true,
          });
          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 11, organizationId: 1 });

          databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: 12, organizationId: 1 });
          await databaseBuilder.commit();

          // when
          const actualTargetProfileSummaries = await targetProfileAdministrationRepository.findByOrganization({
            organizationId: 1,
          });

          // then
          const expectedTargetProfileSummaries = [
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 11, internalName: 'B_tp', outdated: false }),
            domainBuilder.buildTargetProfileSummaryForAdmin({ id: 12, internalName: 'C_tp', outdated: false }),
          ];
          expect(actualTargetProfileSummaries).to.deepEqualArray(expectedTargetProfileSummaries);
        });
      });
    });
  });
});
