const { expect, sinon } = require('../../../test-helper');
const lcms = require('../../../../lib/infrastructure/lcms');
const createLcmsRelease = require('../../../../lib/domain/usecases/create-lcms-release');

describe('Unit | UseCase | create-lcms-release', () => {
  it('call the createRelease on the lcms module', async () => {
    // given
    sinon.stub(lcms, 'createRelease').resolves();

    // when
    await createLcmsRelease();

    // then
    expect(lcms.createRelease).to.have.been.called;
  });
});
