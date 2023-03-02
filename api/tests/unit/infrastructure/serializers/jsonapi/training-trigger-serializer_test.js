const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-trigger-serializer');

describe('Unit | Serializer | JSONAPI | training-trigger-serializer', function () {
  describe('#serialize', function () {
    it('should convert a training trigger model to JSON', function () {
      // given
      const trainingTrigger = domainBuilder.buildTrainingTrigger();

      const expectedSerializedTraining = {
        data: {
          attributes: {
            threshold: 60,
            'training-id': 156,
            type: 'prerequisite',
          },
          id: '1000',
          relationships: {
            'trigger-tubes': {
              data: [
                {
                  id: '10002',
                  type: 'trigger-tubes',
                },
              ],
            },
          },
          type: 'training-triggers',
        },
        included: [
          {
            attributes: {
              id: 'recTube123',
              name: '@tubeName',
              'practical-description': 'description pratique',
              'practical-title': 'titre pratique',
            },
            id: 'recTube123',
            type: 'tubes',
          },
          {
            attributes: {
              id: 10002,
              level: 2,
            },
            id: '10002',
            relationships: {
              tube: {
                data: {
                  id: 'recTube123',
                  type: 'tubes',
                },
              },
            },
            type: 'trigger-tubes',
          },
        ],
      };

      // when
      const json = serializer.serialize(trainingTrigger);

      // then
      expect(json).to.deep.equal(expectedSerializedTraining);
    });
  });

  describe('#deserialize', function () {
    it('should convert JSON API data to Training Trigger object', async function () {
      // given
      const jsonTraining = {
        data: {
          type: 'training-triggers',
          attributes: {
            trainingId: 123,
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
        trainingId: 123,
        type: 'prerequisite',
        threshold: 30,
        tubes: [{ id: 'recTube123', level: 2 }],
      });
    });
  });
});
