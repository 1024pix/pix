const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | chai-custom-helpers | deepEqualArray', () => {

  it('should fail assertion when compared objects are not arrays', () => {
    global.chaiErr(function() {
      expect([]).to.deepEqualArray('coucou');
    }, 'expected \'String\' to equal \'Array\'');
    global.chaiErr(function() {
      expect('coucou').to.deepEqualArray([]);
    }, 'expected \'String\' to equal \'Array\'');
  });

  it('should fail assertion when compared arrays have not the same length', () => {
    global.chaiErr(function() {
      expect([1, 2, 3]).to.deepEqualArray([1, 2]);
    }, 'expected 3 to equal 2');
  });

  it('should fail assertion when compared values of array are not of the same instance', () => {
    global.chaiErr(function() {
      expect([1]).to.deepEqualArray(['coucou']);
    }, 'expected \'Number\' to equal \'String\'');
    global.chaiErr(function() {
      expect([domainBuilder.buildAnswer()]).to.deepEqualArray([domainBuilder.buildUser()]);
    }, 'expected \'Answer\' to equal \'User\'');
  });

  it('should fail assertion when compared values of array have not the same content', () => {
    global.chaiErr(function() {
      expect([1]).to.deepEqualArray([3]);
    }, 'expected 1 to deeply equal 3');
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
    expect([badgePartnerCompetence, campaign]).to.deepEqualArray([sameBadgePartnerCompetence, campaign]);
  });
});
