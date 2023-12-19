import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  MockDate,
  mockLearningContent,
  learningContentBuilder,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';

describe('Acceptance | Route | admin-target-profile', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/target-profiles/{id}/content-json', function () {
    let user;
    let targetProfileId;

    beforeEach(function () {
      MockDate.set(new Date('2020-11-01'));
      const learningContent = {
        areas: [{ id: 'recArea', frameworkId: 'recFmwk', competenceIds: ['recCompetence'] }],
        competences: [{ id: 'recCompetence', areaId: 'recArea', thematicIds: ['recThematic'] }],
        thematics: [
          { id: 'recThematic', name_i18n: { fr: 'somename' }, tubeIds: ['recTube'], competenceId: 'recCompetence' },
        ],
        tubes: [{ id: 'recTube', thematicId: 'recThematic' }],
        skills: [{ id: 'recSkill', tubeId: 'recTube', status: 'actif', level: 5, name: 'skill5' }],
        challenges: [],
      };
      mockLearningContent(learningContent);
      targetProfileId = databaseBuilder.factory.buildTargetProfile({ name: 'Roxane est très jolie' }).id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube', level: 6 });
      user = databaseBuilder.factory.buildUser.withRole();

      return databaseBuilder.commit();
    });

    afterEach(function () {
      MockDate.reset();
    });

    it('should return 200 and the json file', async function () {
      const authHeader = generateValidRequestAuthorizationHeader(user.id);
      const token = authHeader.replace('Bearer ', '');
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/content-json?accessToken=${token}`,
        payload: {},
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.payload).to.equal('[{"id":"recTube","level":6,"frameworkId":"recFmwk","skills":["recSkill"]}]');
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename=20201101_profil_cible_Roxane est tr_s jolie.json',
      );
      expect(response.headers['content-type']).to.equal('text/json;charset=utf-8');
    });
  });

  describe('GET /api/admin/target-profiles/{id}/learning-content-pdf?language=fr', function () {
    let targetProfileId;
    let user;

    beforeEach(function () {
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
      mockLearningContent(learningContent);

      targetProfileId = databaseBuilder.factory.buildTargetProfile({ name: 'Jeanne & Serge' }).id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube1', level: 4 });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube2', level: 2 });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube3', level: 5 });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'recTube4', level: 7 });
      user = databaseBuilder.factory.buildUser.withRole();

      return databaseBuilder.commit();
    });

    afterEach(function () {
      MockDate.reset();
    });

    it('should return 200 and the json file', async function () {
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
        'attachment; filename=20201101_profil_cible_Jeanne & Serge.pdf',
      );
      expect(response.headers['content-type']).to.equal('application/pdf');
    });
  });
});
