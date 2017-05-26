import Ember from 'ember';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import ValueAsArrayOfBooleanMixin from 'pix-live/models/answer/value-as-array-of-boolean-mixin';

describe('Unit | Model | Value As Array of Boolean Mixin', function() {

  const testData = [
    { when: 'Empty String', input: '', expected: [] },
    { when: 'Wrong type as input', input: new Date(), expected: [] },
    { when: 'Undefined input', input: undefined, expected: [] },
    { when: 'Nominal case', input: '2,3', expected: [false, true, true] },
    { when: 'Only one value', input: '4', expected: [false, false, false, true] },
    { when: 'Resist to order, empty space and empty value', input: ',4, 2 , 2,1,  ,', expected: [true, true, false, true] },

  ];

  const Challenge = Ember.Object.extend(ValueAsArrayOfBooleanMixin, {});

  testData.forEach(({ when, input, expected }) => {

    it(`"${when}", example : "${JSON.stringify(input)}" retourne [${expected}]`, function() {
      const sut = Challenge.create({ value: input });
      expect(sut.get('_valueAsArrayOfBoolean')).to.deep.equal(expected);
    });
  });
});

