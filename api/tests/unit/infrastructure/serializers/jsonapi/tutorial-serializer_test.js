import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer';

describe('Unit | Serializer | JSONAPI | tutorial-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
      // given
      const tutorialId = 123;

      const skillId = 'rec123';

      const tutorial = domainBuilder.buildTutorialForUser({
        tutorial: domainBuilder.buildTutorial({ id: tutorialId }),
        userSavedTutorial: null,
        skillId,
      });

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
            'skill-id': 'rec123',
          },
          relationships: {
            'tutorial-evaluation': {
              data: null,
            },
            'user-saved-tutorial': {
              data: null,
            },
          },
        },
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object, enhanced by tube information', function () {
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
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
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

    it('should return a serialized JSON data object, with userSavedTutorial related to', function () {
      // given
      const userId = 456;
      const tutorialId = 123;
      const tutorialEvaluationId = `${userId}_${tutorialId}`;
      const userSavedTutorialId = `${userId}_${tutorialId}`;
      const skillId = 'rec123';

      const tutorial = domainBuilder.buildTutorialForUser({
        tutorial: domainBuilder.buildTutorial({ id: tutorialId }),
        tutorialEvaluation: { userId, id: tutorialEvaluationId, tutorialId },
        userSavedTutorial: { userId, id: userSavedTutorialId, tutorialId },
        skillId,
      });

      const expectedSerializedResult = {
        data: {
          id: tutorialId.toString(),
          type: 'tutorials',
          attributes: {
            duration: '00:01:30',
            format: 'video',
            link: 'https://youtube.fr',
            source: 'Youtube',
            title: 'Savoir regarder des vidéos youtube.',
            'skill-id': 'rec123',
          },
          relationships: {
            'tutorial-evaluation': {
              data: {
                id: tutorialEvaluationId,
                type: 'tutorialEvaluation',
              },
            },
            'user-saved-tutorial': {
              data: {
                id: userSavedTutorialId,
                type: 'user-saved-tutorial',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              id: tutorialEvaluationId,
              'user-id': userId,
              'tutorial-id': tutorialId,
            },
            id: tutorialEvaluationId,
            type: 'tutorialEvaluation',
          },
          {
            attributes: {
              id: userSavedTutorialId,
              'user-id': userId,
              'tutorial-id': tutorialId,
            },
            id: userSavedTutorialId,
            type: 'user-saved-tutorial',
          },
        ],
      };

      // when
      const result = serializer.serialize(tutorial);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });

    it('should return a serialized JSON data object with pagination', function () {
      // given
      const tutorialId = 123;

      const tutorials = [
        domainBuilder.buildTutorial({
          id: tutorialId,
        }),
      ];
      const pagination = {
        page: 1,
        pageSize: 10,
        rowCount: 1,
        pageCount: 1,
      };

      const expectedSerializedResult = {
        data: [
          {
            id: tutorialId.toString(),
            type: 'tutorials',
            attributes: {
              duration: '00:01:30',
              format: 'video',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Savoir regarder des vidéos youtube.',
            },
          },
        ],
        meta: {
          page: 1,
          pageSize: 10,
          rowCount: 1,
          pageCount: 1,
        },
      };

      // when
      const result = serializer.serialize(tutorials, pagination);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
