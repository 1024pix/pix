import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | authenticated/index', function () {
  setupTest();

  it('should redirect to user-dashboard', function () {
    // given
    const route = this.owner.lookup('route:authenticated/index');
    const router = this.owner.lookup('service:router');
    router.replaceWith = sinon.stub();

    // when
    route.redirect();

    // then
    sinon.assert.calledWith(router.replaceWith, 'authenticated.user-dashboard');
  });
});
