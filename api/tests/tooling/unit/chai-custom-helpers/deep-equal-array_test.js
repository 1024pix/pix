import { expect } from '../../../test-helper.js';
import { expectChaiError } from '../../../tooling/chai-custom-helpers/chai-custom-test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('Unit | chai-custom-helpers | deepEqualArray', function () {
  it('should fail assertion when compared objects are not arrays', function () {
    expectChaiError(function () {
      expect([]).to.deepEqualArray('coucou');
    }, "expected 'String' to equal 'Array'");
    expectChaiError(function () {
      const foo = 'bar';
      expect(foo).to.deepEqualArray([]);
    }, "expected 'String' to equal 'Array'");
  });

  it('should fail assertion when compared arrays have not the same length', function () {
    expectChaiError(function () {
      expect([1, 2, 3]).to.deepEqualArray([1, 2]);
    }, 'expected 3 to equal 2');
  });

  it('should fail assertion when compared values of array are not of the same instance', function () {
    expectChaiError(function () {
      expect([1]).to.deepEqualArray(['coucou']);
    }, "expected 'Number' to equal 'String'");
    expectChaiError(function () {
      expect([domainBuilder.buildAnswer()]).to.deepEqualArray([domainBuilder.buildUser()]);
    }, "expected 'Answer' to equal 'User'");
  });

  it('should fail assertion when compared values of array have not the same content', function () {
    expectChaiError(function () {
      expect([1]).to.deepEqualArray([3]);
    }, 'expected 1 to deeply equal 3');
  });

  it('should succeed assertion when compared arrays have the same values in order', function () {
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
    const campaign = domainBuilder.buildCampaign();

    // then
    expect([competence, campaign]).to.deepEqualArray([sameCompetence, campaign]);
  });
});
