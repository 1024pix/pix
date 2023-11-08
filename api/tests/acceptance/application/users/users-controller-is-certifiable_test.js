import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';

describe('Acceptance | users-controller-is-certifiable', function () {
  let server;
  let options;
  let user;

  beforeEach(async function () {
    server = await createServer();

    user = databaseBuilder.factory.buildUser();

    const learningContent = learningContentBuilder.fromAreas([
      {
        id: 'recvoGdo7z2z7pXWa',
        title_i18n: {
          fr: 'Information et données',
        },
        color: 'jaffa',
        code: '1',
        competences: [
          {
            id: 'recCompetence1',
            name_i18n: {
              fr: 'Mener une recherche et une veille d’information',
            },
            index: '1.1',
            origin: 'Pix',
            areaId: 'recvoGdo7z2z7pXWa',
            thematics: [
              {
                id: 'recThemCompetence1',
                tubes: [
                  {
                    id: 'recTubeCompetence1',
                    skills: [
                      {
                        id: 'skillId@web3',
                        name: '@web3',
                        status: 'actif',
                        level: 3,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence2',
            name_i18n: {
              fr: 'Gérer les données',
            },
            index: '1.2',
            origin: 'Pix',
            areaId: 'recvoGdo7z2z7pXWa',
            thematics: [
              {
                id: 'recThemCompetence2',
                tubes: [
                  {
                    id: 'recTubeCompetence2',
                    skills: [
                      {
                        id: 'skillId@fichier3',
                        name: '@fichier3',
                        status: 'actif',
                        level: 3,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence3',
            name_i18n: {
              fr: 'Traiter les données',
            },
            index: '1.3',
            origin: 'Pix',
            areaId: 'recvoGdo7z2z7pXWa',
            thematics: [
              {
                id: 'recThemCompetence3',
                tubes: [
                  {
                    id: 'recTubeCompetence3',
                    skills: [
                      {
                        id: 'skillId@tri3',
                        name: '@tri3',
                        status: 'actif',
                        level: 3,
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
        id: 'recDH19F7kKrfL3Ii',
        title_i18n: {
          fr: 'Communication et collaboration',
        },
        color: 'jaffa',
        code: '1',
        competences: [
          {
            id: 'recCompetence4',
            name_i18n: {
              fr: 'Intéragir',
            },
            index: '2.1',
            origin: 'Pix',
            areaId: 'recDH19F7kKrfL3Ii',
            thematics: [
              {
                id: 'recThemCompetence4',
                tubes: [
                  {
                    id: 'recTubeCompetence4',
                    skills: [
                      {
                        id: 'skillId@spam3',
                        name: '@spam3',
                        status: 'actif',
                        level: 3,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence5',
            name_i18n: {
              fr: 'Partager et publier',
            },
            index: '2.2',
            origin: 'Pix',
            areaId: 'recDH19F7kKrfL3Ii',
            thematics: [
              {
                id: 'recThemCompetence5',
                tubes: [
                  {
                    id: 'recTubeCompetence5',
                    skills: [
                      {
                        id: 'skillId@vocRS3',
                        name: '@vocRS3',
                        status: 'actif',
                        level: 3,
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

    learningContent.skills.forEach(({ id: skillId, competenceId }) => {
      databaseBuilder.factory.buildKnowledgeElement({ userId: user.id, earnedPix: 10, competenceId, skillId });
    });

    const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
    const cleaBadgeId = databaseBuilder.factory.buildBadge({
      key: 'PARTNER_KEY',
      isCertifiable: true,
      targetProfileId,
    }).id;
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId: cleaBadgeId,
      threshold: 75,
      cappedTubes: JSON.stringify(
        learningContent.tubes.map(({ id }) => ({
          id,
          level: 8,
        })),
      ),
    });

    const campaignId = databaseBuilder.factory.buildCampaign({ targetProfileId }).id;
    learningContent.skills.forEach(({ id: skillId }) => {
      databaseBuilder.factory.buildCampaignSkill({
        campaignId,
        skillId,
      });
    });
    const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;

    databaseBuilder.factory.buildBadgeAcquisition({
      userId: user.id,
      badgeId: cleaBadgeId,
      campaignParticipationId,
    });

    const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
      name: 'PARTNER_CERTIFICATION',
    }).id;

    databaseBuilder.factory.buildComplementaryCertificationBadge({
      badgeId: cleaBadgeId,
      complementaryCertificationId,
      label: 'PARTNER_LABEL',
    });

    options = {
      method: 'GET',
      url: `/api/users/${user.id}/is-certifiable`,
      payload: {},
      headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
    };

    return databaseBuilder.commit();
  });

  describe('GET /users/:id/is-certifiable', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Success case', function () {
      it('should return a 200 status code response with JSON API serialized isCertifiable', async function () {
        // given
        const expectedResponse = {
          data: {
            id: `${user.id}`,
            type: 'isCertifiables',
            attributes: {
              'is-certifiable': true,
              'complementary-certifications': [
                {
                  imageUrl: 'http://badge-image-url.fr',
                  label: 'PARTNER_LABEL',
                  isOutdated: false,
                  isAcquired: false,
                },
              ],
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedResponse);
      });
    });
  });
});
