const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer');

describe('Unit | Serializer | JSONAPI | tutorial-serializer', () => {

  describe('#serialize', () => {

    it('should return a serialized JSON data object', () => {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            'duration': '00:01:30',
            'format': 'video',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
    it('should return a serialized JSON data object, enhanced by tube information', () => {
      // given
      const tutorialId = 123;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });
      tutorial.tubeName = '@web';
      tutorial.tubePracticalTitle = 'Tube Practical Title';
      tutorial.tubePracticalDescription = 'Tube Practical Description';

      tutorial.unknownAttribute = 'should not be in result';

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            'duration': '00:01:30',
            'format': 'video',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
            'tube-name': '@web',
            'tube-practical-description': 'Tube Practical Description',
            'tube-practical-title': 'Tube Practical Title',
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object, with userTutorial related to', () => {
      // given
      const tutorialId = 123;
      const userId = 456;
      const userTutorialId = `${userId}_${tutorialId}`;

      const tutorial = domainBuilder.buildTutorial({
        id: tutorialId,
      });
      const userTutorial = { userId, id: userTutorialId, tutorialId };
      tutorial.userTutorial = userTutorial;

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            'duration': '00:01:30',
            'format': 'video',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
          relationships: {
            'user-tutorial': {
              data: {
                id: userTutorialId,
                type: 'user-tutorial',
              }
            }
          }
        },
        included: [{
          attributes: {
            id: userTutorialId,
            'user-id': userId,
            'tutorial-id': tutorialId,
          },
          id: userTutorialId,
          type: 'user-tutorial',
        }]
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
