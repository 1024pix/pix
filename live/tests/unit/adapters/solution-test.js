import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapters | solution', function() {

  setupTest('adapter:solution', {});

  it('exists', function() {
    const adapter = this.subject();
    expect(adapter).to.be.ok;
  });

});
