import { domainBuilder, expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js';

describe('Unit | Serializer | JSONAPI | training-serializer', function () {
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
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
            'editor-name': 'Ministère education nationale',
            'is-recommendable': true,
            link: 'https://example.net',
            locale: 'fr-fr',
            title: 'Training 1',
            type: 'webinar',
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
              code: 5,
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
              code: 5,
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
      const json = serializer.serializeForAdmin(training);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
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
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
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
      const json = serializer.serialize(training);

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
            link: 'https://example.net',
            type: 'webinar',
            duration: {
              days: 0,
              hours: 5,
              minutes: 0,
            },
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
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
      const json = serializer.serialize(training, meta);

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
            locale: 'fr-fr',
            'editor-name': 'Ministère education nationale',
            'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
          },
        },
      };

      // when
      const training = await serializer.deserialize(jsonTraining);

      // then
      expect(training).to.deep.equal({
        title: 'title',
        link: 'https://example.net',
        locale: 'fr-fr',
        duration: '3d3h3m',
        type: 'webinaire',
        editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
        editorName: 'Ministère education nationale',
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
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
              locale: 'fr-fr',
              'editor-name': 'Ministère education nationale',
              'editor-logo-url': 'https://images.pix.fr/contenu-formatif/editeur/editor_logo_url.svg',
            },
          },
        };

        // when
        const deserializedTraining = await serializer.deserialize(jsonTraining);

        // then
        expect(deserializedTraining.duration).to.deep.equal(expectedDuration);
      });
    });
  });
});
