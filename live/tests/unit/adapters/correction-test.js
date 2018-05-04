import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | correction', function() {

  setupTest('adapter:correction', {
    needs: ['service:session']
  });

  it('exists', function() {
    const adapter = this.subject();
    expect(adapter).to.be.ok;
  });

});
