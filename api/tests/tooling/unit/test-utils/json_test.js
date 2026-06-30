import { expect } from '../../../test-helper.js';
import { parseNDJSON } from '../../../tooling/test-utils/json.js';

describe('Unit | Tooling | Test utils | JSON', function () {
  describe('parseNDJSON', function () {
    it('parses Newline Delimiter JSON data', function () {
      // given
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const data = [JSON.stringify(obj1), JSON.stringify(obj2), ''].join('\n');

      // when
      const parsed = parseNDJSON(data);

      // then
      expect(parsed).to.deep.equal([obj1, obj2]);
    });
  });
});
