import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  MockDate,
  mockLearningContent,
  createServer,
} from '../../../../test-helper.js';

describe('Acceptance | Route | admin-target-profile', function () {
  let server;
  let user;
  let targetProfileId;

  beforeEach(async function () {
    server = await createServer();

    MockDate.set(new Date('2020-11-01'));

    const learningContent = learningContentBuilder([
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
    ]);
    mockLearningContent(learningContent);
    mockLearningContent(learningContent);

    targetProfileId = databaseBuilder.factory.buildTargetProfile({ name: 'Roxane est très jolie' }).id;
    databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 2 });
    user = databaseBuilder.factory.buildUser.withRole();
    return databaseBuilder.commit();
  });

  afterEach(function () {
    MockDate.reset();
  });

  describe('GET /api/admin/target-profiles/{id}/content-json', function () {
    it('should return 200 and the json file', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/content-json`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal(
        '[{"id":"recTube2","level":2,"frameworkId":"recFramework1","skills":["recSkill2"]}]',
      );
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename=20201101_profil_cible_roxane_est_tres_jolie.json',
      );
      expect(response.headers['content-type']).to.equal('application/json;charset=utf-8');
    });
  });

  describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language=fr', function () {
    it('should return 200 and the pdf file', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/learning-content-pdf?language=fr`,
        payload: {},
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename=20201101_profil_cible_roxane_est_tres_jolie.pdf',
      );
      expect(response.headers['content-type']).to.equal('application/pdf');
    });
  });
});
