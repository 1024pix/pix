import sinon from 'sinon';

import { getFrameworkHistory } from '../../../../../../src/certification/configuration/domain/usecases/get-framework-history.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | get-framework-history', function () {
  let versionRepository;

  beforeEach(function () {
    versionRepository = {
      getFrameworkHistory: sinon.stub(),
    };
  });

  context('when framework is CLEA', function () {
    it('returns an empty array', async function () {
      const frameworkHistory = await getFrameworkHistory({
        framework: Frameworks.CLEA,
        versionRepository,
      });

      expect(versionRepository.getFrameworkHistory).to.not.have.been.called;
      expect(frameworkHistory).to.deep.equal([]);
    });
  });

  context('when framework is not CLEA', function () {
    Object.values(Frameworks)
      .filter((framework) => framework !== Frameworks.CLEA)
      .forEach((framework) => {
        it(`should return the framework history of ${framework}`, async function () {
          const currentVersion = { id: 456, startDate: new Date('2024-01-01'), expirationDate: new Date('2025-02-02') };
          const previousVersion = {
            id: 123,
            startDate: new Date('2022-01-01'),
            expirationDate: new Date('2024-01-01'),
          };

          versionRepository.getFrameworkHistory.resolves([currentVersion, previousVersion]);

          // when
          const frameworkHistory = await getFrameworkHistory({
            framework,
            versionRepository,
          });

          // then
          expect(versionRepository.getFrameworkHistory).to.have.been.calledOnceWithExactly({ scope: framework });
          expect(frameworkHistory).to.deep.equal([currentVersion, previousVersion]);
        });
      });
  });
});
