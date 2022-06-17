const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tutorial-evaluation-serializer');
const TutorialEvaluation = require('../../../../../lib/domain/models/TutorialEvaluation');

describe('Unit | Serializer | JSONAPI | tutorial-evaluation-serializer', function () {
  describe('#serialize', function () {
    context('when there is only tutorial evaluation', function () {
      it('should serialize', function () {
        // given
        const tutorialEvaluation = {
          id: 'tutorialEvaluationId',
          userId: 'userId',
          tutorialId: 'tutorialId',
          status: TutorialEvaluation.status.LIKED,
        };
        const expectedJsonTutorialEvaluation = {
          data: {
            type: 'tutorial-evaluations',
            id: 'tutorialEvaluationId',
            attributes: {
              'user-id': 'userId',
              'tutorial-id': 'tutorialId',
              status: TutorialEvaluation.status.LIKED,
            },
          },
        };
        // when
        const json = serializer.serialize(tutorialEvaluation);

        // then
        expect(json).to.be.deep.equal(expectedJsonTutorialEvaluation);
      });
    });
  });

  context('when there is user tutorial and tutorial', function () {
    it('should serialize', function () {
      // given
      const tutorialEvaluation = {
        id: 'tutorialEvaluationId',
        userId: 'userId',
        tutorial: domainBuilder.buildTutorial({ id: 'tutorialId' }),
      };

      const expectedJsonTutorialEvaluation = {
        data: {
          type: 'tutorial-evaluations',
          id: 'tutorialEvaluationId',
          attributes: {
            'user-id': 'userId',
          },
          relationships: {
            tutorial: {
              data: {
                id: 'tutorialId',
                type: 'tutorials',
              },
            },
          },
        },
        included: [
          {
            attributes: {
              duration: '00:01:30',
              format: 'video',
              id: 'tutorialId',
              link: 'https://youtube.fr',
              source: 'Youtube',
              title: 'Savoir regarder des vidéos youtube.',
            },
            id: 'tutorialId',
            type: 'tutorials',
          },
        ],
      };
      // when
      const json = serializer.serialize(tutorialEvaluation);

      // then
      expect(json).to.be.deep.equal(expectedJsonTutorialEvaluation);
    });
  });
});
