import { main } from '../../../../../scripts/certification/next-gen/convert-centers-to-v3.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Integration | Scripts | Certification | convert-centers-to-v3', function () {
  it('should save call convertSessionsWithNoCoursesToV3 usecase', async function () {
    const dependencies = {
      convertSessionsWithNoCoursesToV3: sinon.stub().resolves(),
    };
    await main({ dependencies });

    // then
    expect(dependencies.convertSessionsWithNoCoursesToV3).to.have.been.calledOnce;
  });
});
