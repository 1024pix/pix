const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/tutorial-evaluation-serializer');

describe('Unit | Serializer | JSONAPI | tutorial-evaluation-serializer', () => {

  describe('#serialize', () => {

    context('when there is only tutorial evaluation', () => {
      it('should serialize', () => {
        // given
        const tutorialEvaluation = {
          id: 'tutorialEvaluationId',
          userId: 'userId',
          tutorialId: 'tutorialId',
        };
        const expectedJsonTutorialEvaluation = {
          data: {
            type: 'tutorial-evaluations',
            id: 'tutorialEvaluationId',
            attributes: {
              'user-id': 'userId',
              'tutorial-id': 'tutorialId',
            }
          }
        };
        // when
        const json = serializer.serialize(tutorialEvaluation);

        // then
        expect(json).to.be.deep.equal(expectedJsonTutorialEvaluation);
      });
    });
  });

  context('when there is user tutorial and tutorial', () => {
    it('should serialize', () => {
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
              }
            },
          },
        },
        included: [{
          attributes: {
            duration: '00:01:30',
            format: 'video',
            id: 'tutorialId',
            'link': 'https://youtube.fr',
            'source': 'Youtube',
            'title': 'Savoir regarder des vidéos youtube.',
          },
          'id': 'tutorialId',
          'type': 'tutorials',
        }],
      };
      // when
      const json = serializer.serialize(tutorialEvaluation);

      // then
      expect(json).to.be.deep.equal(expectedJsonTutorialEvaluation);
    });
  });
});
