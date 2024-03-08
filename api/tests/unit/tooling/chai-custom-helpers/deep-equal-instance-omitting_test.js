import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | chai-custom-helpers | deepEqualInstanceOmitting', function () {
  it('should fail assertion when both objects are not of the same instance', function () {
    // given
    const answer = domainBuilder.buildAnswer();
    const campaign = domainBuilder.buildCampaign();
    const answerDTO = { ...answer };

    // when / then
    global.chaiErr(function () {
      expect(campaign).to.deepEqualInstanceOmitting(answer);
    }, "expected 'Campaign' to equal 'Answer'");
    global.chaiErr(function () {
      expect(answerDTO).to.deepEqualInstanceOmitting(answer);
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
    global.chaiErr(
      function () {
        expect(otherCompetence).to.deepEqualInstanceOmitting(competence);
      },
      {
        actual: otherCompetence,
        expected: competence,
        operator: 'deepStrictEqual',
      },
    );
    global.chaiErr(
      function () {
        expect(anotherCompetence).to.deepEqualInstanceOmitting(competence);
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
    expect(competence).to.deepEqualInstanceOmitting(competence);
    expect(competence).to.deepEqualInstanceOmitting(sameCompetence);
  });

  it('should succeed assertion when both objects have the same type and partial content', function () {
    // given
    const competence = domainBuilder.buildCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const competenceDifferentId = domainBuilder.buildCompetence({
      id: 456,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(competence).to.deepEqualInstanceOmitting(competenceDifferentId, ['id']);
  });
});
