const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | chai-custom-helpers | deepEqualInstance', () => {

  it('should fail assertion when compared objects are not arrays', () => {
    try {
      expect([]).to.deepEqualOrderedInstances('coucou');
    } catch (err) {
      expect(err.message).to.equal('expected \'String\' to equal \'Array\'');
    }
    try {
      expect('coucou').to.deepEqualOrderedInstances([]);
    } catch (err) {
      expect(err.message).to.equal('expected \'String\' to equal \'Array\'');
    }
  });

  it('should fail assertion when compared arrays have not the same length', () => {
    try {
      expect([1, 2, 3]).to.deepEqualOrderedInstances([1, 2]);
    } catch (err) {
      expect(err.message).to.equal('expected 3 to equal 2');
    }
  });

  it('should fail assertion when compared values of array are not of the same instance', () => {
    try {
      expect([1]).to.deepEqualOrderedInstances(['coucou']);
    } catch (err) {
      expect(err.message).to.equal('expected \'Number\' to equal \'String\'');
    }
  });

  it('should fail assertion when compared values of array have not the same content', () => {
    try {
      expect([1]).to.deepEqualOrderedInstances([3]);
    } catch (err) {
      expect(err.message).to.equal('expected 1 to deeply equal 3');
    }
  });

  it('should succeed assertion when compared arrays have the same values in order', () => {
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
    const campaign = domainBuilder.buildCampaign();

    // then
    expect([badgePartnerCompetence, campaign]).to.deepEqualOrderedInstances([sameBadgePartnerCompetence, campaign]);
  });
});
