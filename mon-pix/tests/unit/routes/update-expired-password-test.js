import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { setupTest } from 'ember-mocha';

import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Route | update-expired-password', function() {

  setupTest();

  let route;
  let peekAllStub;

  beforeEach(function() {
    route = this.owner.lookup('route:update-expired-password');

    peekAllStub = sinon.stub();
    const storeStub = Service.create({
      peekAll: peekAllStub,
    });
    route.set('store', storeStub);
  });

  it('should retrieve user model with unset id', async function() {
    // given
    const userThatWasPreviouslyConnectedWithWrongAccount = EmberObject.create({ id: 1, username: 'user.name0112' });
    const userWithExpiredPassword = EmberObject.create({ id: null, username: 'user.toupdate1501' });
    peekAllStub.returns([
      userThatWasPreviouslyConnectedWithWrongAccount,
      userWithExpiredPassword,
    ]);

    // when
    const user = await route.model();

    // then
    expect(user).to.equal(userWithExpiredPassword);
  });
});
