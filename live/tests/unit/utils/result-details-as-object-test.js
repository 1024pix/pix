import { expect } from 'chai';
import { describe, it } from 'mocha';
import resultDetailsAsObject from 'pix-live/utils/result-details-as-object';

describe('#resultDetailsAsObject', function() {

  it('it should return an object from the yaml String', function() {
    // given
    const resultDetailYaml = 'S1: false\nS2: true\n';
    const expectedObject = {S1 : false, S2 : true};
    // when
    const result = resultDetailsAsObject(resultDetailYaml);
    // then
    expect(result).to.deep.equal(expectedObject);
  });

  it('it should return an empty object from the yaml String null\\n', function() {
    // given
    const resultDetailYaml = 'null\n';
    const expectedObject = {};

    // when
    const result = resultDetailsAsObject(resultDetailYaml);
    // then
    expect(result).to.deep.equal(expectedObject);

  });
});
