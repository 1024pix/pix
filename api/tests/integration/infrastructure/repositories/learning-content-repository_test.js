import {
  expect,
  databaseBuilder,
  catchErr,
  mockLearningContent,
  domainBuilder,
  learningContentBuilder,
} from '../../../test-helper.js';

import { NoSkillsInCampaignError, NotFoundError } from '../../../../lib/shared/domain/errors.js';
import * as learningContentRepository from '../../../../lib/shared/infrastructure/repositories/learning-content-repository.js';

describe('Integration | Repository | learning-content', function () {
  let learningContent;
  let framework1Fr, framework1En, framework2Fr, framework2En;
  let area1Fr, area1En, area2Fr, area2En;
  let competence1Fr, competence1En, competence2Fr, competence2En, competence3Fr, competence3En;
  let thematic1Fr, thematic1En, thematic2Fr, thematic2En, thematic3Fr, thematic3En;
  let tube1Fr, tube1En, tube2Fr, tube2En, tube4Fr, tube4En;
  let skill1, skill2, skill3, skill8;

  beforeEach(function () {
    learningContent = learningContentBuilder([
      {
        id: 'recFramework1',
        name: 'Mon référentiel 1',
        areas: [
          {
            id: 'recArea1',
            name: 'area1_name',
            title_i18n: { fr: 'domaine1_TitreFr', en: 'area1_TitleEn' },
            color: 'area1_color',
            code: 'area1_code',
            frameworkId: 'recFramework1',
            competences: [
              {
                id: 'recCompetence1',
                name_i18n: { fr: 'competence1_nomFr', en: 'competence1_nameEn' },
                index: 1,
                description_i18n: { fr: 'competence1_descriptionFr', en: 'competence1_descriptionEn' },
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic1',
                    name_i18n: {
                      fr: 'thematique1_nomFr',
                      en: 'thematic1_nameEn',
                    },
                    index: '10',
                    tubes: [
                      {
                        id: 'recTube1',
                        name: '@tube1_name',
                        title: 'tube1_title',
                        description: 'tube1_description',
                        practicalTitle_i18n: { fr: 'tube1_practicalTitleFr', en: 'tube1_practicalTitleEn' },
                        practicalDescription_i18n: {
                          fr: 'tube1_practicalDescriptionFr',
                          en: 'tube1_practicalDescriptionEn',
                        },
                        isMobileCompliant: true,
                        isTabletCompliant: false,
                        skills: [
                          {
                            id: 'recSkill1',
                            name: '@tube1_name4',
                            status: 'actif',
                            level: 4,
                            pixValue: 12,
                            version: 98,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'recCompetence2',
                name_i18n: { fr: 'competence2_nomFr', en: 'competence2_nameEn' },
                index: 2,
                description_i18n: { fr: 'competence2_descriptionFr', en: 'competence2_descriptionEn' },
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic2',
                    name_i18n: {
                      fr: 'thematique2_nomFr',
                      en: 'thematic2_nameEn',
                    },
                    index: '20',
                    tubes: [
                      {
                        id: 'recTube2',
                        name: '@tube2_name',
                        title: '@tube2_title',
                        description: '@tube2_description',
                        practicalTitle_i18n: { fr: 'tube2_practicalTitleFr', en: 'tube2_practicalTitleEn' },
                        practicalDescription_i18n: {
                          fr: 'tube2_practicalDescriptionFr',
                          en: 'tube2_practicalDescriptionEn',
                        },
                        isMobileCompliant: false,
                        isTabletCompliant: true,
                        skills: [
                          {
                            id: 'recSkill2',
                            name: '@tube2_name1',
                            status: 'actif',
                            level: 1,
                            pixValue: 34,
                            version: 76,
                          },
                          {
                            id: 'recSkill3',
                            name: '@tube2_name2',
                            status: 'archivé',
                            level: 2,
                            pixValue: 56,
                            version: 54,
                          },
                          {
                            id: 'recSkill4',
                            status: 'périmé',
                          },
                        ],
                      },
                      {
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
                        skills: [
                          {
                            id: 'recSkill5',
                            name: '@tube3_name5',
                            status: 'archivé',
                            level: 5,
                            pixValue: 44,
                            version: 55,
                          },
                          {
                            id: 'recSkill6',
                            status: 'périmé',
                          },
                          {
                            id: 'recSkill7',
                            status: 'périmé',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'recFramework2',
        name: 'Mon référentiel 2',
        areas: [
          {
            id: 'recArea2',
            name: 'area2_name',
            title_i18n: { fr: 'domaine2_TitreFr', en: 'area2_TitleEn' },
            color: 'area2_color',
            code: 'area2_code',
            frameworkId: 'recFramework2',
            competences: [
              {
                id: 'recCompetence3',
                name_i18n: { fr: 'competence3_nomFr', en: 'competence3_nameEn' },
                index: 1,
                description_i18n: { fr: 'competence3_descriptionFr', en: 'competence3_descriptionEn' },
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic3',
                    name_i18n: {
                      fr: 'thematique3_nomFr',
                      en: 'thematic3_nameEn',
                    },
                    index: '30',
                    tubes: [
                      {
                        id: 'recTube4',
                        name: '@tube4_name',
                        title: 'tube4_title',
                        description: 'tube4_description',
                        practicalTitle_i18n: { fr: 'tube4_practicalTitleFr', en: 'tube4_practicalTitleEn' },
                        practicalDescription_i18n: {
                          fr: 'tube4_practicalDescriptionFr',
                          en: 'tube4_practicalDescriptionEn',
                        },
                        isMobileCompliant: false,
                        isTabletCompliant: false,
                        skills: [
                          {
                            id: 'recSkill8',
                            name: '@tube4_name8',
                            status: 'actif',
                            level: 7,
                            pixValue: 78,
                            version: 32,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    [framework1Fr, framework2Fr] = _buildDomainFrameworksFromLearningContent(learningContent);
    [framework1En, framework2En] = _buildDomainFrameworksFromLearningContent(learningContent);
    [area1Fr, area2Fr] = _buildDomainAreasFromLearningContent(learningContent, 'fr');
    [area1En, area2En] = _buildDomainAreasFromLearningContent(learningContent, 'en');
    [competence1Fr, competence2Fr, competence3Fr] = _buildDomainCompetencesFromLearningContent(learningContent, 'fr');
    [competence1En, competence2En, competence3En] = _buildDomainCompetencesFromLearningContent(learningContent, 'en');
    [thematic1Fr, thematic2Fr, thematic3Fr] = _buildDomainThematicsFromLearningContent(learningContent, 'fr');
    [thematic1En, thematic2En, thematic3En] = _buildDomainThematicsFromLearningContent(learningContent, 'en');
    [tube1Fr, tube2Fr, , tube4Fr] = _buildDomainTubesFromLearningContent(learningContent, 'fr');
    [tube1En, tube2En, , tube4En] = _buildDomainTubesFromLearningContent(learningContent, 'en');
    [skill1, skill2, skill3, , , , , skill8] = _buildDomainSkillsFromLearningContent(learningContent);

    mockLearningContent(learningContent);
  });

  describe('#findByCampaignId', function () {
    let campaignId;

    it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
      );
      await databaseBuilder.commit();

      framework1Fr.areas = [area1Fr];
      area1Fr.competences = [competence2Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube2Fr.skills = [skill2, skill3];

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
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
      );
      await databaseBuilder.commit();

      framework1En.areas = [area1En];
      area1En.competences = [competence2En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      thematic2En.tubes = [tube2En];
      tube2En.skills = [skill2, skill3];

      // when
      const learningContentFromCampaign = await learningContentRepository.findByCampaignId(campaignId, 'en');

      // then
      expect(learningContentFromCampaign.frameworks).to.deep.equal([framework1En]);
    });

    it('should throw a NoSkillsInCampaignError when there are no more operative skills', async function () {
      // given
      campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkill4' });
      await databaseBuilder.commit();

      // when
      const err = await catchErr(learningContentRepository.findByCampaignId)(campaignId);

      // then
      expect(err).to.be.instanceOf(NoSkillsInCampaignError);
    });
  });

  describe('#findByCampaignParticipationId', function () {
    let campaignParticipationId;

    it('should return areas, competences and tubes of the skills hierarchy', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
      );
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      area1Fr.competences = [competence2Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      thematic2Fr.tubes = [tube2Fr];
      tube2Fr.skills = [skill2, skill3];

      // when
      const campaignLearningContent = await learningContentRepository.findByCampaignParticipationId(
        campaignParticipationId
      );

      // then
      expect(campaignLearningContent.areas).to.deep.equal([area1Fr]);
    });

    it('should translate names and descriptions when specifying a locale', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
      );
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      area1En.competences = [competence2En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      thematic2En.tubes = [tube2En];
      tube2En.skills = [skill2, skill3];

      // when
      const campaignLearningContent = await learningContentRepository.findByCampaignParticipationId(
        campaignParticipationId,
        'en'
      );

      // then
      expect(campaignLearningContent.areas).to.deep.equal([area1En]);
    });

    it('should throw a NoSkillsInCampaignError when there are no more operative skills', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkill4' });
      campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const err = await catchErr(learningContentRepository.findByCampaignParticipationId)(campaignParticipationId);

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
        tube2Fr.skills = [skill2];

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
          tube2En.skills = [skill2];

          // when
          const targetProfileLearningContent = await learningContentRepository.findByTargetProfileId(
            targetProfileId,
            'en'
          );

          // then
          expect(targetProfileLearningContent.frameworks).to.deep.equal([framework1En]);
        });
      });
    });
  });

  describe('#findByFrameworkNames', function () {
    it('should return an active LearningContent with the frameworks designated by name', async function () {
      // given
      framework1Fr.areas = [area1Fr];
      framework2Fr.areas = [area2Fr];
      area1Fr.competences = [competence1Fr, competence2Fr];
      area2Fr.competences = [competence3Fr];
      competence1Fr.thematics = [thematic1Fr];
      competence1Fr.tubes = [tube1Fr];
      competence2Fr.thematics = [thematic2Fr];
      competence2Fr.tubes = [tube2Fr];
      competence3Fr.thematics = [thematic3Fr];
      competence3Fr.tubes = [tube4Fr];
      thematic1Fr.tubes = [tube1Fr];
      thematic2Fr.tubes = [tube2Fr];
      thematic3Fr.tubes = [tube4Fr];
      tube1Fr.skills = [skill1];
      tube2Fr.skills = [skill2];
      tube4Fr.skills = [skill8];

      // when
      const learningContent = await learningContentRepository.findByFrameworkNames({
        frameworkNames: ['Mon référentiel 1', 'Mon référentiel 2'],
      });

      // then
      const expectedLearningContent = domainBuilder.buildLearningContent([framework1Fr, framework2Fr]);
      expect(learningContent).to.deepEqualInstance(expectedLearningContent);
    });
    it('should return an active LearningContent in the given language', async function () {
      // given
      framework1En.areas = [area1En];
      framework2En.areas = [area2En];
      area1En.competences = [competence1En, competence2En];
      area2En.competences = [competence3En];
      competence1En.thematics = [thematic1En];
      competence1En.tubes = [tube1En];
      competence2En.thematics = [thematic2En];
      competence2En.tubes = [tube2En];
      competence3En.thematics = [thematic3En];
      competence3En.tubes = [tube4En];
      thematic1En.tubes = [tube1En];
      thematic2En.tubes = [tube2En];
      thematic3En.tubes = [tube4En];
      tube1En.skills = [skill1];
      tube2En.skills = [skill2];
      tube4En.skills = [skill8];

      // when
      const learningContent = await learningContentRepository.findByFrameworkNames({
        frameworkNames: ['Mon référentiel 1', 'Mon référentiel 2'],
        locale: 'en',
      });

      // then
      const expectedLearningContent = domainBuilder.buildLearningContent([framework1En, framework2En]);
      expect(learningContent).to.deepEqualInstance(expectedLearningContent);
    });
  });
});

function _buildDomainFrameworksFromLearningContent({ frameworks }) {
  return frameworks.map((framework) =>
    domainBuilder.buildFramework({
      id: framework.id,
      name: framework.name,
      areas: [],
    })
  );
}

function _buildDomainAreasFromLearningContent({ areas }, locale) {
  return areas.map((area) =>
    domainBuilder.buildArea({
      ...area,
      title: area.title_i18n[locale],
    })
  );
}

function _buildDomainCompetencesFromLearningContent({ competences }, locale) {
  return competences.map((competence) =>
    domainBuilder.buildCompetence({
      ...competence,
      name: competence.name_i18n[locale],
      description: competence.description_i18n[locale],
    })
  );
}

function _buildDomainThematicsFromLearningContent({ thematics }, locale) {
  return thematics.map((thematic) =>
    domainBuilder.buildThematic({
      ...thematic,
      name: thematic.name_i18n[locale],
    })
  );
}

function _buildDomainTubesFromLearningContent({ tubes }, locale) {
  return tubes.map((tube) =>
    domainBuilder.buildTube({
      ...tube,
      practicalTitle: tube.practicalTitle_i18n[locale],
      practicalDescription: tube.practicalDescription_i18n[locale],
    })
  );
}

function _buildDomainSkillsFromLearningContent({ skills }) {
  return skills.map((skill) => domainBuilder.buildSkill({ ...skill, difficulty: skill.level }));
}
