import { expect, sinon, domainBuilder, hFake } from '../../../test-helper';
import usecases from '../../../../lib/domain/usecases';
import progressionController from '../../../../lib/application/progressions/progression-controller';

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
          expect(usecases.getProgression).to.have.been.calledWith({
            progressionId,
            userId,
          });

          expect(response).to.deep.equal(serializedProgression);
        });
      });
    });
  });
});
