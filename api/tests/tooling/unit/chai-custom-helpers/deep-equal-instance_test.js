import { expect } from '../../../test-helper.js';
import { expectChaiError } from '../../../tooling/chai-custom-helpers/chai-custom-test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Unit | chai-custom-helpers | deepEqualInstance', function () {
  it('should fail assertion when both objects are not of the same instance', function () {
    // given
    const answer = domainBuilder.buildAnswer();
    const campaign = domainBuilder.buildCampaign();
    const answerDTO = { ...answer };

    // when / then
    expectChaiError(function () {
      expect(campaign).to.deepEqualInstance(answer);
    }, "expected 'Campaign' to equal 'Answer'");
    expectChaiError(function () {
      expect(answerDTO).to.deepEqualInstance(answer);
    }, "expected 'Object' to equal 'Answer'");
  });

  it('should fail assertion when both objects have not the same content', function () {
    // given
    const competence = domainBuilder.buildCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const otherCompetence = domainBuilder.buildCompetence({
      id: 124,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const anotherCompetence = domainBuilder.buildCompetence({
      id: 123,
      name: 'name',
      skillIds: ['recUVW', 'recXYZ'],
    });

    // when/then
    expectChaiError(
      function () {
        expect(otherCompetence).to.deepEqualInstance(competence);
      },
      {
        actual: otherCompetence,
        expected: competence,
        operator: 'deepStrictEqual',
      },
    );
    expectChaiError(
      function () {
        expect(anotherCompetence).to.deepEqualInstance(competence);
      },
      {
        actual: anotherCompetence,
        expected: competence,
        operator: 'deepStrictEqual',
      },
    );
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', function () {
    // given
    const competence = domainBuilder.buildCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const sameCompetence = domainBuilder.buildCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(competence).to.deepEqualInstance(competence);
    expect(competence).to.deepEqualInstance(sameCompetence);
  });
});
