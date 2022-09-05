import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | Area', function () {
  setupTest();

  describe('#urlForFindAll', function () {
    it('should build url for find all', function () {
      // given
      const adapter = this.owner.lookup('adapter:area');

      // when
      const url = adapter.urlForFindAll();

      // then
      expect(url.endsWith('api/frameworks/pix/areas-for-user')).to.be.true;
    });
  });
});
