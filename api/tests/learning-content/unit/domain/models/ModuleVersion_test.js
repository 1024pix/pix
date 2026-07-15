import { expect } from 'chai';

import { ModuleVersion } from '../../../../../src/learning-content/domain/models/ModuleVersion.js';

describe('LearningContent | Unit | Domain | Models | ModuleVersion', function () {
  context('#isGreaterThan', function () {
    [
      { versionA: '1.0', versionB: '2.0', expectedGreaterThan: false },
      { versionA: '3.5', versionB: '3.4', expectedGreaterThan: true },
      { versionA: '3.4', versionB: '3.5', expectedGreaterThan: false },
      { versionA: '2.5', versionB: '3.4', expectedGreaterThan: false },
      { versionA: '2.2', versionB: '2.2', expectedGreaterThan: false },
      { versionA: '2.0', versionB: '1.0', expectedGreaterThan: true },
    ].forEach(({ versionA, versionB, expectedGreaterThan }) => {
      describe(`when versionA is ${versionA} and versionB is ${versionB}`, function () {
        it(`should return ${expectedGreaterThan}`, function () {
          // given
          const moduleVersion = new ModuleVersion({ version: versionA });

          // when
          const result = moduleVersion.isGreaterThan(versionB);

          // then
          expect(result).to.equal(expectedGreaterThan);
        });
      });
    });
  });
});
