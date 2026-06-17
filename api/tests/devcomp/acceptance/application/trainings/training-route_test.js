import { createServer } from '../../../../../server.js';
import { Training } from '../../../../../src/devcomp/domain/models/Training.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

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
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should get a training with the specific id', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      databaseBuilder.factory.buildTraining();
      const { id: trainingId, ...trainingAttributes } = databaseBuilder.factory.buildTraining({
        objectives: ['Objectif 1', 'Objectif 2', 'Objectif 3'],
      });
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
          'internal-title': trainingAttributes.internalTitle,
          type: trainingAttributes.type,
          link: trainingAttributes.link,
          locales: trainingAttributes.locales,
          'is-recommendable': true,
          duration: {
            days: 0,
            hours: 6,
            minutes: 0,
          },
          'editor-logo-url': trainingAttributes.editorLogoUrl,
          'editor-name': trainingAttributes.editorName,
          'is-disabled': false,
          'delivery-mode': Training.modes.HYBRID,
          'registration-required': false,
          program: 'Programme du contenu formatif',
          description: "<p>Voici la description d'un contenu formatif</p>",
          objectives: 'Objectif 1;Objectif 2;Objectif 3',
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/trainings/${trainingId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      await databaseBuilder.commit();

      const expectedResponse = {
        type: 'trainings',
        id: '101064',
        attributes: {
          title: 'Titre du training',
          'internal-title': 'Titre interne du training',
          link: 'https://training-link.org',
          type: 'webinaire',
          duration: {
            days: 0,
            hours: 6,
            minutes: 0,
          },
          locales: ['fr', 'fr-fr'],
          'editor-name': 'Un ministère',
          'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/mon-logo.svg',
          'delivery-mode': 'remote',
          description: 'Une sommaire description',
          program: 'un programme bien détaillé',
          'registration-required': true,
          objectives: ['Objectif 1', 'Objectif 2', 'Objectif 3', 'Objectif 4'],
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
              'internal-title': 'Titre interne du training',
              link: 'https://training-link.org',
              type: 'webinaire',
              duration: {
                hours: 6,
              },
              locales: ['fr', 'fr-fr'],
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/mon-logo.svg',
              'editor-name': 'Un ministère',
              'delivery-mode': Training.modes.REMOTE,
              description: 'Une sommaire description',
              program: 'un programme bien détaillé',
              'registration-required': true,
              objectives: 'Objectif 1;Objectif 2;Objectif 3;Objectif 4',
            },
          },
        },
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.type).to.equal(expectedResponse.type);
      expect(response.result.data.id).to.exist;
      expect(response.result.data.attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('POST /api/admin/trainings/{trainingId}/duplicate', function () {
    it('should duplicate an existing training and response with a 201', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const training = databaseBuilder.factory.buildTraining();
      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'POST',
        url: `/api/admin/trainings/${training.id}/duplicate`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.trainingId).to.exist;
    });
  });

  describe('PATCH /api/admin/trainings/{trainingId}', function () {
    let options;

    describe('nominal case', function () {
      it('should update training and response with a 200', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining({
          deliveryMode: Training.modes.HYBRID,
          registrationRequired: false,
          program: 'Programme du contenu formatif à mettre à jour',
          objectives: ['Objectif 1', 'Objectif 2', 'Objectif 3 à mettre à jour'],
          description: 'Une description à mettre à jour',
        });
        await databaseBuilder.commit();
        const locales = ['fr', 'fr-fr'];
        const updatedTraining = {
          title: 'new title',
          internalTitle: 'new internal title',
          editorName: 'editor name',
          editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/logo.svg',
          duration: {
            days: 2,
            hours: 2,
            minutes: 2,
          },
          locales,
          deliveryMode: Training.modes.REMOTE,
          registrationRequired: true,
          program: 'Programme du contenu formatif mis à jour',
          objectives: 'Objectif 1;Objectif 2;Objectif 3 mis à jour',
          description: 'Une description mis à jour',
        };

        options = {
          method: 'PATCH',
          url: `/api/admin/trainings/${training.id}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
          payload: {
            data: {
              type: 'trainings',
              attributes: {
                title: updatedTraining.title,
                'internal-title': updatedTraining.internalTitle,
                'editor-name': updatedTraining.editorName,
                'editor-logo-url': updatedTraining.editorLogoUrl,
                duration: {
                  days: 2,
                  hours: 2,
                  minutes: 2,
                },
                'is-disabled': true,
                locales,
                'delivery-mode': updatedTraining.deliveryMode,
                'registration-required': updatedTraining.registrationRequired,
                program: updatedTraining.program,
                objectives: updatedTraining.objectives,
                description: updatedTraining.description,
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
              internalTitle: updatedTraining.internalTitle,
              link: training.link,
              locales,
              duration: training.duration,
              editorName: updatedTraining.editorName,
              editorLogoUrl: updatedTraining.editorLogoUrl,
              isDisabled: updatedTraining.isDisabled,
              deliveryMode: updatedTraining.deliveryMode,
              registrationRequired: updatedTraining.registrationRequired,
              program: updatedTraining.program,
              objectives: updatedTraining.objectives,
              description: updatedTraining.description,
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
        expect(response.result.data.attributes['internal-title']).to.deep.equal(
          expectedResponse.data.attributes.internalTitle,
        );
        expect(response.result.data.attributes.link).to.deep.equal(expectedResponse.data.attributes.link);
        expect(response.result.data.attributes['editor-name']).to.deep.equal(
          expectedResponse.data.attributes.editorName,
        );
        expect(response.result.data.attributes['editor-logo-url']).to.deep.equal(
          expectedResponse.data.attributes.editorLogoUrl,
        );
        expect(response.result.data.attributes['is-disabled']).to.be.true;
        expect(response.result.data.attributes['locales']).to.deep.equal(locales);
        expect(response.result.data.attributes['delivery-mode']).to.equal(Training.modes.REMOTE);
        expect(response.result.data.attributes['registration-required']).to.equal(true);
        expect(response.result.data.attributes.program).to.deep.equal(expectedResponse.data.attributes.program);
        expect(response.result.data.attributes.objectives).to.deep.equal(expectedResponse.data.attributes.objectives);
        expect(response.result.data.attributes.description).to.deep.equal(expectedResponse.data.attributes.description);
      });
    });
  });

  describe('DELETE /api/admin/trainings/{trainingId}/triggers/{trainingTriggerId}', function () {
    let options;

    it('should delete trigger related to training', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const training = databaseBuilder.factory.buildTraining();
      const trainingTrigger = databaseBuilder.factory.buildTrainingTrigger({
        trainingId: training.id,
        type: 'prerequisite',
      });
      databaseBuilder.factory.buildTrainingTriggerTube({ trainingTriggerId: trainingTrigger.id, tubeId: 'rec0' });

      await databaseBuilder.commit();

      options = {
        method: 'DELETE',
        url: `/api/admin/trainings/${training.id}/triggers/${trainingTrigger.id}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);

      const deletedTrainingTrigger = await knex('training-triggers').where({ id: trainingTrigger.id }).first();
      const deletedTrainingTriggerTube = await knex('training-trigger-tubes')
        .where({ trainingTriggerId: trainingTrigger.id })
        .first();

      expect(deletedTrainingTrigger).to.be.undefined;
      expect(deletedTrainingTriggerTube).to.be.undefined;
    });
  });

  describe('GET /api/admin/training-summaries', function () {
    let options;

    describe('nominal case', function () {
      it('should find training summaries and respond with a 200', async function () {
        // given
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        const training = databaseBuilder.factory.buildTraining();
        await databaseBuilder.commit();

        options = {
          method: 'GET',
          url: `/api/admin/training-summaries?page[number]=1&page[size]=2`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
              'internal-title': training.internalTitle,
              'is-disabled': false,
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
      databaseBuilder.factory.learningContent.build(learningContentObjects);
      await databaseBuilder.commit();
    });

    it('should update training trigger', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const tube = { tubeId: 'recTube0_0', level: 2 };
      await databaseBuilder.commit();

      const options = {
        method: 'PUT',
        url: `/api/admin/trainings/${trainingId}/triggers`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const training = databaseBuilder.factory.buildTraining();
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        id: 1,
        name: 'Super profil cible',
        internalName: 'Super profil cible interne',
        outdated: false,
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
          'internal-name': targetProfile.internalName,
          outdated: false,
          'created-at': undefined,
          category: undefined,
          'is-part-of-combined-course': false,
        },
      };

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/trainings/${training.id}/target-profile-summaries`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data[0].type).to.equal(expectedResponse.type);
      expect(response.result.data[0].id).to.equal(expectedResponse.id);
      expect(response.result.data[0].attributes).to.deep.equal(expectedResponse.attributes);
    });
  });

  describe('POST /api/admin/trainings/{id}/attach-target-profiles', function () {
    let superAdmin;
    let trainingId;
    let alreadyAttachedTargetProfileId;
    let toAttachTargetProfileId;

    beforeEach(async function () {
      superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
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
          headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
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

  describe('DELETE /api/admin/trainings/{trainingId}/target-profiles/{targetProfileId}', function () {
    it('should detach target profile from given training', async function () {
      // given
      const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
      const trainingId = databaseBuilder.factory.buildTraining().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTraining({
        trainingId,
        targetProfileId,
      });
      await databaseBuilder.commit();

      const options = {
        method: 'DELETE',
        url: `/api/admin/trainings/${trainingId}/target-profiles/${targetProfileId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id }),
      };

      // when
      const response = await server.inject(options);

      // then
      const result = await knex('target-profile-trainings').where({ trainingId, targetProfileId });
      expect(response.statusCode).to.equal(204);
      expect(result).to.deepEqualArray([]);
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
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
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
            'internal-title': 'internal title',
          },
        },
      ];
      expect(response.result.data).to.deep.equal(expectedData);
    });
  });
});
