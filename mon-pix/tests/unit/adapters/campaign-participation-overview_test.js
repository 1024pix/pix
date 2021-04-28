import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | campaign-participation-overviews', function() {
  setupTest();

  let adapter;

  beforeEach(function() {
    adapter = this.owner.lookup('adapter:campaign-participation-overview');
    adapter.ajax = sinon.stub().resolves();
  });

  describe('#urlForQueryRecord', () => {

    it('should query campaign-participation-overviews with adapterOptions', async function() {
      // given
      const params = {
        'userId': 1,
        'page[number]': 1,
        'page[size]': 5,
        'filter[states][]': 'ONGOING',
      };

      const paramsAfterQuery = {
        'page[number]': 1,
        'page[size]': 5,
        'filter[states][]': 'ONGOING',
      };

      // when
      const url = await adapter.urlForQuery(params, 'campaign-participation-overview');

      // then
      expect(params).to.deep.equal(paramsAfterQuery);
      expect(url.endsWith('/api/users/1/campaign-participation-overviews')).to.be.true;
    });
  });

});
