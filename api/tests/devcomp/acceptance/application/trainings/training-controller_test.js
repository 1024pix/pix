import {
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';

describe('Acceptance | Controller | training-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/trainings/{trainingId}', function () {
    let learningContent;
    let areaId;
    let competenceId;
    let thematicId;
    let tubeId;

    beforeEach(async function () {
      areaId = 'recArea1';
      competenceId = 'recCompetence1';
      thematicId = 'recThematic1';
      tubeId = 'recTube0_0';

      learningContent = [
        {
          areas: [
            {
              id: areaId,
              title_i18n: { fr: 'domaine1_Titre' },
              color: 'someColor',
              competences: [
                {
                  id: competenceId,
                  name_i18n: { fr: 'Mener une recherche et une veille d’information' },
                  index: '1.1',
                  thematics: [
                    {
                      id: thematicId,
                      name_i18n: { fr: 'thematique1_Nom' },
                      tubes: [
                        {
                          id: tubeId,
                          name: 'tube1_Name',
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
          ],
        },
      ];

      const learningContentObjects = learningContentBuilder(learningContent);
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
        tubeId: tubeId,
      });
      await databaseBuilder.commit();

      const expectedResponse = {
        type: 'trainings',
        id: `${trainingId}`,
        attributes: {
          id: trainingId,
          title: trainingAttributes.title,
          type: trainingAttributes.type,
          link: trainingAttributes.link,
          locale: trainingAttributes.locale,
          'is-recommendable': true,
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
      expect(returnedTube.id).to.deep.equal(tubeId);
      const returnedTriggerTube = response.result.included.find(
        (included) => included.type === 'trigger-tubes',
      ).attributes;
      expect(returnedTriggerTube.id).to.deep.equal(trainingTriggerTube.id);

      const returnedTrigger = response.result.included.find(
        (included) => included.type === 'training-triggers',
      ).attributes;
      expect(returnedTrigger.id).to.deep.equal(trainingTrigger.id);
      expect(returnedTrigger['tubes-count']).to.equal(1);

      const returnedTriggerArea = response.result.included.find((included) => included.type === 'areas').attributes;
      expect(returnedTriggerArea.id).to.deep.equal(`${areaId}_${trainingTrigger.id}`);

      const returnedTriggerCompetence = response.result.included.find(
        (included) => included.type === 'competences',
      ).attributes;
      expect(returnedTriggerCompetence.id).to.deep.equal(`${competenceId}_${trainingTrigger.id}`);

      const returnedTriggerThematic = response.result.included.find(
        (included) => included.type === 'thematics',
      ).attributes;
      expect(returnedTriggerThematic.id).to.deep.equal(`${thematicId}_${trainingTrigger.id}`);
    });
  });

  describe('POST /api/admin/trainings', function () {
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
          expectedResponse.data.attributes.editorName,
        );
        expect(response.result.data.attributes['editor-logo-url']).to.deep.equal(
          expectedResponse.data.attributes.editorLogoUrl,
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
              'goal-threshold': undefined,
              'prerequisite-threshold': undefined,
              'target-profiles-count': 0,
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
        expect(response.result.data[0].attributes).to.deep.equal(expectedResponse.data.attributes);
        expect(response.result.meta.pagination).to.deep.equal(expectedPagination);
      });
    });
  });

  describe('PUT /api/admin/trainings/{trainingId}/triggers', function () {
    let learningContent;
    let tubeName;
    let tubeId;
    let areaId;
    let competenceId;
    let thematicId;

    beforeEach(async function () {
      tubeName = 'tube0_0';
      tubeId = 'recTube0_0';
      areaId = 'recArea1';
      competenceId = 'recCompetence1';
      thematicId = 'recThematic1';

      learningContent = [
        {
          areas: [
            {
              id: areaId,
              title_i18n: { fr: 'domaine1_Titre' },
              color: 'someColor',
              competences: [
                {
                  id: competenceId,
                  name_i18n: { fr: 'Mener une recherche et une veille d’information' },
                  index: '1.1',
                  thematics: [
                    {
                      id: thematicId,
                      name_i18n: { fr: 'thematique1_Nom' },
                      tubes: [
                        {
                          id: tubeId,
                          name: tubeName,
                          skills: [],
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

      const learningContentObjects = learningContentBuilder(learningContent);
      mockLearningContent(learningContentObjects);
    });

    it('should update training trigger', async function () {
      // given
      const superAdmin = await insertUserWithRoleSuperAdmin();
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const tube = { tubeId: 'recTube0_0', level: 2 };
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
              tubes: [{ tubeId: `${tube.tubeId}`, level: `${tube.level}` }],
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
      expect(response.result.included).to.exists;
      expect(response.result.included.find(({ type }) => type === 'trigger-tubes').attributes.level).to.equal(
        tube.level,
      );
      const returnedTube = response.result.included.find(({ type }) => type === 'tubes').attributes;
      expect(returnedTube.id).to.equal(tube.tubeId);
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
        outdated: false,
        'is-public': undefined,
        'created-at': undefined,
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
          'is-public': undefined,
          'created-at': undefined,
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
