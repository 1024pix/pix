import { getFrameworkAndTargetProfilesHistory } from '../../../../../../src/certification/configuration/domain/usecases/get-framework-and-target-profiles-history.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | get-framework-and-target-profiles-history', function () {
  it('should return the framework history', async function () {
    // given
    const scope = Symbol('Scopes');

    const versionsRepository = {
      getFullFrameworkHistory: sinon.stub(),
    };

    const currentVersion = {
      id: 456,
      startDate: new Date('2024-01-01'),
      expirationDate: new Date('2025-02-02'),
      challengesCount: 2,
    };
    const previousVersion = {
      id: 123,
      startDate: new Date('2022-01-01'),
      expirationDate: new Date('2024-01-01'),
      challengesCount: 3,
    };

    versionsRepository.getFullFrameworkHistory.resolves([currentVersion, previousVersion]);

    // when
    const frameworkHistory = await getFrameworkAndTargetProfilesHistory({
      scope,
      versionsRepository,
    });

    // then
    expect(versionsRepository.getFullFrameworkHistory).to.have.been.calledOnceWithExactly({ scope });

    expect(frameworkHistory).to.deep.equal([currentVersion, previousVersion]);
  });
});
