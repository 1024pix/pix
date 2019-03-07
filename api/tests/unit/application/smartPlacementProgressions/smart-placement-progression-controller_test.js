const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const smartPlacementProgressionController = require('../../../../lib/application/smartPlacementProgressions/smart-placement-progression-controller');

describe('Unit | Controller | smart-placement-progression-controller', () => {
  const userId = 60;

  describe('#get', () => {

    const smartPlacementProgressionId = 'smart-placement-progression-1234';

    const request = {
      params: {
        id: smartPlacementProgressionId,
      },
      auth: { credentials: { userId } },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'getSmartPlacementProgression');
    });

    context('if assessment exists', () => {

      let smartPlacementProgression;

      beforeEach(() => {
        smartPlacementProgression = domainBuilder.buildSmartPlacementProgression({ knowledgeElements: [], isProfileCompleted: true });
      });

      context('and belongs to current user', () => {

        it('should return the serialized smartPlacementProgression', async () => {
          // given
          const serializedSmartPlacementProgression = {
            data: {
              id: smartPlacementProgressionId,
              attributes: {
                'validation-rate': 0,
                'completion-rate': 1,
              },
              type: 'smart-placement-progressions',
            },
          };
          usecases.getSmartPlacementProgression.resolves(smartPlacementProgression);

          // when
          const response = await smartPlacementProgressionController.get(request, hFake);

          // Then
          expect(usecases.getSmartPlacementProgression).to.have.been.calledWith({
            smartPlacementProgressionId,
            userId,
          });

          expect(response).to.deep.equal(serializedSmartPlacementProgression);
        });
      });
    });
  });
});
