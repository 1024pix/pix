import { describe, before } from 'mocha';
import { it } from 'ember-mocha';
import ProposalsAsArrayMixin from 'pix-live/models/challenge/proposals-as-array-mixin';

describe('Unit | Model | Challenge/Propsals As Array Mixin', function () {

  const testData = [
    { data: '', expected: [] },
    { data: 'foo', expected: [] },
    { data: '- foo', expected: ['foo'] },
    { data: '-foo\n- bar', expected: ['foo', 'bar'] },
    { data: '- cerf-volant', expected: ['cerf-volant'] },
    { data: '- xi\n- foo mi', expected: ['xi', 'foo mi'] },
    { data: '- joli\n- cerf-volant', expected: ['joli', 'cerf-volant'] },
    { data: '- xi\n- foo\n- mi', expected: ['xi', 'foo', 'mi'] },
    { data: '-- foo', expected: ['- foo'] },
    { data: '- foo\n\r\t\n\r\t\n\r\t\n- bar', expected: ['foo', 'bar'] }
  ];

  const Challenge = Ember.Object.extend(ProposalsAsArrayMixin, {});

  testData.forEach(({ data, expected }) => {

    it(`"${data.toString()}" retourne [${expected}]`, function () {
      const sut = Challenge.create({ proposals: data });
      expect(sut.get('_proposalsAsArray')).to.deep.equal(expected);
    });
  });
});

