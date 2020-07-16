const { expect } = require('../../../../test-helper');
const { parse } = require('../../../../../lib/infrastructure/serializers/csv/csv-parser');

describe('csv-parser', () => {
  context('#parse', () => {
    it('returns an array with csv lines parsed', () => {
      const input = `
      column1;column2;column3
      1;2,3
      ;;4
      "5";;"6,7"
      7`;
      const lines = parse(input);

      expect(lines).to.deep.equal([
        { 'column1': '1', 'column2': '2', 'column3': '3' },
        { 'column3': '4' },
        { 'column1': '5', 'column3': '6,7' },
        { 'column1': '7' },
      ]);
    });
  });
});
