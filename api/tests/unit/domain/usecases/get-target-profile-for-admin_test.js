const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | UseCase | get-target-profile-for-admin', function () {
  it('should get target profile in new format when relevant', async function () {
    // given
    const targetProfileForAdminRepository = {
      isNewFormat: sinon.stub(),
      getAsNewFormat: sinon.stub(),
      getAsOldFormat: sinon.stub(),
    };
    const targetProfileNewFormat = Symbol('targetProfileNewFormat');
    targetProfileForAdminRepository.isNewFormat.withArgs(123).resolves(true);
    targetProfileForAdminRepository.getAsNewFormat.withArgs({ id: 123 }).resolves(targetProfileNewFormat);
    targetProfileForAdminRepository.getAsOldFormat.throws(new Error('I should not be called'));

    // when
    const result = await usecases.getTargetProfileForAdmin({
      targetProfileId: 123,
      targetProfileForAdminRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfileNewFormat);
  });

  it('should get target profile in old format when relevant', async function () {
    // given
    const targetProfileForAdminRepository = {
      isNewFormat: sinon.stub(),
      getAsNewFormat: sinon.stub(),
      getAsOldFormat: sinon.stub(),
    };
    const targetProfileOldFormat = Symbol('targetProfileOldFormat');
    targetProfileForAdminRepository.isNewFormat.withArgs(123).resolves(false);
    targetProfileForAdminRepository.getAsNewFormat.throws(new Error('I should not be called'));
    targetProfileForAdminRepository.getAsOldFormat.withArgs({ id: 123 }).resolves(targetProfileOldFormat);

    // when
    const result = await usecases.getTargetProfileForAdmin({
      targetProfileId: 123,
      targetProfileForAdminRepository,
    });

    // then
    expect(result).to.deep.equal(targetProfileOldFormat);
  });
});
