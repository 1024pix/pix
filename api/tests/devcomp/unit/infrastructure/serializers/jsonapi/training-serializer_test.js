import { Training } from '../../../../../../src/devcomp/domain/models/Training.js';
import { trainingSerializer } from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | DevComp | Infrastructure | Serializers | Jsonapi | training-serializer', function () {
  describe('#serializeForAdmin', function () {
    it('should convert a training model to JSON API with specific learning content tree for each trigger', function () {
      // given
      const trainingTriggerId = 456;
      const trainingTriggerId2 = 789;
      const trainingId = 123;
      const area1 = domainBuilder.buildArea({ id: 'recArea1' });
      const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', areaId: 'recArea1' });
      const competenceInAnotherArea = domainBuilder.buildCompetence({ id: 'recCompetence2', areaId: 'recArea2' });
      const thematic1 = domainBuilder.buildThematic({ id: 'recThematic1', competenceId: 'recCompetence1' });
      const thematic2 = domainBuilder.buildThematic({ id: 'recThematic2', competenceId: 'recCompetence1' });
      const thematicInAnotherCompetence = domainBuilder.buildThematic({
        id: 'recThematic3',
        competenceId: 'anotherCompetence',
      });
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        thematicId: thematic1.id,
      });
      const tube2 = domainBuilder.buildTube({
        id: 'recTube2',
        thematicId: thematic2.id,
      });
      const tubeInAnotherThematic = domainBuilder.buildTube({
        id: 'recTube3',
        thematicId: 'anotherThematic',
      });
      const trainingTriggerTube1 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube1',
        tube: tube1,
      });
      const trainingTriggerTube2 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube2',
        tube: tube2,
      });
      const anotherTrainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube3',
        tube: tubeInAnotherThematic,
      });
      const trainingTrigger = domainBuilder.buildTrainingTriggerForAdmin({
        id: trainingTriggerId,
        trainingId,
        areas: [area1],
        competences: [competence1, competenceInAnotherArea],
        thematics: [thematic1, thematicInAnotherCompetence],
        triggerTubes: [trainingTriggerTube1, anotherTrainingTriggerTube],
      });
      const trainingTrigger2 = domainBuilder.buildTrainingTriggerForAdmin({
        id: trainingTriggerId2,
        trainingId,
        areas: [area1],
        competences: [competence1],
        thematics: [thematic2],
        triggerTubes: [trainingTriggerTube2],
      });

      const training = domainBuilder.buildTrainingForAdmin({
        id: trainingId,
        trainingTriggers: [trainingTrigger, trainingTrigger2],
      });

      const expectedSerializedTraining = {
        data: {
          attributes: {
            id: trainingId,
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
            'editor-name': 'Ministère education nationale',
            'internal-title': 'Training 1 internal title',
            'is-disabled': false,
            'is-recommendable': true,
            link: 'https://example.net',
            locales: ['fr-fr'],
            title: 'Training 1',
            type: 'webinar',
            'delivery-mode': Training.modes.REMOTE,
            'registration-required': false,
            program: 'Program name',
            objectives: 'Objectif 1;Objectif 2;Objectif 3;Objectif 4',
            description: 'une jolie description',
          },
          id: `${trainingId}`,
          relationships: {
            'target-profile-summaries': {
              links: {
                related: '/api/admin/trainings/123/target-profile-summaries',
              },
            },
            'training-triggers': {
              data: [
                {
                  id: `${trainingTriggerId}`,
                  type: 'training-triggers',
                },
                {
                  id: `${trainingTriggerId2}`,
                  type: 'training-triggers',
                },
              ],
            },
          },
          type: 'trainings',
        },
        included: [
          {
            attributes: {
              id: 'recTube1',
              name: '@tubeName',
              'practical-title': 'titre pratique',
            },
            id: 'recTube1',
            type: 'tubes',
          },
          {
            attributes: {
              id: 'recTrainingTriggerTube1',
              level: 8,
            },
            id: 'recTrainingTriggerTube1',
            relationships: {
              tube: {
                data: {
                  id: 'recTube1',
                  type: 'tubes',
                },
              },
            },
            type: 'trigger-tubes',
          },
          {
            attributes: {
              id: `recThematic1_${trainingTriggerId}`,
              index: 0,
              name: 'My Thematic',
            },
            id: `recThematic1_${trainingTriggerId}`,
            relationships: {
              'trigger-tubes': {
                data: [
                  {
                    id: 'recTrainingTriggerTube1',
                    type: 'trigger-tubes',
                  },
                ],
              },
            },
            type: 'thematics',
          },
          {
            attributes: {
              id: `recCompetence1_${trainingTriggerId}`,
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: `recCompetence1_${trainingTriggerId}`,
            relationships: {
              thematics: {
                data: [
                  {
                    id: `recThematic1_${trainingTriggerId}`,
                    type: 'thematics',
                  },
                ],
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              id: `recArea1_${trainingTriggerId}`,
              code: '5',
              color: 'red',
              title: 'Super domaine',
            },
            id: `recArea1_${trainingTriggerId}`,
            relationships: {
              competences: {
                data: [
                  {
                    id: `recCompetence1_${trainingTriggerId}`,
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
          {
            attributes: {
              id: trainingTriggerId,
              'training-id': trainingId,
              threshold: 60,
              type: 'prerequisite',
              'tubes-count': 2,
            },
            id: `${trainingTriggerId}`,
            relationships: {
              areas: {
                data: [
                  {
                    id: `recArea1_${trainingTriggerId}`,
                    type: 'areas',
                  },
                ],
              },
            },
            type: 'training-triggers',
          },
          {
            attributes: {
              id: 'recTube2',
              name: '@tubeName',
              'practical-title': 'titre pratique',
            },
            id: 'recTube2',
            type: 'tubes',
          },
          {
            attributes: {
              id: 'recTrainingTriggerTube2',
              level: 8,
            },
            id: 'recTrainingTriggerTube2',
            relationships: {
              tube: {
                data: {
                  id: 'recTube2',
                  type: 'tubes',
                },
              },
            },
            type: 'trigger-tubes',
          },
          {
            attributes: {
              id: 'recThematic2_789',
              index: 0,
              name: 'My Thematic',
            },
            id: 'recThematic2_789',
            relationships: {
              'trigger-tubes': {
                data: [
                  {
                    id: 'recTrainingTriggerTube2',
                    type: 'trigger-tubes',
                  },
                ],
              },
            },
            type: 'thematics',
          },
          {
            attributes: {
              id: 'recCompetence1_789',
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'recCompetence1_789',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'recThematic2_789',
                    type: 'thematics',
                  },
                ],
              },
            },
            type: 'competences',
          },
          {
            attributes: {
              code: '5',
              color: 'red',
              id: 'recArea1_789',
              title: 'Super domaine',
            },
            id: 'recArea1_789',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recCompetence1_789',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
          {
            attributes: {
              id: 789,
              threshold: 60,
              'training-id': 123,
              'tubes-count': 1,
              type: 'prerequisite',
            },
            id: '789',
            relationships: {
              areas: {
                data: [
                  {
                    id: 'recArea1_789',
                    type: 'areas',
                  },
                ],
              },
            },
            type: 'training-triggers',
          },
        ],
      };

      // when
      const json = trainingSerializer.serializeForAdmin(training);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });

    it('should serialize objectives as null when objectives is null', function () {
      // given
      const training = domainBuilder.buildTrainingForAdmin({ objectives: null });

      // when
      const json = trainingSerializer.serializeForAdmin(training);

      // then
      expect(json.data.attributes.objectives).to.be.null;
    });
  });

  describe('#serialize', function () {
    it('should convert a training model to JSON', function () {
      // given
      const training = domainBuilder.buildTraining();

      const expectedSerializedTraining = {
        data: {
          attributes: {
            title: 'Training 1',
            'internal-title': 'Training 1 internal title',
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locales: ['fr-fr'],
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
            'delivery-mode': Training.modes.REMOTE,
            objectives: ['objective 1', 'objective 2'],
            program: 'training program',
            'registration-required': false,
            description: "<p>Voici la description d'un contenu formatif</p>",
          },
          relationships: {
            'target-profile-summaries': {
              links: {
                related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
              },
            },
          },
          id: training.id.toString(),
          type: 'trainings',
        },
      };

      // when
      const json = trainingSerializer.serialize(training);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });

    it('should serialize trainings with pagination', function () {
      // given
      const training = domainBuilder.buildTraining();
      const meta = {
        pagination: {
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        },
      };
      const expectedSerializedTraining = {
        data: {
          attributes: {
            title: 'Training 1',
            'internal-title': 'Training 1 internal title',
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locales: ['fr-fr'],
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
            'delivery-mode': Training.modes.REMOTE,
            objectives: ['objective 1', 'objective 2'],
            program: 'training program',
            'registration-required': false,
            description: "<p>Voici la description d'un contenu formatif</p>",
          },
          relationships: {
            'target-profile-summaries': {
              links: {
                related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
              },
            },
          },
          id: training.id.toString(),
          type: 'trainings',
        },
        meta,
      };

      // when
      const json = trainingSerializer.serialize(training, meta);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Training object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training',
          attributes: {
            title: 'title',
            link: 'https://example.net',
            duration: { days: 3, hours: 3, minutes: 3 },
            type: 'webinaire',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
            'is-disabled': true,
            description: "<p>Voici la description d'un contenu formatif pour le ministère</p>",
            'delivery-mode': Training.modes.REMOTE,
            program: 'Programme',
            'registration-required': false,
            objectives: 'Objectif 1          ;\n;;;  Objectif 2 ; Objectif 3',
          },
        },
      };

      // when
      const training = await trainingSerializer.deserialize(jsonTraining);

      // then
      expect(training).to.deep.equal({
        title: 'title',
        link: 'https://example.net',
        duration: '3d3h3m',
        type: 'webinaire',
        editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
        editorName: 'Ministère education nationale',
        isDisabled: true,
        description: "<p>Voici la description d'un contenu formatif pour le ministère</p>",
        deliveryMode: Training.modes.REMOTE,
        registrationRequired: false,
        program: 'Programme',
        objectives: ['Objectif 1', 'Objectif 2', 'Objectif 3'],
      });
    });

    it('should filter empty objectives caused by trailing semicolon', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training',
          attributes: {
            objectives: 'Objectif 1;Objectif 2;',
          },
        },
      };

      // when
      const training = await trainingSerializer.deserialize(jsonTraining);

      // then
      expect(training.objectives).to.deep.equal(['Objectif 1', 'Objectif 2']);
    });

    it('should filter empty objectives caused by multiple consecutive semicolons', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training',
          attributes: {
            objectives: 'Objectif 1;\n;\n;;;;Objectif 2;;;Objectif 3;\n;;',
          },
        },
      };

      // when
      const training = await trainingSerializer.deserialize(jsonTraining);

      // then
      expect(training.objectives).to.deep.equal(['Objectif 1', 'Objectif 2', 'Objectif 3']);
    });

    [
      { duration: { days: 0, hours: 0, minutes: 0 }, expectedDuration: '0d0h0m' },
      {
        duration: {
          days: 1,
          hours: 1,
          minutes: 1,
        },
        expectedDuration: '1d1h1m',
      },
    ].forEach(({ duration, expectedDuration }) => {
      it(`should deserialize ${JSON.stringify(
        duration,
      )} with properly formatted duration : "${expectedDuration}"`, async function () {
        // given
        const jsonTraining = {
          data: {
            type: 'training',
            attributes: {
              title: 'title',
              link: 'https://example.net',
              duration,
              type: 'webinaire',
              'editor-name': 'Ministère education nationale',
              'editor-logo-url': 'https://assets.pix.org/contenu-formatif/editeur/editor_logo_url.svg',
            },
          },
        };

        // when
        const deserializedTraining = await trainingSerializer.deserialize(jsonTraining);

        // then
        expect(deserializedTraining.duration).to.deep.equal(expectedDuration);
      });
    });
  });
});
