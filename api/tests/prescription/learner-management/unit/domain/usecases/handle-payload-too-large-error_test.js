import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { handlePayloadTooLargeError } from '../../../../../../src/prescription/learner-management/domain/usecases/handle-payload-too-large-error.js';
import { PayloadTooLargeError } from '../../../../../../src/shared/application/http-errors.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | Organization Learners Management | Handle Payload Too Large Error', function () {
  let organizationImportRepository;

  beforeEach(function () {
    organizationImportRepository = {
      save: sinon.stub(),
    };
    sinon.stub(OrganizationImport, 'create');
  });

  it('should save payload too large error and throw it', async function () {
    // given
    const userId = 777;
    const organizationId = 111;
    const organizationImportStub = { upload: sinon.stub() };
    OrganizationImport.create.returns(organizationImportStub);
    // when
    const error = await catchErr(handlePayloadTooLargeError)({
      organizationId,
      userId,
      organizationImportRepository,
    });

    // then
    expect(organizationImportRepository.save).to.have.been.calledWithExactly(organizationImportStub);
    expect(error).to.be.an.instanceof(PayloadTooLargeError);
  });
});
