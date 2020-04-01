import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | correction', function() {

  setupTest();

  it('exists', function() {
    const adapter = this.owner.lookup('adapter:correction');
    expect(adapter).to.be.ok;
  });

});
