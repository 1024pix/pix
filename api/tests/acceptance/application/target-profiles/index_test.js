import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  mockLearningContent,
} from '../../../test-helper.js';

describe('Acceptance | Route | target-profiles', function () {
  let server;

  const skillId = 'recArea1_Competence1_Tube1_Skill1';
  const tubeId = 'recArea1_Competence1_Tube1';

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
              'are-knowledge-elements-resettable': true,
            },
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      const { id: targetProfileId, areKnowledgeElementsResettable } = await knex('target-profiles')
        .select('id', 'areKnowledgeElementsResettable')
        .first();
      expect(response.statusCode).to.equal(200);
      expect(response.result).to.deep.equal({
        data: {
          type: 'target-profiles',
          id: `${targetProfileId}`,
        },
      });
      expect(areKnowledgeElementsResettable).to.be.true;
    });
  });

  describe('PATCH /api/admin/target-profiles/{id}', function () {
    beforeEach(async function () {
      mockLearningContent(learningContent);
    });

    describe('when there is no tube to update', function () {
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
                'image-url': 'http://valid-uri.com/image.png',
                'are-knowledge-elements-resettable': false,
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

    describe('when there is some tube update and the target profile is not linked with campaign', function () {
      it('should return 204', async function () {
        const targetProfile = databaseBuilder.factory.buildTargetProfile();
        const targetProfileTube = databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId: targetProfile.id,
          tubeId,
          level: 1,
        });
        const user = databaseBuilder.factory.buildUser.withRole();
        await databaseBuilder.commit();

        const options = {
          method: 'PATCH',
          url: `/api/admin/target-profiles/${targetProfile.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
          payload: {
            data: {
              attributes: {
                name: 'nom changé',
                category: 'COMPETENCES',
                description: 'description changée.',
                comment: 'commentaire changé.',
                'image-url': null,
                tubes: [{ id: targetProfileTube.tubeId, level: 99 }],
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
  });

  describe('GET /api/admin/target-profiles/{id}', function () {
    let user;

    beforeEach(async function () {
      mockLearningContent(learningContent);
      user = databaseBuilder.factory.buildUser.withRole();
    });

    it('should return the target-profile corresponding to the given {id} and 200 status code', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'Savoir tout faire',
        imageUrl: 'https://test',
        isPublic: true,
        isSimplifiedAccess: false,
        createdAt: new Date('2020-01-01'),
        outdated: false,
        description: 'Une description',
        comment: 'Un beau profil cible',
        category: 'TEST',
        migration_status: 'N/A',
        areKnowledgeElementsResettable: false,
      });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfile.id, tubeId, level: 7 });

      databaseBuilder.factory.buildCampaign({ targetProfileId: targetProfile.id });
      await databaseBuilder.commit();
      const expectedTargetProfile = {
        'are-knowledge-elements-resettable': false,
        'capped-tubes': [],
        category: 'TEST',
        comment: 'Un beau profil cible',
        description: 'Une description',
        'created-at': new Date('2020-01-01'),
        'has-linked-campaign': true,
        'has-linked-autonomous-course': false,
        'image-url': 'https://test',
        'is-public': true,
        'is-simplified-access': false,
        name: 'Savoir tout faire',
        outdated: false,
        'owner-organization-id': targetProfile.ownerOrganizationId,
        'max-level': -Infinity,
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfile.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes).to.deep.equal(expectedTargetProfile);
    });

    it('should return the target profile with certifiable badges and 200 status code', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'Super Profil Cible',
      });
      databaseBuilder.factory.buildBadge({
        id: 1,
        targetProfileId: targetProfile.id,
        isCertifiable: true,
        title: 'Badge certifiable',
      });
      databaseBuilder.factory.buildBadge({
        id: 2,
        targetProfileId: targetProfile.id,
        isCertifiable: false,
        title: 'Badge non certifiable',
      });
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/target-profiles/${targetProfile.id}?filter[badges]=certifiable`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.attributes).to.deep.equal({
        name: 'Super Profil Cible',
      });
      expect(response.result.included[0].attributes).to.deep.equal({
        'is-certifiable': true,
        title: 'Badge certifiable',
      });
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
            'goal-threshold': undefined,
            'prerequisite-threshold': undefined,
            'is-disabled': false,
            'target-profiles-count': 1,
            title: 'title',
          },
        },
      ];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
