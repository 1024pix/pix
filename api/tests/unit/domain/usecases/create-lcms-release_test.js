const { expect, sinon } = require('../../../test-helper');
const lcms = require('../../../../lib/infrastructure/lcms');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
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

  it('should update cache', async () => {
    // given
    const learningContent = Symbol('learning-content');
    sinon.stub(lcms, 'createRelease').resolves(learningContent);
    sinon.stub(cache, 'set').resolves();

    // when
    await createLcmsRelease();

    // then
    expect(cache.set).to.have.been.calledWith('LearningContent', learningContent);
  });
});
