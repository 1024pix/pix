import { expect } from 'chai';

import {
  Frameworks,
  hasCoreScope,
  isEduFramework,
  toScope,
} from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';

describe('Unit | Certification | Configuration | Domain | Models | Frameworks', function () {
  it('should contain all supported certification frameworks', function () {
    expect(Frameworks.CORE).to.equal('CORE');
    expect(Frameworks.DROIT).to.equal('DROIT');
    expect(Frameworks.EDU_1ER_DEGRE).to.equal('EDU_1ER_DEGRE');
    expect(Frameworks.EDU_2ND_DEGRE).to.equal('EDU_2ND_DEGRE');
    expect(Frameworks.EDU_CPE).to.equal('EDU_CPE');
    expect(Frameworks.PRO_SANTE).to.equal('PRO_SANTE');
    expect(Frameworks.CLEA).to.equal('CLEA');

    const frameworkValues = Object.values(Frameworks);
    expect(frameworkValues).to.have.lengthOf(7);
  });

  context('#isEduFramework', function () {
    [
      { framework: Frameworks.EDU_1ER_DEGRE, result: true },
      { framework: Frameworks.EDU_2ND_DEGRE, result: true },
      { framework: Frameworks.EDU_CPE, result: true },
      { framework: Frameworks.CORE, result: false },
      { framework: Frameworks.CLEA, result: false },
      { framework: Frameworks.DROIT, result: false },
      { framework: Frameworks.PRO_SANTE, result: false },
    ].forEach(({ framework, result }) => {
      it(`should return ${result} when framework is ${framework}`, function () {
        expect(isEduFramework(framework)).to.equal(result);
      });
    });
  });

  context('#hasCoreScope', function () {
    [
      { framework: Frameworks.CORE, result: true },
      { framework: Frameworks.CLEA, result: true },
      { framework: Frameworks.DROIT, result: false },
      { framework: Frameworks.EDU_1ER_DEGRE, result: false },
      { framework: Frameworks.EDU_2ND_DEGRE, result: false },
      { framework: Frameworks.EDU_CPE, result: false },
      { framework: Frameworks.PRO_SANTE, result: false },
    ].forEach(({ framework, result }) => {
      it(`should return ${result} when framework is ${framework}`, function () {
        expect(hasCoreScope(framework)).to.equal(result);
      });
    });
  });

  context('#toScope', function () {
    [
      { framework: Frameworks.CORE, result: SCOPES.CORE },
      { framework: Frameworks.CLEA, result: SCOPES.CORE },
      { framework: Frameworks.DROIT, result: SCOPES.PIX_PLUS_DROIT },
      { framework: Frameworks.EDU_1ER_DEGRE, result: SCOPES.PIX_PLUS_EDU_1ER_DEGRE },
      { framework: Frameworks.EDU_2ND_DEGRE, result: SCOPES.PIX_PLUS_EDU_2ND_DEGRE },
      { framework: Frameworks.EDU_CPE, result: SCOPES.PIX_PLUS_EDU_CPE },
      { framework: Frameworks.PRO_SANTE, result: SCOPES.PIX_PLUS_PRO_SANTE },
    ].forEach(({ framework, result }) => {
      it(`should return ${result} when framework is ${framework}`, function () {
        expect(toScope(framework)).to.equal(result);
      });
    });

    it('throws an error when framework is not supported', function () {
      expect(() => toScope('coucou')).to.throw('Framework "coucou" is not supported.');
    });
  });
});
