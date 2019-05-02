const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const progressionController = require('../../../../lib/application/progressions/progression-controller');

describe('Unit | Controller | progression-controller', () => {
  const userId = 60;

  describe('#get', () => {

    const progressionId = 'progression-1234';

    const request = {
      params: {
        id: progressionId,
      },
      auth: { credentials: { userId } },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getProgression');
    });

    context('if assessment exists', () => {

      let progression;

      beforeEach(() => {
        progression = domainBuilder.buildProgression({ knowledgeElements: [], isProfileCompleted: true });
      });

      context('and belongs to current user', () => {

        it('should return the serialized progression', async () => {
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
