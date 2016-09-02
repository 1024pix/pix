import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import { describe } from "mocha";

describeModel(
  'challenge',
  'Unit | Model | Challenge',
  {
    needs: ['model:course']
  },
  function () {
    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });

    describe('#proposalsAsArray', function () {

      function getProposalsAsArray(subject) {
        return subject.get('proposalsAsArray');
      }

      const testData = [
        {data: '', expected: []},
        {data: 'foo', expected: []},
        {data: '- foo', expected: ['foo']},
        {data: '-foo\n- bar', expected: ['foo', 'bar']},
        {data: '- cerf-volant', expected: ['cerf-volant']},
        {data: '- xi\n- foo mi', expected: ['xi', 'foo mi']},
        {data: '- joli\n- cerf-volant', expected: ['joli', 'cerf-volant']},
        {data: '- xi\n- foo\n- mi', expected: ['xi', 'foo', 'mi']},
        {data: '-- foo', expected: ['- foo']},
        {data: '- foo\n\r\t\n\r\t\n\r\t\n- bar', expected: ['foo', 'bar']}
      ];

      testData.forEach(({ data, expected }) => {
        it(`"${data.toString()}" retourne [${expected}]`, function() {
          const sut = this.subject({ proposals: data });
          expect(getProposalsAsArray(sut)).to.deep.equal(expected);
        });
      });
    });
  }
);
