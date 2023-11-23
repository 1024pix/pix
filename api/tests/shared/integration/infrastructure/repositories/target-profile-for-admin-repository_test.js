import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  mockLearningContent,
  learningContentBuilder,
} from '../../../../test-helper.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import * as targetProfileForAdminRepository from '../../../../../src/shared/infrastructure/repositories/target-profile-for-admin-repository.js';
import { TargetProfileForAdmin } from '../../../../../lib/domain/models/index.js';

describe('Integration | Repository | target-profile-for-admin', function () {
  describe('#get', function () {
    context('when target profile does not exist', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(targetProfileForAdminRepository.get)({ id: 123 });

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
          isPublic: true,
          createdAt: new Date('2020-01-01'),
          ownerOrganizationId: 66,
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
        mockLearningContent(learningContent);

        // when
        const err = await catchErr(targetProfileForAdminRepository.get)({ id: 1 });

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
          id: 1,
          name: 'Mon Super Profil Cible qui déchire',
          outdated: false,
          isPublic: true,
          createdAt: new Date('2020-01-01'),
          ownerOrganizationId: 66,
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
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.get({ id: 1 });

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
          index: '1',
          competenceId: 'recCompA',
        };
        const themB_compA_areaA = {
          id: 'recThemB',
          name: 'nameFRB',
          index: '2',
          competenceId: 'recCompA',
        };
        const themC_compB_areaA = {
          id: 'recThemC',
          name: 'nameFRC',
          index: '1',
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
          createdAt: targetProfileDB.createdAt,
          outdated: targetProfileDB.outdated,
          isPublic: targetProfileDB.isPublic,
          ownerOrganizationId: targetProfileDB.ownerOrganizationId,
          description: targetProfileDB.description,
          comment: targetProfileDB.comment,
          imageUrl: targetProfileDB.imageUrl,
          category: targetProfileDB.category,
          isSimplifiedAccess: targetProfileDB.isSimplifiedAccess,
          areKnowledgeElementsResettable: targetProfileDB.areKnowledgeElementsResettable,
          hasLinkedCampaign: false,
          badges: [expectedBadge1, expectedBadge2],
          stageCollection: expectedStageCollection,
          areas: [areaA],
          competences: [compA_areaA, compB_areaA],
          thematics: [themA_compA_areaA, themB_compA_areaA, themC_compB_areaA],
          tubes: [tube1_themA_compA_areaA, tube2_themB_compA_areaA, tube3_themC_compB_areaA],
          skills: [skill1_tube1_themA_compA_areaA, skill2_tube2_themB_compA_areaA],
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
          isPublic: true,
          createdAt: new Date('2020-01-01'),
          ownerOrganizationId: 66,
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
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.get({ id: 1, locale: 'en' });

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
          index: '1',
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
          createdAt: targetProfileDB.createdAt,
          outdated: targetProfileDB.outdated,
          isPublic: targetProfileDB.isPublic,
          ownerOrganizationId: targetProfileDB.ownerOrganizationId,
          description: targetProfileDB.description,
          comment: targetProfileDB.comment,
          imageUrl: targetProfileDB.imageUrl,
          category: targetProfileDB.category,
          isSimplifiedAccess: targetProfileDB.isSimplifiedAccess,
          areKnowledgeElementsResettable: targetProfileDB.areKnowledgeElementsResettable,
          hasLinkedCampaign: false,
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
    });

    context('when target profile has a linked campaign', function () {
      it('should return target profile with hasLinkedCampaign at true', async function () {
        // given
        const { id } = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildCampaign({ targetProfileId: id });
        await databaseBuilder.commit();

        const learningContent = domainBuilder.buildCampaignLearningContent.withSimpleContent();
        const learningContentObjects = learningContentBuilder([learningContent]);
        mockLearningContent(learningContentObjects);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.get({ id });

        // then
        expect(actualTargetProfile.hasLinkedCampaign).to.be.true;
      });
    });
  });
});
