import * as randomDataService from '../../../../../src/shared/domain/services/random-data-service.js';
import { sinon, expect, domainBuilder } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Services | RandomData', function () {
  let generator;
  let randomix;

  beforeEach(function () {
    generator = {
      integer: sinon.stub(),
    };
    randomix = {
      getGenerator: sinon.stub().returns(generator),
    };
  });

  describe('#generateChallengeVariables', function () {
    it("should generate challenge's instruction variables", function () {
      // given
      const instruction = `---
variables:
- name: foo
  type: integer
  params:
    min: 0
    max: 1000
---
Est-ce que {% $foo %} c'est beaucoup ?`;
      const locale = 'fr';
      const challenge = domainBuilder.buildChallenge({ instruction, locales: [locale] });
      const assessmentId = 937625;

      generator.integer.withArgs({ min: 0, max: 1000 }).returns(666);

      // when
      randomDataService.generateChallengeVariables({ challenge, assessmentId }, { randomix });

      // then
      expect(challenge.instruction.variables).to.deep.equal({ foo: 666 });
      expect(randomix.getGenerator).to.have.been.calledOnceWith({ locale, seed: assessmentId });
      expect(generator.integer).to.have.been.calledOnceWith({ min: 0, max: 1000 });
    });
  });
});
