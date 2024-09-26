import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-campaign-by-code', function () {
  let code,
    organizationId,
    campaignToJoinRepositoryStub,
    campaignToJoinModelStub,
    organizationLearnerImportFormatRepositoryStub;

  beforeEach(function () {
    code = Symbol('CODE');
    organizationId = Symbol('OrganizationId');
    campaignToJoinRepositoryStub = {
      getByCode: sinon.stub(),
    };

    campaignToJoinModelStub = {
      setReconciliationFields: sinon.stub(),
    };

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };
  });

  it('should return the campaign to join', async function () {
    // given
    campaignToJoinRepositoryStub.getByCode.withArgs({ code }).resolves(campaignToJoinModelStub);

    // when
    const actualCampaignToJoin = await usecases.getCampaignByCode({
      code,
      campaignToJoinRepository: campaignToJoinRepositoryStub,
      organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
    });

    // then
    expect(actualCampaignToJoin).to.deep.equal(campaignToJoinModelStub);
    expect(organizationLearnerImportFormatRepositoryStub.get.notCalled).to.be.true;
  });

  it('should call import format when isRestricted Campaign', async function () {
    // given
    campaignToJoinModelStub.isRestricted = true;
    campaignToJoinModelStub.organizationId = organizationId;

    campaignToJoinRepositoryStub.getByCode.withArgs({ code }).resolves(campaignToJoinModelStub);
    organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(null);

    // when
    await usecases.getCampaignByCode({
      code,
      campaignToJoinRepository: campaignToJoinRepositoryStub,
      organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
    });

    // then
    expect(organizationLearnerImportFormatRepositoryStub.get.called).to.be.true;
    expect(campaignToJoinModelStub.setReconciliationFields.notCalled).to.be.true;
  });

  it('should set reconciliationField format when exising config', async function () {
    // given
    const reconciliationFields = Symbol('reconciliationFields');
    campaignToJoinModelStub.isRestricted = true;
    campaignToJoinModelStub.organizationId = organizationId;

    campaignToJoinRepositoryStub.getByCode.withArgs({ code }).resolves(campaignToJoinModelStub);
    organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves({ reconciliationFields });
    campaignToJoinModelStub.setReconciliationFields.withArgs(reconciliationFields);

    // when
    await usecases.getCampaignByCode({
      code,
      campaignToJoinRepository: campaignToJoinRepositoryStub,
      organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
    });

    // then
    expect(campaignToJoinModelStub.setReconciliationFields.called).to.be.true;
  });
});
