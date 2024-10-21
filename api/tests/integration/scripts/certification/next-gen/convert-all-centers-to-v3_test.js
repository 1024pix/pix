import { main } from '../../../../../scripts/certification/next-gen/convert-all-centers-to-v3.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Integration | Scripts | Certification | convert-centers-to-v3', function () {
  it('should call convertSessionsWithNoCoursesToV3 usecase', async function () {
    const dependencies = {
      convertSessionsWithNoCoursesToV3: sinon.stub().resolves(),
      convertCentersToV3: sinon.stub().resolves(),
    };
    const isDryRun = Symbol('isDryRun');
    await main({ isDryRun, dependencies });

    // then
    expect(dependencies.convertSessionsWithNoCoursesToV3).to.have.been.calledOnceWith({ isDryRun });
  });

  it('should call convertCentersToV3 usecase', async function () {
    const dependencies = {
      convertSessionsWithNoCoursesToV3: sinon.stub().resolves(),
      convertCentersToV3: sinon.stub().resolves(),
    };
    const isDryRun = Symbol('isDryRun');
    const preservedCenterIds = Symbol('preservedCenterIds');
    await main({ isDryRun, preservedCenterIds, dependencies });

    // then
    expect(dependencies.convertCentersToV3).to.have.been.calledOnceWith({
      isDryRun,
      preservedCenterIds,
    });
  });
});
