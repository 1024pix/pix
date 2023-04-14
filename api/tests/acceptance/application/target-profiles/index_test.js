const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
  MockDate,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const omit = require('lodash/omit');

describe('Acceptance | Route | target-profiles', function () {
  let server;

  const skillId = 'recArea1_Competence1_Tube1_Skill1';

  const learningContent = {
    areas: [{ id: 'recArea1', competenceIds: ['recArea1_Competence1'] }],
    competences: [
      {
        id: 'recArea1_Competence1',
        areaId: 'recArea1',
        skillIds: [skillId],
        origin: 'Pix',
      },
    ],
    thematics: [],
    tubes: [
      {
        id: 'recArea1_Competence1_Tube1',
        competenceId: 'recArea1_Competence1',
      },
    ],
    skills: [
      {
        id: skillId,
        name: '@recArea1_Competence1_Tube1_Skill1',
        status: 'actif',
        tubeId: 'recArea1_Competence1_Tube1',
        competenceId: 'recArea1_Competence1',
      },
    ],
    challenges: [
      {
        id: 'recArea1_Competence1_Tube1_Skill1_Challenge1',
        skillId: skillId,
        competenceId: 'recArea1_Competence1',
        status: 'validé',
        locales: ['fr-fr'],
      },
    ],
  };

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/target-profiles', function () {
    let user;

    beforeEach(function () {
      user = databaseBuilder.factory.buildUser.withRole();
      const learningContentForTest = {
        skills: [
          {
            id: 'recSkill1',
            name: 'skill1',
            status: 'actif',
            tubeId: 'recTube1',
          },
        ],
      };
      mockLearningContent(learningContentForTest);
      return databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('target-profiles_skills').delete();
      await knex('target-profile_tubes').delete();
      await knex('target-profiles').delete();
    });

    it('should return 200', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: '/api/admin/target-profiles',
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              name: 'targetProfileName',
              category: 'OTHER',
              description: 'coucou maman',
              comment: 'coucou papa',
              'is-public': false,
              'image-url': 'http://some/image.ok',
              'owner-organization-id': '1',
              tubes: [{ id: 'recTube1', level: 5 }],
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { id: targetProfileId } = await knex('target-profiles').select('id').first();
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'target-profiles',
          id: `${targetProfileId}`,
        },
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}', function () {
    let user;
    let targetProfileId;

    beforeEach(async function () {
      mockLearningContent(learningContent);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: skillId });
      user = databaseBuilder.factory.buildUser.withRole();

      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/organizations', function () {
    let user;
    let targetProfileId;
    let organizationId;

    beforeEach(async function () {
      const learningContent = [
        {
          id: 'recArea0',
          competences: [
            {
              id: 'recNv8qhaY887jQb2',
              index: '1.3',
              name: 'Traiter des données',
            },
          ],
        },
      ];
      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      user = databaseBuilder.factory.buildUser.withRole();
      organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId });
      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.be.instanceOf(Array);
      expect(response.result.data[0].id).to.equal(organizationId.toString());
    });
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', function () {
    beforeEach(async function () {
      mockLearningContent(learningContent);
    });

    afterEach(function () {
      return knex('target-profile-shares').delete();
    });

    it('should return 200', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const user = databaseBuilder.factory.buildUser.withRole();
      const organization1 = databaseBuilder.factory.buildOrganization();
      const organization2 = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfileId}/attach-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          'organization-ids': [organization1.id, organization2.id],
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);
      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationIds).to.exactlyContain([organization1.id, organization2.id]);
    });
  });

  describe('POST /api/admin/target-profiles/{id}/copy-organizations', function () {
    beforeEach(async function () {
      mockLearningContent(learningContent);
    });

    afterEach(function () {
      return knex('target-profile-shares').delete();
    });

    it('should return 204', async function () {
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const existingTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const userId = databaseBuilder.factory.buildUser.withRole().id;
      const organizationId1 = databaseBuilder.factory.buildOrganization().id;
      const organizationId2 = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId1,
      });
      databaseBuilder.factory.buildTargetProfileShare({
        targetProfileId: existingTargetProfileId,
        organizationId: organizationId2,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'POST',
        url: `/api/admin/target-profiles/${targetProfileId}/copy-organizations`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        payload: {
          'target-profile-id': existingTargetProfileId,
        },
      };

      // when
      const response = await server.inject(options);

      const rows = await knex('target-profile-shares')
        .select('organizationId')
        .where({ targetProfileId: targetProfileId });
      const organizationIds = rows.map(({ organizationId }) => organizationId);

      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationIds).to.exactlyContain([organizationId1, organizationId2]);
    });
  });

  describe('PATCH /api/admin/target-profiles/{id}', function () {
    it('should return 204', async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      const options = {
        method: 'PATCH',
        url: `/api/admin/target-profiles/${targetProfile.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              name: 'CoolPixer',
              description: 'Amazing description',
              comment: 'Amazing comment',
              category: 'OTHER',
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('PUT /api/admin/target-profiles/{id}/outdate', function () {
    it('should return 204', async function () {
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const user = databaseBuilder.factory.buildUser.withRole();
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/target-profiles/${targetProfile.id}/outdate`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              outdated: true,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('POST /api/admin/target-profiles/{id}/badges', function () {
    context('Badge with skill Set', function () {
      afterEach(async function () {
        await knex('skill-sets').delete();
        await knex('badge-criteria').delete();
        await knex('badges').delete();
      });

      it('should not create a badge if there are no associated criteria', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        await databaseBuilder.commit();
        const badgeCreation = {
          key: 'TOTO23',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'campaign-threshold': null,
          'skill-set-threshold': null,
          'is-always-visible': true,
          'capped-tubes-criteria': [],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfile.id}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should create badge with empty message and title', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        await databaseBuilder.commit();
        const badgeCreation = {
          key: 'TOTO23',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          message: '',
          title: null,
          'capped-tubes-criteria': [],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfile.id}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedResult = {
          data: {
            attributes: {
              'alt-message': 'alt-message',
              'image-url': 'https//images.example.net',
              'is-certifiable': false,
              'is-always-visible': true,
              key: 'TOTO23',
              message: '',
              title: null,
            },
            type: 'badges',
          },
        };
        expect(response.statusCode).to.equal(201);
        expect(omit(response.result, 'data.id')).to.deep.equal(omit(expectedResult, 'data.id'));
      });

      it('should create a badge with at least one criterion', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'aki1' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'aki3' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'aki9' });
        await databaseBuilder.commit();
        const badgeCreation = {
          key: 'TOTO23',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'skill-set-threshold': '66',
          'skill-set-name': "c'est le nom du lot d'acquis !",
          'skill-set-skills-ids': ['aki1', 'aki3', 'aki9'],
          'capped-tubes-criteria': [],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedResult = {
          data: {
            attributes: {
              'alt-message': 'alt-message',
              'image-url': 'https//images.example.net',
              'is-certifiable': false,
              'is-always-visible': true,
              key: 'TOTO23',
              message: 'Bravo !',
              title: 'Le super badge',
            },
            type: 'badges',
          },
        };
        expect(response.statusCode).to.equal(201);
        expect(omit(response.result, 'data.id')).to.deep.equal(omit(expectedResult, 'data.id'));
      });

      it('should not create a badge nor criteria', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole();
        const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'aki1' });
        databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'aki3' });
        await databaseBuilder.commit();
        const badgeCreation = {
          key: 'TOTO23',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'skill-set-threshold': '66',
          'skill-set-name': "c'est le nom du lot d'acquis !",
          'skill-set-skills-ids': ['aki1', 'aki3', 'aki9'],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedError = {
          errors: [
            {
              detail: 'Les acquis suivants ne font pas partie du profil cible : aki9',
              status: '400',
              title: 'Default Bad Request',
            },
          ],
        };
        expect(response.statusCode).to.equal(400);
        expect(response.result).to.deep.equal(expectedError);
      });
    });
    context('Badge with capped tubes', function () {
      let user, targetProfileId;
      beforeEach(async function () {
        user = databaseBuilder.factory.buildUser.withRole();
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId1', level: 3 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId2', level: 2 });
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId: 'tubeId3', level: 4 });
        await databaseBuilder.commit();
      });
      afterEach(async function () {
        await knex('badge-criteria').delete();
        await knex('badges').delete();
      });
      it('should create a badge with capped tubes criterion', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              name: 'awesome tube group',
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 2,
                },
                {
                  id: 'tubeId2',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);
        const cappedTubesCriterion = await knex('badge-criteria').select().where('scope', 'CappedTubes').first();
        const campaignCriterion = await knex('badge-criteria').select().where('scope', 'CampaignParticipation').first();

        // then
        const expectedResult = {
          data: {
            attributes: {
              'alt-message': 'alt-message',
              'image-url': 'https//images.example.net',
              'is-certifiable': false,
              'is-always-visible': true,
              key: 'badge1',
              message: 'Bravo !',
              title: 'Le super badge',
            },
            type: 'badges',
          },
        };

        const expectedCappedTubesCriterion = {
          name: 'awesome tube group',
          scope: 'CappedTubes',
          threshold: 50,
          badgeId: parseInt(response.result.data.id, 10),
          skillSetIds: null,
          cappedTubes: [
            { id: 'tubeId1', level: 2 },
            { id: 'tubeId2', level: 2 },
          ],
        };

        const expectedCampaignCriterion = {
          name: null,
          scope: 'CampaignParticipation',
          threshold: 99,
          badgeId: parseInt(response.result.data.id, 10),
          skillSetIds: null,
          cappedTubes: null,
        };
        expect(response.statusCode).to.equal(201);
        expect(omit(response.result, 'data.id')).to.deep.equal(expectedResult);
        expect(omit(cappedTubesCriterion, 'id')).to.deep.equal(expectedCappedTubesCriterion);
        expect(omit(campaignCriterion, 'id')).to.deep.equal(expectedCampaignCriterion);
      });

      it('should not create a badge if capped tubes criterion tube id is not into target profile', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 2,
                },
                {
                  id: 'wrongId',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedError = {
          errors: [
            {
              detail: 'Le sujet wrongId ne fait pas partie du profil cible',
              status: '422',
              title: 'Unprocessable entity',
            },
          ],
        };
        expect(response.statusCode).to.equal(422);
        expect(response.result).to.deep.equal(expectedError);
      });
      it('should not create a badge if capped tubes criterion level is not into target profile', async function () {
        const badgeCreation = {
          key: 'badge1',
          'alt-message': 'alt-message',
          'image-url': 'https//images.example.net',
          message: 'Bravo !',
          title: 'Le super badge',
          'is-certifiable': false,
          'is-always-visible': true,
          'campaign-threshold': '99',
          'capped-tubes-criteria': [
            {
              threshold: '50',
              cappedTubes: [
                {
                  id: 'tubeId1',
                  level: 8,
                },
                {
                  id: 'wrongId',
                  level: 2,
                },
              ],
            },
          ],
        };
        const options = {
          method: 'POST',
          url: `/api/admin/target-profiles/${targetProfileId}/badges/`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              type: 'badge-creations',
              attributes: badgeCreation,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const expectedError = {
          errors: [
            {
              detail: 'Le niveau 8 dépasse le niveau max du sujet tubeId1',
              status: '422',
              title: 'Unprocessable entity',
            },
          ],
        };
        expect(response.statusCode).to.equal(422);
        expect(response.result).to.deep.equal(expectedError);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/stages', function () {
    let user;
    let targetProfileId;
    let stage;

    beforeEach(async function () {
      const learningContent = [
        {
          id: 'recArea',
          competences: [
            {
              id: 'recCompetence',
              tubes: [
                {
                  id: 'recTube',
                  skills: [
                    {
                      id: 'recSkill',
                      nom: '@recSkill',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
      mockLearningContent(learningContentObjects);

      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId, skillId: 'recSkill' });
      stage = databaseBuilder.factory.buildStage({ targetProfileId });
      user = databaseBuilder.factory.buildUser.withRole();

      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/stages`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [
        {
          type: 'stages',
          id: stage.id.toString(),
          attributes: {
            message: stage.message,
            title: stage.title,
            threshold: stage.threshold,
            level: stage.level,
            'prescriber-title': stage.prescriberTitle,
            'prescriber-description': stage.prescriberDescription,
          },
        },
      ];
      expect(response.result.data).to.deep.equal(expectedData);
    });
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
        'attachment; filename=20201101_profil_cible_Roxane est tr_s jolie.json'
      );
      expect(response.headers['content-type']).to.equal('text/json;charset=utf-8');
    });
  });

  describe('GET /api/admin/target-profiles/{id}/training-summaries', function () {
    let user;
    let targetProfileId;
    let training;

    beforeEach(async function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      training = databaseBuilder.factory.buildTraining();
      databaseBuilder.factory.buildTargetProfileTraining({ targetProfileId, trainingId: training.id });
      user = databaseBuilder.factory.buildUser.withRole();

      await databaseBuilder.commit();
    });

    it('should return 200', async function () {
      const options = {
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfileId}/training-summaries`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      const expectedData = [
        {
          type: 'training-summaries',
          id: training.id.toString(),
          attributes: {
            title: 'title',
            'is-recommendable': false,
          },
        },
      ];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
