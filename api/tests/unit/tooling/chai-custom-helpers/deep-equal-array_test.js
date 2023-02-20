import { expect, domainBuilder } from '../../../test-helper';

describe('Unit | chai-custom-helpers | deepEqualArray', function () {
  it('should fail assertion when compared objects are not arrays', function () {
    global.chaiErr(function () {
      expect([]).to.deepEqualArray('coucou');
    }, "expected 'String' to equal 'Array'");
    global.chaiErr(function () {
      const foo = 'bar';
      expect(foo).to.deepEqualArray([]);
    }, "expected 'String' to equal 'Array'");
  });

  it('should fail assertion when compared arrays have not the same length', function () {
    global.chaiErr(function () {
      expect([1, 2, 3]).to.deepEqualArray([1, 2]);
    }, 'expected 3 to equal 2');
  });

  it('should fail assertion when compared values of array are not of the same instance', function () {
    global.chaiErr(function () {
      expect([1]).to.deepEqualArray(['coucou']);
    }, "expected 'Number' to equal 'String'");
    global.chaiErr(function () {
      expect([domainBuilder.buildAnswer()]).to.deepEqualArray([domainBuilder.buildUser()]);
    }, "expected 'Answer' to equal 'User'");
  });

  it('should fail assertion when compared values of array have not the same content', function () {
    global.chaiErr(function () {
      expect([1]).to.deepEqualArray([3]);
    }, 'expected 1 to deeply equal 3');
  });

  it('should succeed assertion when compared arrays have the same values in order', function () {
    // given
    const skillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const sameSkillSet = domainBuilder.buildSkillSet({
      id: 123,
      name: 'someName',
      skillIds: ['recABC', 'recDEF'],
    });
    const campaign = domainBuilder.buildCampaign();

    // then
    expect([skillSet, campaign]).to.deepEqualArray([sameSkillSet, campaign]);
  });
});
