import { Accessibility } from '../../../../../../src/certification/evaluation/domain/models/CalibratedChallenge.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | CalibratedChallenge', function () {
  describe('#isAccessible', function () {
    [
      { blindnessCompatibility: Accessibility.OK, colorBlindnessCompatibility: Accessibility.OK, isAccessible: true },
      { blindnessCompatibility: Accessibility.OK, colorBlindnessCompatibility: Accessibility.RAS, isAccessible: true },
      { blindnessCompatibility: Accessibility.RAS, colorBlindnessCompatibility: Accessibility.OK, isAccessible: true },
      { blindnessCompatibility: Accessibility.RAS, colorBlindnessCompatibility: Accessibility.RAS, isAccessible: true },
      { blindnessCompatibility: Accessibility.OK, colorBlindnessCompatibility: 'KO', isAccessible: false },
      { blindnessCompatibility: Accessibility.OK, colorBlindnessCompatibility: 'autre chose', isAccessible: false },
      { blindnessCompatibility: 'autre chose', colorBlindnessCompatibility: Accessibility.OK, isAccessible: false },
      { blindnessCompatibility: 'KO', colorBlindnessCompatibility: Accessibility.RAS, isAccessible: false },
    ].forEach(({ blindnessCompatibility, colorBlindnessCompatibility, isAccessible }) => {
      context(
        `when blindnessCompatibility is ${blindnessCompatibility} and colorBlindnessCompatibility is ${colorBlindnessCompatibility}`,
        function () {
          it(`returns ${isAccessible}`, function () {
            // given
            const calibratedChallenge = domainBuilder.certification.evaluation.buildCalibratedChallenge({
              blindnessCompatibility,
              colorBlindnessCompatibility,
            });

            // when then
            expect(calibratedChallenge.isAccessible).to.equal(isAccessible);
          });
        },
      );
    });
  });
});
