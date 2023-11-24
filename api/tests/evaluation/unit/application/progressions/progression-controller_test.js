import { expect, sinon, domainBuilder, hFake } from '../../../../test-helper.js';
import { evaluationUsecases as usecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { progressionController } from '../../../../../src/evaluation/application/progressions/progression-controller.js';

describe('Unit | Controller | progression-controller', function () {
  const userId = 60;

  describe('#get', function () {
    const progressionId = 'progression-1234';

    const request = {
      params: {
        id: progressionId,
      },
      auth: { credentials: { userId } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'getProgression');
    });

    context('if assessment exists', function () {
      let progression;

      beforeEach(function () {
        progression = domainBuilder.buildProgression({ knowledgeElements: [], isProfileCompleted: true });
      });

      context('and belongs to current user', function () {
        it('should return the serialized progression', async function () {
          // given
          const serializedProgression = {
            data: {
              id: progressionId,
              attributes: {
                'completion-rate': 1,
              },
              type: 'progressions',
            },
          };
          usecases.getProgression.resolves(progression);

          // when
          const response = await progressionController.get(request, hFake);

          // Then
          expect(usecases.getProgression).to.have.been.calledWithExactly({
            progressionId,
            userId,
          });

          expect(response).to.deep.equal(serializedProgression);
        });
      });
    });
  });
});
