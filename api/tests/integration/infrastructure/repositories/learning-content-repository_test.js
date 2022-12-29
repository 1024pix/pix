const {
  expect,
  databaseBuilder,
  catchErr,
  mockLearningContent,
  domainBuilder,
  learningContentBuilder,
} = require('../../../test-helper');
const { NoSkillsInCampaignError, NotFoundError } = require('../../../../lib/domain/errors');
const learningContentRepository = require('../../../../lib/infrastructure/repositories/learning-content-repository');

describe('Integration | Repository | learning-content', function () {
  let learningContent;
  let framework1Fr, framework1En;
  let area1Fr, area1En;
  let competence2Fr, competence2En;
  let thematic2Fr, thematic2En;
  let tube2Fr, tube2En;
  let skill2, skill3;

  beforeEach(function () {
    learningContent = learningContentBuilder.buildLearningContent([
      {
        id: 'recFramework1',
        name: 'Mon référentiel 1',
        areas: [
          {
            id: 'recArea1',
            name: 'area1_name',
            titleFr: 'area1_TitleFr',
            titleEn: 'area1_TitleEn',
            color: 'area1_color',
            code: 'area1_code',
            frameworkId: 'recFramework1',
            competences: [
              {
                id: 'recCompetence1',
                nameFr: 'competence1_nameFr',
                nameEn: 'competence1_nameEn',
                index: 1,
                descriptionFr: 'competence1_descriptionFr',
                descriptionEn: 'competence1_descriptionEn',
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic1',
                    nameFr: 'thematic1_nameFr',
                    nameEn: 'thematic1_nameEn',
                    index: '10',
                    tubes: [
                      {
                        id: 'recTube1',
                        name: '@tube1_name',
                        title: 'tube1_title',
                        description: 'tube1_description',
                        practicalTitleFr: 'tube1_practicalTitleFr',
                        practicalTitleEn: 'tube1_practicalTitleEn',
                        practicalDescriptionFr: 'tube1_practicalDescriptionFr',
                        practicalDescriptionEn: 'tube1_practicalDescriptionEn',
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
                nameFr: 'competence2_nameFr',
                nameEn: 'competence2_nameEn',
                index: 2,
                descriptionFr: 'competence2_descriptionFr',
                descriptionEn: 'competence2_descriptionEn',
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic2',
                    nameFr: 'thematic2_nameFr',
                    nameEn: 'thematic2_nameEn',
                    index: '20',
                    tubes: [
                      {
                        id: 'recTube2',
                        name: '@tube2_name',
                        title: '@tube2_title',
                        description: '@tube2_description',
                        practicalTitleFr: 'tube2_practicalTitleFr',
                        practicalTitleEn: 'tube2_practicalTitleEn',
                        practicalDescriptionFr: 'tube2_practicalDescriptionFr',
                        practicalDescriptionEn: 'tube2_practicalDescriptionEn',
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
                          // outdated skill
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
                        practicalTitleFr: 'tube3_practicalTitleFr',
                        practicalTitleEn: 'tube3_practicalTitleEn',
                        practicalDescriptionFr: 'tube3_practicalDescriptionFr',
                        practicalDescriptionEn: 'tube3_practicalDescriptionEn',
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
            titleFr: 'area2_TitleFr',
            titleEn: 'area2_TitleEn',
            color: 'area2_color',
            code: 'area2_code',
            frameworkId: 'recFramework2',
            competences: [
              {
                id: 'recCompetence3',
                nameFr: 'competence3_nameFr',
                nameEn: 'competence3_nameEn',
                index: 1,
                descriptionFr: 'competence3_descriptionFr',
                descriptionEn: 'competence3_descriptionEn',
                origin: 'Pix',
                thematics: [
                  {
                    id: 'recThematic3',
                    nameFr: 'thematic3_nameFr',
                    nameEn: 'thematic3_nameEn',
                    index: '30',
                    tubes: [
                      {
                        id: 'recTube4',
                        name: '@tube4_name',
                        title: 'tube4_title',
                        description: 'tube4_description',
                        practicalTitleFr: 'tube4_practicalTitleFr',
                        practicalTitleEn: 'tube4_practicalTitleEn',
                        practicalDescriptionFr: 'tube4_practicalDescriptionFr',
                        practicalDescriptionEn: 'tube4_practicalDescriptionEn',
                        isMobileCompliant: false,
                        isTabletCompliant: false,
                        skills: [
                          {
                            id: 'recSkill6',
                            name: '@tube4_name7',
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

    [framework1Fr] = _buildDomainFrameworksFromLearningContent(learningContent);
    [framework1En] = _buildDomainFrameworksFromLearningContent(learningContent);
    [area1Fr] = _buildDomainAreasFromLearningContent(learningContent, 'fr');
    [area1En] = _buildDomainAreasFromLearningContent(learningContent, 'en');
    [, competence2Fr] = _buildDomainCompetencesFromLearningContent(learningContent, 'fr');
    [, competence2En] = _buildDomainCompetencesFromLearningContent(learningContent, 'en');
    [, thematic2Fr] = _buildDomainThematicsFromLearningContent(learningContent, 'fr');
    [, thematic2En] = _buildDomainThematicsFromLearningContent(learningContent, 'en');
    [, tube2Fr] = _buildDomainTubesFromLearningContent(learningContent, 'fr');
    [, tube2En] = _buildDomainTubesFromLearningContent(learningContent, 'en');
    [, skill2, skill3] = _buildDomainSkillsFromLearningContent(learningContent);

    mockLearningContent(learningContent);
  });

  describe('#findByCampaignId', function () {
    let targetProfileId, campaignId;

    describe('when campaign has skills', function () {
      it("should use campaign's skills", async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        // target profile skills
        ['recSkill3', 'recSkill4'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        // campaign skills
        ['recSkill2', 'recSkill3'].forEach((skillId) =>
          databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
        );
        // skill on another campaign
        databaseBuilder.factory.buildCampaignSkill({ skillId: 'recSkill5' });
        await databaseBuilder.commit();

        // when
        const learningContentFromCampaign = await learningContentRepository.findByCampaignId(campaignId);

        // then
        expect(learningContentFromCampaign.skills).to.deep.equal([skill2, skill3]);
      });

      it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
        // given
        campaignId = databaseBuilder.factory.buildCampaign().id;
        // campaign skills
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
    });

    describe("when campaign doesn't have skills", function () {
      it("should use target profile's skills", async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        // target profile skills
        ['recSkill3', 'recSkill4'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        // skill on another target profile
        databaseBuilder.factory.buildCampaign({
          targetProfileId: databaseBuilder.factory.buildTargetProfileSkill({ skillId: 'recSkill5' }).targetProfileId,
        });
        await databaseBuilder.commit();

        // when
        const learningContentFromCampaign = await learningContentRepository.findByCampaignId(campaignId);

        // then
        expect(learningContentFromCampaign.skills).to.deep.equal([skill3]);
      });
    });

    it('should return frameworks, areas, competences, thematics and tubes of the skills hierarchy', async function () {
      // given
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
      );
      campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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

    describe('when using a specific locale', function () {
      it('should translate names and descriptions', async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        ['recSkill2', 'recSkill3'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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
    });

    describe('when there is no more operative skills', function () {
      it('should throw a NoSkillsInCampaignError', async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill4' });
        campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        await databaseBuilder.commit();

        // when
        const err = await catchErr(learningContentRepository.findByCampaignId)(campaignId);

        // then
        expect(err).to.be.instanceOf(NoSkillsInCampaignError);
      });
    });
  });

  describe('#findByCampaignParticipationId', function () {
    let targetProfileId, campaignParticipationId;

    describe('when campaign has skills', function () {
      it("should use campaign's skills", async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        // target profile skills
        ['recSkill3', 'recSkill4'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        // campaign skills
        ['recSkill2', 'recSkill3'].forEach((skillId) =>
          databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId })
        );
        // skill on another campaign
        databaseBuilder.factory.buildCampaignSkill({ skillId: 'recSkill5' });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
        await databaseBuilder.commit();

        // when
        const campaignLearningContent = await learningContentRepository.findByCampaignParticipationId(
          campaignParticipationId
        );

        // then
        expect(campaignLearningContent.skills).to.deep.equal([skill2, skill3]);
      });

      it('should return areas, competences and tubes of the skills hierarchy', async function () {
        // given
        const campaignId = databaseBuilder.factory.buildCampaign().id;
        // campaign skills
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
    });

    describe("when campaign doesn't have skills", function () {
      it("should use target profile's skills", async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        // target profile skills
        ['recSkill3', 'recSkill4'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        // skill on another target profile
        databaseBuilder.factory.buildCampaign({
          targetProfileId: databaseBuilder.factory.buildTargetProfileSkill({ skillId: 'recSkill5' }).targetProfileId,
        });
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
        await databaseBuilder.commit();

        // when
        const campaignLearningContent = await learningContentRepository.findByCampaignParticipationId(
          campaignParticipationId
        );

        // then
        expect(campaignLearningContent.skills).to.deep.equal([skill3]);
      });
    });

    it('should return areas, competences and tubes of the skills hierarchy', async function () {
      // given
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      ['recSkill2', 'recSkill3'].forEach((skillId) =>
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
      );
      const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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

    describe('when using a specific locale', function () {
      it('should translate names and descriptions', async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        ['recSkill2', 'recSkill3'].forEach((skillId) =>
          databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId })
        );
        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
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
    });

    describe('when there is no more operative skills', function () {
      it('should throw a NoSkillsInCampaignError', async function () {
        // given
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill4' });
        const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
        await databaseBuilder.commit();

        // when
        const err = await catchErr(learningContentRepository.findByCampaignParticipationId)(campaignParticipationId);

        // then
        expect(err).to.be.instanceOf(NoSkillsInCampaignError);
      });
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
