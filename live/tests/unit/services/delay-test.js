import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | DelayService', function() {

  setupTest('service:delay', {});

  it('exists', function() {
    const controller = this.subject();
    expect(controller).to.be.ok;
  });

  it('has delay#ms() which return a promise', function() {
    const delay = this.subject();
    expect(delay).to.respondsTo('ms');
    const promise = delay.ms(0);
    expect(promise).to.respondsTo('then');
  });

});
