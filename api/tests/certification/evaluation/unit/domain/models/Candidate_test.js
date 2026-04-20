import { expect } from 'chai';

import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Domain | Models | Candidate', function () {
  context('#get hasSubscribedToClea', function () {
    Object.values(Frameworks)
      .filter((framework) => framework !== Frameworks.CLEA)
      .forEach((framework) => {
        it(`returns false when framework is ${framework}`, function () {
          const candidate = domainBuilder.certification.evaluation.buildCandidate({ subscriptionFramework: framework });

          expect(candidate.hasSubscribedToClea).to.be.false;
        });
      });

    it('returns true when framework is CLEA', function () {
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        subscriptionFramework: Frameworks.CLEA,
      });

      expect(candidate.hasSubscribedToClea).to.be.true;
    });
  });

  context('#get hasSubscribedToSomethingElseButCore', function () {
    Object.values(Frameworks)
      .filter((framework) => framework !== Frameworks.CORE)
      .forEach((framework) => {
        it(`returns true when framework is ${framework}`, function () {
          const candidate = domainBuilder.certification.evaluation.buildCandidate({ subscriptionFramework: framework });

          expect(candidate.hasSubscribedToSomethingElseButCore).to.be.true;
        });
      });

    it('returns false when framework is CORE', function () {
      const candidate = domainBuilder.certification.evaluation.buildCandidate({
        subscriptionFramework: Frameworks.CORE,
      });

      expect(candidate.hasSubscribedToSomethingElseButCore).to.be.false;
    });
  });
});
