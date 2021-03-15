const { expect, domainBuilder } = require('../../../test-helper');
const { ReproducibilityRate } = require('../../../../lib/domain/models/ReproducibilityRate');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');

describe('Unit | Domain | Models | ReproducibilityRate', function() {
  it('is equal to 0% if no answers', () => {
    // when
    const reproducibilityRate = ReproducibilityRate.from({ answers: [] });
    // then
    expect(reproducibilityRate.value).to.equal(0);
  });
  it('is equal to 50% if 1 answer is correct and 1 is non-correct', () => {
    // given
    const answers = [
      domainBuilder.buildAnswer({ result: AnswerStatus.OK }),
      domainBuilder.buildAnswer({ result: AnswerStatus.KO }),
    ];
    // when
    const reproducibilityRate = ReproducibilityRate.from({ answers });
    // then
    expect(reproducibilityRate.value).to.equal(50);
  });

  it('is equal to 33% is 1 answeer is correct and 2 are non-correct', () => {
    // given
    const answers = [
      domainBuilder.buildAnswer({ result: AnswerStatus.OK }),
      domainBuilder.buildAnswer({ result: AnswerStatus.TIMEDOUT }),
      domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED }),
    ];
    // when
    const reproducibilityRate = ReproducibilityRate.from({ answers });
    // then
    expect(reproducibilityRate.value).to.equal(33);
  });
});
