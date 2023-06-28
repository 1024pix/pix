import { expect, sinon } from '../../../test-helper.js';
import { lcms } from '../../../../lib/shared/infrastructure/lcms.js';
import { learningContentCache } from '../../../../lib/shared/infrastructure/caches/learning-content-cache.js';
import { createLcmsRelease } from '../../../../lib/shared/domain/usecases/create-lcms-release.js';

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
