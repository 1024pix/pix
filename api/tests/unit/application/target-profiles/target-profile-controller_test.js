const { expect, sinon, hFake } = require('../../../test-helper');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | target-profile-controller', function() {

  describe('#updateTargetProfileName', function() {

    let request;

    beforeEach(function() {

      sinon.stub(usecases, 'updateTargetProfileName');

      request = {
        params: {
          id: '123',
        },
        payload: {
          data: {
            attributes: {
              name: 'Pixer123',
            },
          },
        },
      };
    });

    context('successful case', function() {

      it('should succeed', async function() {
        // when
        const response = await targetProfileController.updateTargetProfile(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });

      it('should update target profile name', async function() {
        // when
        await targetProfileController.updateTargetProfile(request, hFake);

        // then
        expect(usecases.updateTargetProfileName).to.have.been.calledOnce;
        expect(usecases.updateTargetProfileName).to.have.been.calledWithMatch({ id: 123, name: 'Pixer123' });
      });
    });
  });
});
