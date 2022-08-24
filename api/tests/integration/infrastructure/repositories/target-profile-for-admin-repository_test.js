const { expect, databaseBuilder, catchErr, mockLearningContent } = require('../../../test-helper');
const { NotFoundError, TargetProfileInvalidError } = require('../../../../lib/domain/errors');
const targetProfileForAdminRepository = require('../../../../lib/infrastructure/repositories/target-profile-for-admin-repository');
const TargetProfileForAdminOldFormat = require('../../../../lib/domain/models/TargetProfileForAdminOldFormat');
const TargetProfileForAdminNewFormat = require('../../../../lib/domain/models/TargetProfileForAdminNewFormat');

describe('Integration | Repository | target-profile-for-admin', function () {
  describe('#isNewFormat', function () {
    context('when target profile does not exist', function () {
      it('should return false', async function () {
        // when
        const isNewFormat = await targetProfileForAdminRepository.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.false;
      });
    });
    context('when target profile is old format', function () {
      it('should return false', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: 1 });
        await databaseBuilder.commit();

        // when
        const isNewFormat = await targetProfileForAdminRepository.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.false;
      });
    });
    context('when target profile is new format', function () {
      it('should return true', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: 1 });
        await databaseBuilder.commit();

        // when
        const isNewFormat = await targetProfileForAdminRepository.isNewFormat(1);

        // then
        expect(isNewFormat).to.be.true;
      });
    });
  });

  describe('#getAsOldFormat', function () {
    context('when target profile does not exist', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(targetProfileForAdminRepository.getAsOldFormat)({ id: 123 });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal("Le profil cible n'existe pas");
      });
    });

    context('when target profile has no skills', function () {
      it('should throw a TargetProfileInvalidError error', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        await databaseBuilder.commit();

        // when
        const err = await catchErr(targetProfileForAdminRepository.getAsOldFormat)({ id: 1 });

        // then
        expect(err).to.be.instanceOf(TargetProfileInvalidError);
      });
    });

    context('when target profile exists and is valid', function () {
      it('should return an old format target profile', async function () {
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
        databaseBuilder.factory.buildTargetProfileSkill({
          targetProfileId: targetProfileDB.id,
          skillId: 'recArea1_Competence1_Tube1_Skill2',
        });
        databaseBuilder.factory.buildTargetProfileSkill({
          targetProfileId: targetProfileDB.id,
          skillId: 'recArea1_Competence2_Tube1_Skill1',
        });
        await databaseBuilder.commit();
        const learningContent = {
          areas: [
            {
              id: 'recArea1',
              titleFrFr: 'area1_Title',
              color: 'area1_color',
              code: 'area1_code',
              frameworkId: 'fmk1',
              competenceIds: ['recArea1_Competence1', 'recArea1_Competence2'],
            },
          ],
          competences: [
            {
              id: 'recArea1_Competence1',
              nameFrFr: 'competence1_1_name',
              index: 'competence1_1_index',
              areaId: 'recArea1',
              skillIds: ['recArea1_Competence1_Tube1_Skill2'],
              origin: 'Pix',
            },
            {
              id: 'recArea1_Competence2',
              nameFrFr: 'competence1_2_name',
              index: 'competence1_2_index',
              areaId: 'recArea1',
              skillIds: ['recArea1_Competence2_Tube1_Skill1'],
              origin: 'Pix',
            },
          ],
          tubes: [
            {
              id: 'recArea1_Competence1_Tube1',
              competenceId: 'recArea1_Competence1',
              practicalTitleFrFr: 'tube1_1_1_practicalTitle',
              practicalDescriptionFrFr: 'tube1_1_1_practicalDescription',
            },
            {
              id: 'recArea1_Competence2_Tube1',
              competenceId: 'recArea1_Competence2',
              practicalTitleFrFr: 'tube1_2_1_practicalTitle',
              practicalDescriptionFrFr: 'tube1_2_1_practicalDescriptionFrFr',
            },
          ],
          skills: [
            {
              id: 'recArea1_Competence1_Tube1_Skill2',
              name: 'skill1_1_1_2_name4',
              status: 'actif',
              tubeId: 'recArea1_Competence1_Tube1',
              competenceId: 'recArea1_Competence1',
              tutorialIds: [],
              level: 4,
            },
            {
              id: 'recArea1_Competence2_Tube1_Skill1',
              name: 'skill1_2_1_1_name3',
              status: 'actif',
              tubeId: 'recArea1_Competence2_Tube1',
              competenceId: 'recArea1_Competence2',
              tutorialIds: [],
              level: 3,
            },
          ],
          thematics: [],
          challenges: [],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.getAsOldFormat({ id: 1 });

        // then
        const skill1_1_1_2 = {
          id: 'recArea1_Competence1_Tube1_Skill2',
          name: 'skill1_1_1_2_name4',
          difficulty: 4,
          tubeId: 'recArea1_Competence1_Tube1',
        };
        const skill1_2_1_1 = {
          id: 'recArea1_Competence2_Tube1_Skill1',
          name: 'skill1_2_1_1_name3',
          difficulty: 3,
          tubeId: 'recArea1_Competence2_Tube1',
        };
        const tube1_1_1 = {
          id: 'recArea1_Competence1_Tube1',
          practicalTitle: 'tube1_1_1_practicalTitle',
          competenceId: 'recArea1_Competence1',
        };
        const tube1_2_1 = {
          id: 'recArea1_Competence2_Tube1',
          practicalTitle: 'tube1_2_1_practicalTitle',
          competenceId: 'recArea1_Competence2',
        };
        const competence1_1 = {
          id: 'recArea1_Competence1',
          name: 'competence1_1_name',
          index: 'competence1_1_index',
          areaId: 'recArea1',
        };
        const competence1_2 = {
          id: 'recArea1_Competence2',
          name: 'competence1_2_name',
          index: 'competence1_2_index',
          areaId: 'recArea1',
        };
        const area1 = { id: 'recArea1', title: 'area1_Title', code: 'area1_code', color: 'area1_color' };
        const expectedTargetProfile = new TargetProfileForAdminOldFormat({
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
          skills: [skill1_1_1_2, skill1_2_1_1],
          tubes: [tube1_1_1, tube1_2_1],
          competences: [competence1_1, competence1_2],
          areas: [area1],
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
        databaseBuilder.factory.buildTargetProfileSkill({
          targetProfileId: targetProfileDB.id,
          skillId: 'recSkill1',
        });
        await databaseBuilder.commit();
        const learningContent = {
          areas: [
            {
              id: 'recArea1',
              titleFrFr: 'titleFR',
              titleEnUs: 'titleEN',
              color: 'area1_color',
              code: 'area1_code',
              frameworkId: 'fmk1',
              competenceIds: ['recCompetence1'],
            },
          ],
          competences: [
            {
              id: 'recCompetence1',
              nameFrFr: 'nameFR',
              nameEnUs: 'nameEN',
              index: 'competence1_index',
              areaId: 'recArea1',
              skillIds: ['recSkill1'],
              origin: 'Pix',
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              competenceId: 'recCompetence1',
              practicalTitleFrFr: 'practicalTitleFR',
              practicalTitleEnUs: 'practicalTitleEN',
              practicalDescriptionFrFr: 'tube_desc',
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              name: 'skill1',
              status: 'archivé',
              tubeId: 'recTube1',
              competenceId: 'recCompetence1',
              tutorialIds: [],
              level: 1,
            },
          ],
          thematics: [],
          challenges: [],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.getAsOldFormat({ id: 1, locale: 'en' });

        // then
        const skill1 = { id: 'recSkill1', name: 'skill1', difficulty: 1, tubeId: 'recTube1' };
        const tube1 = { id: 'recTube1', practicalTitle: 'practicalTitleEN', competenceId: 'recCompetence1' };
        const competence1 = { id: 'recCompetence1', name: 'nameEN', index: 'competence1_index', areaId: 'recArea1' };
        const area1 = { id: 'recArea1', title: 'titleEN', code: 'area1_code', color: 'area1_color' };
        const expectedTargetProfile = new TargetProfileForAdminOldFormat({
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
          skills: [skill1],
          tubes: [tube1],
          competences: [competence1],
          areas: [area1],
        });
        expect(actualTargetProfile).to.deepEqualInstance(expectedTargetProfile);
      });
    });
  });

  describe('#getAsNewFormat', function () {
    context('when target profile does not exist', function () {
      it('should throw a NotFound error', async function () {
        // when
        const err = await catchErr(targetProfileForAdminRepository.getAsNewFormat)({ id: 123 });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err.message).to.deep.equal("Le profil cible n'existe pas");
      });
    });

    context('when target profile has no tubes', function () {
      it('should throw a TargetProfileInvalidError error', async function () {
        // given
        databaseBuilder.factory.buildTargetProfile({ id: 1 });
        await databaseBuilder.commit();

        // when
        const err = await catchErr(targetProfileForAdminRepository.getAsNewFormat)({ id: 1 });

        // then
        expect(err).to.be.instanceOf(TargetProfileInvalidError);
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
              titleFrFr: 'titleFRA',
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              nameFrFr: 'nameFRA',
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
              practicalTitleFrFr: 'practicalTitleFR2',
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const err = await catchErr(targetProfileForAdminRepository.getAsNewFormat)({ id: 1 });

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
        await databaseBuilder.commit();
        const learningContent = {
          areas: [
            {
              id: 'recAreaA',
              titleFrFr: 'titleFRA',
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              nameFrFr: 'nameFRA',
              index: '1',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemA', 'recThemB'],
            },
            {
              id: 'recCompB',
              nameFrFr: 'nameFRB',
              index: '5',
              areaId: 'recAreaA',
              origin: 'Pix',
              thematicIds: ['recThemC'],
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
            {
              id: 'recThemB',
              name: 'nameFRB',
              index: '2',
              competenceId: 'recCompA',
              tubeIds: ['recTube2'],
            },
            {
              id: 'recThemC',
              name: 'nameFRC',
              index: '1',
              competenceId: 'recCompB',
              tubeIds: ['recTube3'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              competenceId: 'recCompA',
              name: 'tubeName1',
              practicalTitleFrFr: 'practicalTitleFR1',
            },
            {
              id: 'recTube2',
              competenceId: 'recCompA',
              name: 'tubeName2',
              practicalTitleFrFr: 'practicalTitleFR2',
            },
            {
              id: 'recTube3',
              competenceId: 'recCompB',
              name: 'tubeName3',
              practicalTitleFrFr: 'practicalTitleFR3',
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
          ],
          challenges: [
            {
              id: 'recChalATube1',
              responsive: ['Smartphone', 'Tablet'],
              skillId: 'recSkillTube1',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalBTube1',
              responsive: ['Tablet'],
              skillId: 'recSkillTube1',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalATube2',
              responsive: ['Smartphone', 'Tablet'],
              skillId: 'recSkillTube2',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalBTube2',
              responsive: ['Smartphone', 'Tablet'],
              skillId: 'recSkillTube2',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalATube3',
              responsive: ['Smartphone', 'Tablet'],
              skillId: 'recSkillTube3',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalBTube3',
              responsive: [],
              skillId: 'recSkillTube3',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.getAsNewFormat({ id: 1 });

        // then
        const tube1_themA_compA_areaA = {
          id: 'recTube1',
          name: 'tubeName1',
          practicalTitle: 'practicalTitleFR1',
          level: 4,
          mobile: false,
          tablet: true,
          thematicId: 'recThemA',
        };
        const tube2_themB_compA_areaA = {
          id: 'recTube2',
          name: 'tubeName2',
          practicalTitle: 'practicalTitleFR2',
          level: 2,
          mobile: true,
          tablet: true,
          thematicId: 'recThemB',
        };
        const tube3_themC_compB_areaA = {
          id: 'recTube3',
          name: 'tubeName3',
          practicalTitle: 'practicalTitleFR3',
          level: 8,
          mobile: false,
          tablet: false,
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
              titleFrFr: 'titleFRA',
              titleEnUs: 'titleENA',
              color: 'colorA',
              code: 'codeA',
              frameworkId: 'fmk1',
              competenceIds: ['recCompA', 'recCompB'],
            },
          ],
          competences: [
            {
              id: 'recCompA',
              nameFrFr: 'nameFRA',
              nameEnUs: 'nameENA',
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
              nameEnUs: 'nameENA',
              index: '1',
              competenceId: 'recCompA',
              tubeIds: ['recTube1'],
            },
          ],
          tubes: [
            {
              id: 'recTube1',
              competenceId: 'recCompA',
              name: 'tubeName1',
              practicalTitleFrFr: 'practicalTitleFR1',
              practicalTitleEnUs: 'practicalTitleEN1',
            },
          ],
          skills: [
            {
              id: 'recSkillTube1',
              tubeId: 'recTube1',
              status: 'actif',
            },
          ],
          challenges: [
            {
              id: 'recChalATube1',
              responsive: ['Smartphone', 'Tablet'],
              skillId: 'recSkillTube1',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
            {
              id: 'recChalBTube1',
              responsive: ['Tablet'],
              skillId: 'recSkillTube1',
              status: 'validé',
              genealogy: 'Prototype 1',
            },
          ],
        };
        mockLearningContent(learningContent);

        // when
        const actualTargetProfile = await targetProfileForAdminRepository.getAsNewFormat({ id: 1, locale: 'en' });

        // then
        const tube1_themA_compA_areaA = {
          id: 'recTube1',
          name: 'tubeName1',
          practicalTitle: 'practicalTitleEN1',
          level: 4,
          mobile: false,
          tablet: true,
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
        });
        expect(actualTargetProfile).to.deepEqualInstance(expectedTargetProfile);
      });
    });
  });
});
