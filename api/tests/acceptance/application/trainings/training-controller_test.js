const {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
} = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | training-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/trainings/{trainingId}', function () {
    let learningContent;
    let tubeName;

    beforeEach(async function () {
      tubeName = 'tube0_0';
      learningContent = [
        {
          areas: [
            {
              id: 'recArea1',
              titleFrFr: 'area1_Title',
              color: 'someColor',
              competences: [
                {
                  id: 'competenceId',
                  nameFrFr: 'Mener une recherche et une veille d’information',
                  index: '1.1',
                  tubes: [
                    {
                      id: 'recTube0_0',
                      name: tubeName,
                      skills: [
                        {
                          id: 'skillWeb2Id',
                          nom: '@web2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should get a training with the specific id', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      databaseBuilder.factory.buildTraining();
      const { id: trainingId, ...trainingAttributes } = databaseBuilder.factory.buildTraining();
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({ trainingId });
      const trainingTriggerTube = databaseBuilder.factory.buildTrainingTriggerTube({
        trainingTriggerId: trainingTrigger.id,
        tubeId: 'recTube0_0',
      });
      await databaseBuilder.commit();

      const expectedResponse = {
        type: 'trainings',
        id: `${trainingId}`,
        attributes: {
          title: trainingAttributes.title,
          type: trainingAttributes.type,
          link: trainingAttributes.link,
          locale: trainingAttributes.locale,
          duration: {
            days: 0,
            hours: 6,
            minutes: 0,
          },
          'editor-logo-url': trainingAttributes.editorLogoUrl,
          'editor-name': trainingAttributes.editorName,
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/trainings/${trainingId}`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.equal(expectedResponse.id);
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);

      const returnedTube = response.result.included.find((included) => included.type === 'tubes').attributes;
      expect(returnedTube.name).to.deep.equal(tubeName);
      const returnedTriggerTube = response.result.included.find(
        (included) => included.type === 'trigger-tubes'
      ).attributes;
      expect(returnedTriggerTube.level).to.deep.equal(trainingTriggerTube.level);
      const returnedTrigger = response.result.included.find((included) => included.type === 'triggers').attributes;
      expect(returnedTrigger.type).to.deep.equal(trainingTrigger.type);
      expect(returnedTrigger.threshold).to.deep.equal(trainingTrigger.threshold);
    });
  });

  describe('POST /api/admin/trainings', function () {
    afterEach(async function () {
      await databaseBuilder.knex('account-recovery-demands').delete();
    });

    it('should create a new training and response with a 201', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();

      const expectedResponse = {
        type: 'trainings',
        id: '101064',
        attributes: {
          title: 'Titre du training',
          link: 'https://training-link.org',
          type: 'webinaire',
          duration: {
            days: 0,
            hours: 6,
            minutes: 0,
          },
          locale: 'fr',
          'editor-name': 'Un ministère',
          'editor-logo-url': 'https://mon-logo.svg',
        },
      };

      // when
      const response = await server.inject({
        method: 'POST',
        url: '/api/admin/trainings',
        payload: {
          data: {
            type: 'trainings',
            attributes: {
              title: 'Titre du training',
              link: 'https://training-link.org',
              type: 'webinaire',
              duration: {
                hours: 6,
              },
              locale: 'fr',
              'editor-logo-url': 'https://mon-logo.svg',
              'editor-name': 'Un ministère',
            },
          },
        },
        headers: { authorization: generateValidRequestAuthorizationHeader(superAdmin.id) },
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('PATCH /api/admin/trainings/{trainingId}', function () {
    let options;

    describe('nominal case', function () {
      it('should update training and response with a 200', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();
        const updatedTraining = {
          title: 'new title',
          editorName: 'editor name',
          editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/logo.svg',
          duration: {
            days: 2,
            hours: 2,
            minutes: 2,
          },
        };

        options = {
          method: 'PATCH',
          url: `/api/admin/trainings/${training.id}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
          payload: {
            data: {
              type: 'trainings',
              attributes: {
                title: updatedTraining.title,
                'editor-name': updatedTraining.editorName,
                'editor-logo-url': updatedTraining.editorLogoUrl,
                duration: {
                  days: 2,
                  hours: 2,
                  minutes: 2,
                },
              },
            },
          },
        };

        const expectedResponse = {
          data: {
            type: 'trainings',
            id: '1',
            attributes: {
              title: updatedTraining.title,
              link: training.link,
              duration: training.duration,
              editorName: updatedTraining.editorName,
              editorLogoUrl: updatedTraining.editorLogoUrl,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.deep.equal(expectedResponse.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes.title).to.deep.equal(expectedResponse.data.attributes.title);
        expect(response.result.data.attributes.link).to.deep.equal(expectedResponse.data.attributes.link);
        expect(response.result.data.attributes['editor-name']).to.deep.equal(
          expectedResponse.data.attributes.editorName
        );
        expect(response.result.data.attributes['editor-logo-url']).to.deep.equal(
          expectedResponse.data.attributes.editorLogoUrl
        );
      });
    });
  });

  describe('GET /api/admin/training-summaries', function () {
    let options;

    describe('nominal case', function () {
      it('should find training summaries and respond with a 200', async function () {
        // given
        const superAdmin = await insertUserWithRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/admin/training-summaries?page[number]=1&page[size]=2`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
          },
        };

        const expectedResponse = {
          data: {
            type: 'training-summaries',
            id: '1',
            attributes: {
              title: training.title,
            },
          },
        };

        const expectedPagination = { page: 1, pageSize: 2, rowCount: 1, pageCount: 1 };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].type).to.deep.equal(expectedResponse.data.type);
        expect(response.result.data[0].id).to.exist;
        expect(response.result.data[0].attributes.title).to.deep.equal(expectedResponse.data.attributes.title);
        expect(response.result.meta.pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('PUT /api/admin/trainings/{trainingId}/triggers', function () {
    let learningContent;
    let tubeName;

    beforeEach(async function () {
      tubeName = 'tube0_0';
      learningContent = [
        {
          areas: [
            {
              id: 'recArea1',
              titleFrFr: 'area1_Title',
              color: 'someColor',
              competences: [
                {
                  id: 'competenceId',
                  nameFrFr: 'Mener une recherche et une veille d’information',
                  index: '1.1',
                  tubes: [
                    {
                      id: 'recTube0_0',
                      name: tubeName,
                      skills: [
                        {
                          id: 'skillWeb2Id',
                          nom: '@web2',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
      mockLearningContent(learningContentObjects);
    });

    afterEach(async function () {
      await knex('training-trigger-tubes').delete();
      await knex('training-triggers').delete();
    });

    it('should update training trigger', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const tube = { id: 'recTube0_0', level: 2 };
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/trainings/${trainingId}/triggers`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
        payload: {
          data: {
            type: 'training-triggers',
            attributes: {
              trainingId: `${trainingId}`,
              type: 'prerequisite',
              threshold: 30,
              tubes: [{ id: `${tube.id}`, level: `${tube.level}` }],
            },
          },
        },
      };

      const expectedResponse = {
        data: {
          type: 'training-triggers',
          id: `${trainingId}`,
          attributes: {
            type: 'prerequisite',
            threshold: 30,
          },
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.type).to.deep.equal(expectedResponse.data.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes.type).to.deep.equal(expectedResponse.data.attributes.type);
      expect(response.result.data.attributes.threshold).to.deep.equal(expectedResponse.data.attributes.threshold);
      expect(response.result.included.find(({ type }) => type === 'trigger-tubes').attributes.level).to.equal(
        tube.level
      );
      const returnedTube = response.result.included.find(({ type }) => type === 'tubes').attributes;
      expect(returnedTube.id).to.equal(tube.id);
      expect(returnedTube.name).to.equal(tubeName);
    });
  });

  describe('GET /api/admin/trainings/{trainingId}/target-profile-summaries', function () {
    it('should get target-profile-summaries related to training id', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const training = databaseBuilder.factory.buildTraining();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        id: 1,
        name: 'Super profil cible',
        isPublic: true,
        outdated: false,
      });
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId: training.id,
        targetProfileId: targetProfile.id,
      });
      await databaseBuilder.commit();

      const expectedResponse = {
        type: 'target-profile-summaries',
        id: `${targetProfile.id}`,
        attributes: {
          name: targetProfile.name,
          outdated: false,
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/trainings/${training.id}/target-profile-summaries`,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(superAdmin.id),
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal(expectedResponse.type);
      expect(response.result.data[0].id).to.equal(expectedResponse.id);
      expect(response.result.data[0].attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('POST /api/admin/trainings/{id}/attach-target-profiles', function () {
    let userId;
    let trainingId;
    let alreadyAttachedTargetProfileId;
    let toAttachTargetProfileId;

    beforeEach(async function () {
      const adminUser = await insertUserWithRoleSuperAdmin();
      userId = adminUser.id;
      trainingId = databaseBuilder.factory.buildTraining().id;
      alreadyAttachedTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      toAttachTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId,
        targetProfileId: alreadyAttachedTargetProfileId,
      });
      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('target-profile-trainings').delete();
    });

    context('when target profiles to attach exists', function () {
      it('should attach target profiles to given training', async function () {
        // given
        const options = {
          method: 'POST',
          url: `/api/admin/trainings/${trainingId}/attach-target-profiles`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            'target-profile-ids': [alreadyAttachedTargetProfileId, toAttachTargetProfileId],
          },
        };

        // when
        const response = await server.inject(options);

        // then
        const attachedTargetProfileIds = await knex('target-profile-trainings')
          .pluck('targetProfileId')
          .where({ trainingId })
          .orderBy('targetProfileId', 'ASC');
        expect(response.statusCode).to.equal(204);
        expect(attachedTargetProfileIds).to.deepEqualArray([alreadyAttachedTargetProfileId, toAttachTargetProfileId]);
      });
    });
  });
});
