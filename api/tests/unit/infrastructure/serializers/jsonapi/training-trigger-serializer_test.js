const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-trigger-serializer');

describe('Unit | Serializer | JSONAPI | training-trigger-serializer', function () {
  describe('#serialize', function () {
    it('should convert a training trigger model to JSON', function () {
      // given
      const id = 12345;
      const trainingId = 6789;
      const area1 = domainBuilder.buildArea({ id: 'recArea1' });
      const competence1 = domainBuilder.buildCompetence({ id: 'recCompetence1', areaId: 'recArea1' });
      const competenceInAnotherArea = domainBuilder.buildCompetence({ id: 'recCompetence2', areaId: 'recArea2' });
      const thematic1 = domainBuilder.buildThematic({ id: 'recThematic1', competenceId: 'recCompetence1' });
      const thematicInAnotherCompetence = domainBuilder.buildThematic({
        id: 'recThematic2',
        competenceId: 'anotherCompetence',
      });
      const tube1 = domainBuilder.buildTube({
        id: 'recTube1',
        thematicId: thematic1.id,
      });
      const tubeInAnotherThematic = domainBuilder.buildTube({
        id: 'recTube2',
        thematicId: 'anotherThematic',
      });
      const trainingTriggerTube1 = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube1',
        tube: tube1,
      });
      const anotherTrainingTriggerTube = domainBuilder.buildTrainingTriggerTube({
        id: 'recTrainingTriggerTube2',
        tube: tubeInAnotherThematic,
      });
      const trainingTrigger = domainBuilder.buildTrainingTrigger({
        id,
        trainingId,
        areas: [area1],
        competences: [competence1, competenceInAnotherArea],
        thematics: [thematic1, thematicInAnotherCompetence],
        triggerTubes: [trainingTriggerTube1, anotherTrainingTriggerTube],
      });

      const expectedSerializedTrainingTrigger = {
        data: {
          attributes: {
            id,
            'training-id': trainingId,
            threshold: 60,
            type: 'prerequisite',
          },
          id: `${id}`,
          relationships: {
            'trigger-tubes': {
              data: [
                {
                  id: 'recTrainingTriggerTube1',
                  type: 'trigger-tubes',
                },
                {
                  id: 'recTrainingTriggerTube2',
                  type: 'trigger-tubes',
                },
              ],
            },
            areas: {
              data: [
                {
                  id: 'recArea1',
                  type: 'areas',
                },
              ],
            },
          },
          type: 'training-triggers',
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
              index: 0,
              name: 'My Thematic',
            },
            id: 'recThematic1',
            type: 'thematics',
          },
          {
            attributes: {
              index: '1.1',
              name: 'Manger des fruits',
            },
            id: 'recCompetence1',
            relationships: {
              thematics: {
                data: [
                  {
                    id: 'recThematic1',
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
              title: 'Super domaine',
            },
            id: 'recArea1',
            relationships: {
              competences: {
                data: [
                  {
                    id: 'recCompetence1',
                    type: 'competences',
                  },
                ],
              },
            },
            type: 'areas',
          },
        ],
      };

      // when
      const json = serializer.serialize(trainingTrigger);

      // then
      expect(json).to.deep.equal(expectedSerializedTrainingTrigger);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Training Trigger object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training-triggers',
          attributes: {
            type: 'prerequisite',
            threshold: 30,
            tubes: [{ id: 'recTube123', level: 2 }],
          },
        },
      };

      // when
      const trainingTrigger = await serializer.deserialize(jsonTraining);

      // then
      expect(trainingTrigger).to.deep.equal({
        type: 'prerequisite',
        threshold: 30,
        tubes: [{ id: 'recTube123', level: 2 }],
      });
    });
  });
});
