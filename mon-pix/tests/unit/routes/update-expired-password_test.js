import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';

import { setupTest } from 'ember-mocha';

import EmberObject from '@ember/object';
import Service from '@ember/service';

describe('Unit | Route | update-expired-password', function() {

  setupTest();

  it('should retrieve a reset expired password demand', async function() {
    // given
    const route = this.owner.lookup('route:update-expired-password');
    const peekAllStub = sinon.stub();
    const storeStub = Service.create({
      peekAll: peekAllStub,
    });
    route.set('store', storeStub);

    const resetExpiredPasswordDemand = EmberObject.create({ username: 'user.name0112', oneTimePassword: 'password' });
    peekAllStub.returns([
      resetExpiredPasswordDemand,
    ]);

    // when
    const model = await route.model();

    // then
    expect(model).to.equal(resetExpiredPasswordDemand);
  });
});
