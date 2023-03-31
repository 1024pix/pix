const { expect, databaseBuilder, catchErr, mockLearningContent, domainBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const targetProfileForAdminRepository = require('../../../../lib/infrastructure/repositories/target-profile-for-admin-repository');
const TargetProfileForAdminNewFormat = require('../../../../lib/domain/models/TargetProfileForAdminNewFormat');

describe('Integration | Repository | target-profile-for-admin', function () {
  describe('#getAsNewFormat', function () {
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
          "Les sujets [recTube1, recTube3] du profil cible 1 n'existent pas dans le référentiel."
        );
      });
    });

    context('when target profile exists and is valid', function () {
      it('should return a new format target profile', async function () {
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
        const skillSetId1 = databaseBuilder.factory.buildSkillSet({
          name: 'skillSetName#recSkillTube1',
          skillIds: ['recSkillTube1', 'recSkillTube3'],
        }).id;
        const skillSetId2 = databaseBuilder.factory.buildSkillSet({
          name: 'skillSetName#recSkillTube2',
          skillIds: ['recSkillTube2'],
        }).id;
        const badge1Criteria2DTO = databaseBuilder.factory.buildBadgeCriterion.scopeSkillSets({
          badgeId: badge1DTO.id,
          threshold: 50,
          skillSetIds: [skillSetId1, skillSetId2],
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
            },
          ],
          skills: [
            {
              id: 'recSkillTube1',
              tubeId: 'recTube1',
              status: 'actif',
            },
            {
              id: 'recSkillTube2',
              tubeId: 'recTube2',
              status: 'actif',
            },
            {
              id: 'recSkillTube3',
              tubeId: 'recTube3',
              status: 'actif',
            },
            {
              id: 'recSkillTube4',
              tubeId: 'recTube4',
              status: 'actif',
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.get({ id: 1 });

        // then
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
        const criteria1Badge1 =
          domainBuilder.buildBadgeDetails.buildBadgeCriterion_CampaignParticipation(badge1Criteria1DTO);
        const criteria2Badge1 = domainBuilder.buildBadgeDetails.buildBadgeCriterion_SkillSets({
          ...badge1Criteria2DTO,
          arrayOfSkillIds: [['recSkillTube1', 'recSkillTube3'], ['recSkillTube2']],
        });
        const expectedBadge1 = domainBuilder.buildBadgeDetails({
          ...badge1DTO,
          criteria: [criteria1Badge1, criteria2Badge1],
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
        const expectedTargetProfile = new TargetProfileForAdminNewFormat({
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
          badges: [expectedBadge1, expectedBadge2],
          areas: [areaA],
          competences: [compA_areaA, compB_areaA],
          thematics: [themA_compA_areaA, themB_compA_areaA, themC_compB_areaA],
          tubes: [tube1_themA_compA_areaA, tube2_themB_compA_areaA, tube3_themC_compB_areaA],
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
            },
          ],
          skills: [
            {
              id: 'recSkillTube1',
              tubeId: 'recTube1',
              status: 'actif',
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.get({ id: 1, locale: 'en' });

        // then
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
        const expectedTargetProfile = new TargetProfileForAdminNewFormat({
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
          areas: [areaA],
          competences: [compA_areaA],
          thematics: [themA_compA_areaA],
          tubes: [tube1_themA_compA_areaA],
          badges: [],
        });
        expect(actualTargetProfile).to.deepEqualInstance(expectedTargetProfile);
      });
    });
  });
});
