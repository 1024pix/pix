import { expect } from '../../../test-helper.js';
import { configLoader } from '../../../../src/shared/infrastructure/config-loader.js';

describe('Unit | Shared | infrastructure | config-loader', function () {
  describe('test.env file with property KEY=one', function () {
    it('should return one', function () {
      // given

      // when
      const result = configLoader.get('KEY');

      // then
      expect(result).to.equal('one');
    });
  });
});
