const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | chai-custom-helpers | deepEqualInstance', () => {

  it('should fail assertion when both objects are not of the same instance', () => {
    // given
    const answer = domainBuilder.buildAnswer();
    const campaign = domainBuilder.buildCampaign();
    const answerDTO = { ...answer };

    // then
    try {
      expect(campaign).to.deepEqualInstance(answer);
    } catch (err) {
      expect(err.message).to.equal('expected \'Campaign\' to equal \'Answer\'');
    }
    try {
      expect(answerDTO).to.deepEqualInstance(answer);
    } catch (err) {
      expect(err.message).to.equal('expected \'Object\' to equal \'Answer\'');
    }
  });

  it('should fail assertion when both objects have not the same content', () => {
    // given
    const badgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: [
        'recABC',
        'recDEF',
      ],
    });
    const otherBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 124,
      name: 'someName',
      skillIds: [
        'recABC',
        'recDEF',
      ],
    });
    const anotherBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'name',
      skillIds: [
        'recUVW',
        'recXYZ',
      ],
    });

    // then
    try {
      expect(otherBadgePartnerCompetence).to.deepEqualInstance(badgePartnerCompetence);
    } catch (err) {
      expect(err.actual).to.deep.equal(otherBadgePartnerCompetence);
      expect(err.expected).to.deep.equal(badgePartnerCompetence);
      expect(err.operator).to.equal('deepStrictEqual');
    }
    try {
      expect(anotherBadgePartnerCompetence).to.deepEqualInstance(badgePartnerCompetence);
    } catch (err) {
      expect(err.actual).to.deep.equal(anotherBadgePartnerCompetence);
      expect(err.expected).to.deep.equal(badgePartnerCompetence);
      expect(err.operator).to.equal('deepStrictEqual');
    }
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', () => {
    // given
    const badgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: [
        'recABC',
        'recDEF',
      ],
    });
    const sameBadgePartnerCompetence = domainBuilder.buildBadgePartnerCompetence({
      id: 123,
      name: 'someName',
      skillIds: [
        'recABC',
        'recDEF',
      ],
    });

    // then
    expect(badgePartnerCompetence).to.deepEqualInstance(badgePartnerCompetence);
    expect(badgePartnerCompetence).to.deepEqualInstance(sameBadgePartnerCompetence);
  });
});
