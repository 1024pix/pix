import { deleteOrganizationPlaceLot } from '../../../../../../src/prescription/organization-place/domain/usecases/delete-organization-place-lot.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | delete-organization-place-lot', function () {
  it('should delete the organization place lot', async function () {
    // given
    const organizationPlacesLotRepository = {
      remove: sinon.stub(),
      get: sinon.stub(),
    };

    // when
    await deleteOrganizationPlaceLot({
      organizationPlaceId: 999,
      userId: 666,
      organizationPlacesLotRepository,
    });

    // then
    expect(organizationPlacesLotRepository.get).to.have.been.calledWithExactly(999);
    expect(organizationPlacesLotRepository.remove).to.have.been.calledWithExactly({ id: 999, deletedBy: 666 });
  });

  it('should not call sofDelete given wrong organizationId', async function () {
    // given
    const organizationPlacesLotRepository = {
      remove: sinon.stub(),
      get: sinon.stub(),
    };
    organizationPlacesLotRepository.get.withArgs(999).rejects(new NotFoundError());

    // when
    const response = await catchErr(deleteOrganizationPlaceLot)({
      organizationPlaceId: 999,
      userId: 666,
      organizationPlacesLotRepository,
    });

    // then
    expect(response).to.be.instanceOf(NotFoundError);
    expect(organizationPlacesLotRepository.remove).to.not.have.been.called;
  });
});
