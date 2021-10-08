const { expect, domainBuilder } = require('../../../test-helper');

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
    const badgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const otherBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 124,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const anotherBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'name',
      skillIds: ['recUVW', 'recXYZ'],
    });

    // when/then
    global.chaiErr(
      function () {
        expect(otherBadgePartnerCompetence).to.deepEqualInstanceOmitting(badgePartnerCompetence);
      },
      {
        actual: otherBadgePartnerCompetence,
        expected: badgePartnerCompetence,
        operator: 'deepStrictEqual',
      }
    );
    global.chaiErr(
      function () {
        expect(anotherBadgePartnerCompetence).to.deepEqualInstanceOmitting(badgePartnerCompetence);
      },
      {
        actual: anotherBadgePartnerCompetence,
        expected: badgePartnerCompetence,
        operator: 'deepStrictEqual',
      }
    );
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', function () {
    // given
    const badgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const sameBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(badgePartnerCompetence).to.deepEqualInstanceOmitting(badgePartnerCompetence);
    expect(badgePartnerCompetence).to.deepEqualInstanceOmitting(sameBadgePartnerCompetence);
  });

  it('should succeed assertion when both objects have the same type and partial content', function () {
    // given
    const badgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const badgePartnerCompetenceDifferentId = domainBuilder.buildBadgePartnerCompetence({
      id: 456,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });

    // then
    expect(badgePartnerCompetence).to.deepEqualInstanceOmitting(badgePartnerCompetenceDifferentId, ['id']);
  });
});
