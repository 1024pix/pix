import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/add-candidate', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sessions/add-candidate');
    route.currentUser = { checkRestrictedAccess: sinon.stub(), updateCurrentCertificationCenter: sinon.stub() };
  });

  module('#model', function () {
    const session = Symbol('session');
    const countries = Symbol('countries');

    function stubFindRecord({ hasExpired }) {
      const findRecord = sinon.stub();
      findRecord.withArgs('session-management', '123').resolves({ hasExpired });
      findRecord.withArgs('session-enrolment', '123').resolves(session);
      return findRecord;
    }

    test('it should return the session and the countries', async function (assert) {
      // given
      route.store.findRecord = stubFindRecord({ hasExpired: false });
      route.store.peekAll = sinon.stub().returns([]);
      route.store.findAll = sinon.stub().resolves(countries);

      // when
      const model = await route.model({ session_id: '123' });

      // then
      sinon.assert.calledWith(route.store.findRecord, 'session-enrolment', '123');
      sinon.assert.calledWith(route.store.findAll, 'country');
      assert.deepEqual(model, { session, countries });
    });

    test('it should not fetch the countries when they are already loaded', async function (assert) {
      // given
      const loadedCountries = [Symbol('country')];
      route.store.findRecord = stubFindRecord({ hasExpired: false });
      route.store.peekAll = sinon.stub().returns(loadedCountries);
      route.store.findAll = sinon.stub().resolves(countries);

      // when
      const model = await route.model({ session_id: '123' });

      // then
      sinon.assert.notCalled(route.store.findAll);
      assert.deepEqual(model, { session, countries: loadedCountries });
    });

    test('it should redirect to the sessions list when the session has expired', async function (assert) {
      // given
      const transition = Symbol('transition');
      route.router = { replaceWith: sinon.stub().returns(transition) };
      route.store.findRecord = stubFindRecord({ hasExpired: true });
      route.store.peekAll = sinon.stub().returns([]);
      route.store.findAll = sinon.stub().resolves(countries);

      // when
      const model = await route.model({ session_id: '123' });

      // then
      sinon.assert.calledWith(route.router.replaceWith, 'authenticated.sessions');
      sinon.assert.neverCalledWith(route.store.findRecord, 'session-enrolment', '123');
      assert.strictEqual(model, transition);
    });
  });
});
