import { organizationLearnersController } from '../../../../../src/prescription/learner-management/application/organization-learners-controller.js';
import { usecases } from '../../../../../src/prescription/learner-management/domain/usecases/index.js';
import { ApplicationTransaction } from '../../../../../src/prescription/shared/infrastructure/ApplicationTransaction.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Learner Management | organization-learner-controller', function () {
  let saveOrganizationLearnersFileStub, sendOrganizationLearnersFileStub, validateOrganizationLearnersFileStub;

  beforeEach(function () {
    sinon.stub(ApplicationTransaction, 'execute').callsFake((lambda) => {
      return lambda();
    });

    saveOrganizationLearnersFileStub = sinon.stub(usecases, 'saveOrganizationLearnersFile');
    sendOrganizationLearnersFileStub = sinon.stub(usecases, 'sendOrganizationLearnersFile');
    validateOrganizationLearnersFileStub = sinon.stub(usecases, 'validateOrganizationLearnersFile');
  });

  it('should call usecases in correct order', async function () {
    const userId = Symbol('userId');
    const organizationId = Symbol('orgnaizationId');
    const payload = Symbol('payload');
    const request = {
      auth: { credentials: { userId } },
      params: { organizationId },
      payload,
    };

    const response = await organizationLearnersController.importOrganizationLearnerFromFeature(request, hFake);

    expect(ApplicationTransaction.execute.called, 'ApplicationTransaction.execute').to.be.true;
    expect(
      sinon.assert.callOrder(
        sendOrganizationLearnersFileStub,
        validateOrganizationLearnersFileStub,
        saveOrganizationLearnersFileStub,
      ),
    ).to.not.throws;
    expect(
      usecases.sendOrganizationLearnersFile.calledWithExactly({ payload, organizationId, userId }),
      'sendOrganizationLearnerFile',
    ).to.be.true;
    expect(
      usecases.validateOrganizationLearnersFile.calledWithExactly({ organizationId }),
      'validateOrganizationLearnerFile',
    ).to.be.true;
    expect(usecases.saveOrganizationLearnersFile.calledWithExactly({ organizationId }), 'saveOrganizationLearnerFile')
      .to.be.true;

    expect(response.statusCode).to.be.equal(204);
  });
});
