import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
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
