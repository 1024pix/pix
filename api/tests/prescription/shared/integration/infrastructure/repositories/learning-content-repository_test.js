import * as learningContentRepository from '../../../../../../src/prescription/shared/infrastructure/repositories/learning-content-repository.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/constants.js';
import { NoSkillsInCampaignError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | learning-content', function () {
  let framework1Fr, framework1En, framework2Fr, framework2En;
  let area1Fr, area1En, area2Fr, area2En;
  let competence1Fr, competence1En, competence2Fr, competence2En, competence3Fr, competence3En;
  let thematic1Fr, thematic1En, thematic2Fr, thematic2En, thematic3Fr, thematic3En;
  let tube1Fr, tube1En, tube2Fr, tube2En, tube4Fr, tube4En;
  let skill1Fr, skill2Fr, skill3Fr, skill4Fr;

  beforeEach(async function () {
    const framework1DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework1',
      name: PIX_ORIGIN,
    });
    const framework2DB = databaseBuilder.factory.learningContent.buildFramework({
      id: 'recFramework2',
      name: 'Pix+',
    });
    const area1DB = databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea1',
      name: 'area1_name',
      title_i18n: { fr: 'domaine1_TitreFr', en: 'area1_TitleEn' },
      color: 'area1_color',
      code: 'area1_code',
      frameworkId: 'recFramework1',
      competenceIds: ['recCompetence1', 'recCompetence2'],
    });
    const area2DB = databaseBuilder.factory.learningContent.buildArea({
      id: 'recArea2',
      name: 'area2_name',
      title_i18n: { fr: 'domaine2_TitreFr', en: 'area2_TitleEn' },
      color: 'area2_color',
      code: 'area2_code',
      frameworkId: 'recFramework2',
      competenceIds: ['recCompetence3'],
    });
    const competence1DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence1',
      name_i18n: { fr: 'competence1_nomFr', en: 'competence1_nameEn' },
      index: '1',
      description_i18n: { fr: 'competence1_descriptionFr', en: 'competence1_descriptionEn' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    const competence2DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence2',
      name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
      index: '2',
      description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
      origin: PIX_ORIGIN,
      areaId: 'recArea1',
    });
    const competence3DB = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'recCompetence3',
      name_i18n: { fr: 'competence3_nomFr', en: 'competence3_nameEn' },
      index: '1',
      description_i18n: { fr: 'competence3_descriptionFr', en: 'competence3_descriptionEn' },
      origin: 'Pix+',
      areaId: 'recArea2',
    });
    const thematic1DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic1',
      name_i18n: {
        fr: 'thematique1_nomFr',
        en: 'thematic1_nameEn',
      },
      index: 10,
      competenceId: 'recCompetence1',
      tubeIds: ['recTube1'],
    });
    const thematic2DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic2',
      name_i18n: {
        fr: 'thematique2_nomFr',
        en: 'thematic2_nameEn',
      },
      index: 20,
      competenceId: 'recCompetence2',
      tubeIds: ['recTube2', 'recTube3'],
    });
    const thematic3DB = databaseBuilder.factory.learningContent.buildThematic({
      id: 'recThematic3',
      name_i18n: {
        fr: 'thematique3_nomFr',
        en: 'thematic3_nameEn',
      },
      index: 30,
      competenceId: 'recCompetence3',
      tubeIds: ['recTube4'],
    });
    const tube1DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube1',
      name: '@tube1_name',
      title: 'tube1_title',
      description: 'tube1_description',
      practicalTitle_i18n: {
        fr: 'tube1_practicalTitleFr',
        en: 'tube1_practicalTitleEn',
      },
      practicalDescription_i18n: {
        fr: 'tube1_practicalDescriptionFr',
        en: 'tube1_practicalDescriptionEn',
      },
      isMobileCompliant: true,
      isTabletCompliant: false,
      competenceId: 'recCompetence1',
      thematicId: 'recThematic1',
      skillIds: ['recSkill1'],
    });
    const tube2DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube2',
      name: '@tube2_name',
      title: '@tube2_title',
      description: '@tube2_description',
      practicalTitle_i18n: {
        fr: 'tube2_practicalTitleFr',
        en: 'tube2_practicalTitleEn',
      },
      practicalDescription_i18n: {
        fr: 'tube2_practicalDescriptionFr',
        en: 'tube2_practicalDescriptionEn',
      },
      isMobileCompliant: false,
      isTabletCompliant: true,
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
      skillIds: ['recSkill2', 'recSkill3'],
    });
    const tube3DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube3',
      name: '@tube3_name',
      title: '@tube3_title',
      description: '@tube3_description',
      practicalTitle_i18n: { fr: 'tube3_practicalTitleFr', en: 'tube3_practicalTitleEn' },
      practicalDescription_i18n: {
        fr: 'tube3_practicalDescriptionFr',
        en: 'tube3_practicalDescriptionEn',
      },
      isMobileCompliant: true,
      isTabletCompliant: true,
      competenceId: 'recCompetence2',
      thematicId: 'recThematic2',
    });
    const tube4DB = databaseBuilder.factory.learningContent.buildTube({
      id: 'recTube4',
      name: '@tube4_name',
      title: 'tube4_title',
      description: 'tube4_description',
      practicalTitle_i18n: {
        fr: 'tube4_practicalTitleFr',
        en: 'tube4_practicalTitleEn',
      },
      practicalDescription_i18n: {
        fr: 'tube4_practicalDescriptionFr',
        en: 'tube4_practicalDescriptionEn',
      },
      isMobileCompliant: false,
      isTabletCompliant: false,
      competenceId: 'recCompetence3',
      thematicId: 'recThematic3',
      skillIds: ['recSkill4'],
    });

    databaseBuilder.factory.learningContent.buildTube({
      id: 'recTubeNotitle',
      name: '@recTubeNotitle_name',
      title: 'recTubeNotitle_title',
      description: 'recTubeNotitle_description',
      practicalTitle_i18n: { fr: null, en: null },
      practicalDescription_i18n: {
        fr: null,
        en: null,
      },
      isMobileCompliant: false,
      isTabletCompliant: false,
      competenceId: 'recCompetence3',
      thematicId: 'recThematic3',
    });

    const skill1DB = databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill1',
      name: 'tube1_name1',
      status: 'actif',
      level: 2,
      pixValue: 16,
      version: 14,
      tubeId: 'recTube1',
    });

    const skill2DB = databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill2',
      name: '@tube2_name1',
      status: 'actif',
      level: 1,
      pixValue: 34,
      version: 76,
      tubeId: 'recTube2',
    });
    const skill3DB = databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill3',
      name: '@tube2_name2',
      status: 'archivé',
      level: 2,
      pixValue: 56,
      version: 54,
      tubeId: 'recTube2',
    });

    const skill4DB = databaseBuilder.factory.learningContent.buildSkill({
      id: 'recSkill4',
      name: 'tube4_name1',
      status: 'actif',
      level: 2,
      pixValue: 56,
      version: 54,
      tubeId: 'recTube4',
    });

    await databaseBuilder.commit();

    [framework1Fr, framework2Fr] = _buildDomainFrameworksFromDB([framework1DB, framework2DB]);
    [framework1En, framework2En] = _buildDomainFrameworksFromDB([framework1DB, framework2DB]);
    [area1Fr, area2Fr] = _buildDomainAreasFromDB([area1DB, area2DB], 'fr');
    [area1En, area2En] = _buildDomainAreasFromDB([area1DB, area2DB], 'en');
    [competence1Fr, competence2Fr, competence3Fr] = _buildDomainCompetencesFromDB(
      [competence1DB, competence2DB, competence3DB],
      'fr',
    );
    [competence1En, competence2En, competence3En] = _buildDomainCompetencesFromDB(
      [competence1DB, competence2DB, competence3DB],
      'en',
    );
    [thematic1Fr, thematic2Fr, thematic3Fr] = _buildDomainThematicsFromDB(
      [thematic1DB, thematic2DB, thematic3DB],
      'fr',
    );
    [thematic1En, thematic2En, thematic3En] = _buildDomainThematicsFromDB(
      [thematic1DB, thematic2DB, thematic3DB],
      'en',
    );
    [tube1Fr, tube2Fr, , tube4Fr] = _buildDomainTubesFromDB([tube1DB, tube2DB, tube3DB, tube4DB], 'fr');
    [tube1En, tube2En, , tube4En] = _buildDomainTubesFromDB([tube1DB, tube2DB, tube3DB, tube4DB], 'en');
    [skill1Fr, skill2Fr, skill3Fr, skill4Fr] = _buildDomainSkillsFromDB([skill1DB, skill2DB, skill3DB, skill4DB], 'fr');
  });

  describe('#findBySkillIds', function () {
    it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
      // given
      framework1Fr.areas = [area1Fr];
      area1Fr.competences = [competence2Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube2Fr.skills = [skill2Fr, skill3Fr];

      // when
      const learningContent = await learningContentRepository.findBySkillIds(['recSkill2', 'recSkill3']);

      // then
      expect(learningContent.areas).to.deep.equal([area1Fr]);
      expect(learningContent.frameworks).to.deep.equal([framework1Fr]);
    });

    it('should translate names and descriptions when specifying a locale', async function () {
      // given
      framework1En.areas = [area1En];
      area1En.competences = [competence2En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      thematic2En.tubes = [tube2En];
      tube2En.skills = [skill2Fr, skill3Fr];

      // when
      const learningContent = await learningContentRepository.findBySkillIds(['recSkill2', 'recSkill3'], 'en');

      // then
      expect(learningContent.frameworks).to.deep.equal([framework1En]);
    });
  });

  describe('#findByCampaignId', function () {
    let campaignId;

    it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }),
      );
      await databaseBuilder.commit();

      framework1Fr.areas = [area1Fr];
      area1Fr.competences = [competence2Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube2Fr.skills = [skill2Fr, skill3Fr];

      // when
      const learningContentFromCampaign = await learningContentRepository.findByCampaignId(campaignId);

      // then
      expect(learningContentFromCampaign.areas).to.deep.equal([area1Fr]);
      expect(learningContentFromCampaign.frameworks).to.deep.equal([framework1Fr]);
    });

    it('should translate names and descriptions when specifying a locale', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId }),
      );
      await databaseBuilder.commit();

      framework1En.areas = [area1En];
      area1En.competences = [competence2En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      thematic2En.tubes = [tube2En];
      tube2En.skills = [skill2Fr, skill3Fr];

      // when
      const learningContentFromCampaign = await learningContentRepository.findByCampaignId(campaignId, 'en');

      // then
      expect(learningContentFromCampaign.frameworks).to.deep.equal([framework1En]);
    });

    it('should throw a NoSkillsInCampaignError when there are no more operative skills', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillUnknown' });
      await databaseBuilder.commit();

      // when
      const err = await catchErr(learningContentRepository.findByCampaignId)(campaignId);

      // then
      expect(err).to.be.instanceOf(NoSkillsInCampaignError);
    });
  });

  describe('#findByCampaignParticipationId', function () {
    let campaignParticipation;

    beforeEach(async function () {
      campaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaignParticipation.campaignId, skillId }),
      );
      await databaseBuilder.commit();

      framework1Fr.areas = [area1Fr];
      area1Fr.competences = [competence2Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube2Fr.skills = [skill2Fr, skill3Fr];

      framework1En.areas = [area1En];
      area1En.competences = [competence2En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      thematic2En.tubes = [tube2En];
      tube2En.skills = [skill2Fr, skill3Fr];
    });

    it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
      // when
      const learningContentFromCampaign = await learningContentRepository.findByCampaignParticipationId(
        campaignParticipation.id,
      );
      expect(learningContentFromCampaign.areas).to.deep.equal([area1Fr]);
      expect(learningContentFromCampaign.frameworks).to.deep.equal([framework1Fr]);
    });

    it('should translate names and descriptions when specifying a locale', async function () {
      // when
      const learningContentFromCampaign = await learningContentRepository.findByCampaignParticipationId(
        campaignParticipation.id,
        'en',
      );

      // then
      expect(learningContentFromCampaign.frameworks).to.deep.equal([framework1En]);
    });

    it('should throw a NoSkillsInCampaignError when there are no more operative skills', async function () {
      // given
      const otherCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation();
      databaseBuilder.factory.buildCampaignSkill({
        campaignId: otherCampaignParticipation.campaignId,
        skillId: 'recSkillUnknown',
      });
      await databaseBuilder.commit();

      // when
      const err = await catchErr(learningContentRepository.findByCampaignParticipationId)(
        otherCampaignParticipation.id,
      );
      // then
      expect(err).to.be.instanceOf(NoSkillsInCampaignError);
    });
  });

  describe('#findByTargetProfileId', function () {
    context('when target profile does not have capped tubes', function () {
      it('should throw a NotFound error', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const anotherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: anotherTargetProfileId });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(learningContentRepository.findByTargetProfileId)(targetProfileId);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal("Le profil cible n'existe pas");
      });
    });

    context('when target profile has capped tubes', function () {
      it('should return frameworks, areas, competences, thematics and tubes of the active skills hierarchy with default FR language', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 2 });
        await databaseBuilder.commit();

        framework1Fr.areas = [area1Fr];
        area1Fr.competences = [competence2Fr];
        competence2Fr.thematics = [thematic2Fr];
        competence2Fr.tubes = [tube2Fr];
        thematic2Fr.tubes = [tube2Fr];
        tube2Fr.skills = [skill2Fr];

        // when
        const targetProfileLearningContent = await learningContentRepository.findByTargetProfileId(targetProfileId);

        // then
        expect(targetProfileLearningContent.frameworks).to.deep.equal([framework1Fr]);
      });

      context('when using a specific locale', function () {
        it('should translate names and descriptions', async function () {
          // given
          const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
          databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 2 });
          await databaseBuilder.commit();

          framework1En.areas = [area1En];
          area1En.competences = [competence2En];
          competence2En.thematics = [thematic2En];
          competence2En.tubes = [tube2En];
          thematic2En.tubes = [tube2En];
          tube2En.skills = [skill2Fr];

          // when
          const targetProfileLearningContent = await learningContentRepository.findByTargetProfileId(
            targetProfileId,
            'en',
          );

          // then
          expect(targetProfileLearningContent.frameworks).to.deep.equal([framework1En]);
        });
      });
    });
  });

  describe('#findByOrganizationId', function () {
    let organizationId;
    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;

      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube4', level: 4 });

      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileIdFromOtherOrganization = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({
        organizationId: otherOrganizationId,
        targetProfileId: targetProfileIdFromOtherOrganization,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: targetProfileIdFromOtherOrganization,
        tubeId: 'recTube3',
        level: 2,
      });

      await databaseBuilder.commit();
    });

    it('should return an array of LearningContents with complete Pix frameworks', async function () {
      // given
      framework1Fr.areas = [area1Fr];
      area1Fr.competences = [competence1Fr, competence2Fr];
      competence1Fr.thematics = [thematic1Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence1Fr.tubes = [tube1Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic1Fr.tubes = [tube1Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube1Fr.skills = [skill1Fr];
      tube2Fr.skills = [skill2Fr];

      framework2Fr.areas = [area2Fr];
      area2Fr.competences = [competence3Fr];
      competence3Fr.thematics = [thematic3Fr];
      competence3Fr.tubes = [tube4Fr];
      thematic3Fr.tubes = [tube4Fr];
      tube4Fr.skills = [skill4Fr];

      // when
      const results = await learningContentRepository.findByOrganizationId({ organizationId });

      // then
      expect(results).lengthOf(2);
      expect(results).deep.members([framework1Fr, framework2Fr]);
    });

    context('when organization has no target profile shares', function () {
      it('it should returns Pix frameworks', async function () {
        // when
        const frameworks = await learningContentRepository.findByOrganizationId({ organizationId: 213 });

        // then
        expect(frameworks).lengthOf(1);
      });
    });

    context('when using a specific locale', function () {
      it('should translate names and descriptions', async function () {
        framework1En.areas = [area1En];
        area1En.competences = [competence1En, competence2En];
        competence1En.thematics = [thematic1En];
        competence2En.thematics = [thematic2En];
        competence1En.tubes = [tube1En];
        competence2En.tubes = [tube2En];
        thematic1En.tubes = [tube1En];
        thematic2En.tubes = [tube2En];
        tube1En.skills = [skill1Fr];
        tube2En.skills = [skill2Fr];

        framework2En.areas = [area2En];
        area2En.competences = [competence3En];
        competence3En.thematics = [thematic3En];
        competence3En.tubes = [tube4En];
        thematic3En.tubes = [tube4En];
        tube4En.skills = [skill4Fr];

        // when
        const results = await learningContentRepository.findByOrganizationId({ organizationId, locale: 'en' });

        // then
        expect(results).lengthOf(2);
        expect(results).deep.members([framework1En, framework2En]);
      });
    });
  });
});

function _buildDomainFrameworksFromDB(frameworksDB) {
  return frameworksDB.map((frameworkDB) =>
    domainBuilder.buildFramework({
      id: frameworkDB.id,
      name: frameworkDB.name,
      areas: [],
    }),
  );
}

function _buildDomainAreasFromDB(areasDB, locale) {
  return areasDB.map((areaDB) =>
    domainBuilder.buildArea({
      ...areaDB,
      title: areaDB.title_i18n[locale],
    }),
  );
}

function _buildDomainCompetencesFromDB(competencesDB, locale) {
  return competencesDB.map((competenceDB) =>
    domainBuilder.buildCompetence({
      ...competenceDB,
      name: competenceDB.name_i18n[locale],
      description: competenceDB.description_i18n[locale],
    }),
  );
}

function _buildDomainThematicsFromDB(thematicsDB, locale) {
  return thematicsDB.map((thematicDB) =>
    domainBuilder.buildThematic({
      ...thematicDB,
      name: thematicDB.name_i18n[locale],
    }),
  );
}

function _buildDomainTubesFromDB(tubesDB, locale) {
  return tubesDB.map((tubeDB) =>
    domainBuilder.buildTube({
      ...tubeDB,
      practicalTitle: tubeDB.practicalTitle_i18n[locale],
      practicalDescription: tubeDB.practicalDescription_i18n[locale],
    }),
  );
}

function _buildDomainSkillsFromDB(skillsDB, locale) {
  return skillsDB.map((skillDB) =>
    domainBuilder.buildSkill({ ...skillDB, difficulty: skillDB.level, hint: skillDB.hint_i18n[locale] }),
  );
}
