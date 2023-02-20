import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/tutorial-evaluation-serializer';
import TutorialEvaluation from '../../../../../lib/domain/models/TutorialEvaluation';

describe('Unit | Serializer | JSONAPI | tutorial-evaluation-serializer', function () {
  describe('#serialize', function () {
    context('when there is only tutorial evaluation', function () {
      it('should serialize', function () {
        // given
        const tutorialEvaluation = {
          id: 'tutorialEvaluationId',
          userId: 'userId',
          tutorialId: 'tutorialId',
          status: TutorialEvaluation.statuses.LIKED,
        };
        const expectedJsonTutorialEvaluation = {
          data: {
            type: 'tutorial-evaluations',
            id: 'tutorialEvaluationId',
            attributes: {
              'user-id': 'userId',
              'tutorial-id': 'tutorialId',
              status: TutorialEvaluation.statuses.LIKED,
            },
          },
        };
        // when
        const json = serializer.serialize(tutorialEvaluation);

        // then
        expect(json).to.be.deep.equal(expectedJsonTutorialEvaluation);
      });
    });

    context('when there is tutorial evaluation and tutorial', function () {
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

  describe('#deserialize', function () {
    it('should convert JSON API data into a TutorialEvaluation model object', function () {
      // given
      const jsonTutorialEvaluation = {
        data: {
          id: 123,
          type: 'tutorial-evaluations',
          attributes: {
            'user-id': 456,
            'tutorial-id': 'tutorial123',
            status: 'LIKED',
          },
          relationships: {},
        },
      };

      // when
      const tutorialEvaluation = serializer.deserialize(jsonTutorialEvaluation);

      // then
      expect(tutorialEvaluation).to.be.instanceOf(TutorialEvaluation);
      expect(tutorialEvaluation.id).to.be.equal(123);
      expect(tutorialEvaluation.userId).to.be.equal(456);
      expect(tutorialEvaluation.tutorialId).to.be.equal('tutorial123');
      expect(tutorialEvaluation.status).to.be.equal(TutorialEvaluation.statuses.LIKED);
    });
  });
});
