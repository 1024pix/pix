import { expect, sinon } from '../../../test-helper';
import lcms from '../../../../lib/infrastructure/lcms';
import cache from '../../../../lib/infrastructure/caches/learning-content-cache';
import createLcmsRelease from '../../../../lib/domain/usecases/create-lcms-release';

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
    sinon.stub(cache, 'set').resolves();

    // when
    await createLcmsRelease();

    // then
    expect(cache.set).to.have.been.calledWith(learningContent);
  });
});
