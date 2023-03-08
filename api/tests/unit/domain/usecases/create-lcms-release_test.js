const { expect, sinon } = require('../../../test-helper');
const lcms = require('../../../../lib/infrastructure/lcms');
const { learningContentCache } = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createLcmsRelease = require('../../../../lib/domain/usecases/create-lcms-release');

describe('Unit | UseCase | create-lcms-release', function () {
  it('call the createRelease on the lcms module', async function () {
    // given
    sinon.stub(lcms, 'createRelease').resolves();

    // when
    await createLcmsRelease();

    // then
    expect(lcms.createRelease).to.have.been.called;
  });

  it('should update cache', async function () {
    // given
    const learningContent = Symbol('learning-content');
    sinon.stub(lcms, 'createRelease').resolves(learningContent);
    sinon.stub(learningContentCache, 'set').resolves();

    // when
    await createLcmsRelease();

    // then
    expect(learningContentCache.set).to.have.been.calledWith(learningContent);
  });
});
