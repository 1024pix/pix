import sinon from 'sinon';

import { getFrameworkHistory } from '../../../../../../src/certification/configuration/domain/usecases/get-framework-history.js';

describe('Certification | Configuration | Unit | UseCase | get-framework-history', function () {
  it('should return the framework history', async function () {
    // given
    const scope = Symbol('Scopes');

    const versionRepository = {
      getFrameworkHistory: sinon.stub(),
    };

    const currentVersion = { id: 456, startDate: new Date('2024-01-01'), expirationDate: new Date('2025-02-02') };
    const previousVersion = { id: 123, startDate: new Date('2022-01-01'), expirationDate: new Date('2024-01-01') };

    versionRepository.getFrameworkHistory.resolves([currentVersion, previousVersion]);

    // when
    const frameworkHistory = await getFrameworkHistory({
      scope,
      versionRepository,
    });

    // then
    expect(versionRepository.getFrameworkHistory).to.have.been.calledOnceWithExactly({ scope });

    expect(frameworkHistory).to.deep.equal([currentVersion, previousVersion]);
  });
});
