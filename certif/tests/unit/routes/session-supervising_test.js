import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import ENV from '../../../config/environment';
import setupIntl from '../helpers/setup-intl';

module('Unit | Route | session-supervising', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#afterModel', function (hooks) {
    let clock, sessionSupervisingPollingRate;
    hooks.beforeEach(function () {
      clock = sinon.useFakeTimers({ now: Date.now() });
      sessionSupervisingPollingRate = ENV.APP.sessionSupervisingPollingRate;
    });

    hooks.afterEach(function () {
      clock.restore();
      ENV.APP.sessionSupervisingPollingRate = sessionSupervisingPollingRate;
    });

    module('when an error occurs in session supervising fetch', function () {
      test('it should stop polling', async function (assert) {
        // given
        ENV.APP.sessionSupervisingPollingRate = 100;
        const session = { id: '123' };

        class StoreStub extends Service {
          queryRecord = sinon.stub();
        }

        this.owner.register('service:store', StoreStub);

        const route = this.owner.lookup('route:session-supervising');
        route.store.queryRecord.onCall(0).returns(Promise.resolve());
        route.store.queryRecord.onCall(1).throws(new Error());

        // when
        route.afterModel(session);

        await clock.tickAsync(250);

        // then
        assert.strictEqual(route.poller, null);
        assert.strictEqual(route.store.queryRecord.callCount, 2);
      });

      module('when the error has a 401 status', function () {
        test('it should redirect to session supervising login page', async function (assert) {
          // given
          ENV.APP.sessionSupervisingPollingRate = 100;
          const session = { id: '123' };

          class RouterStub extends Service {
            replaceWith = sinon.stub();
          }

          this.owner.register('service:router', RouterStub);

          class StoreStub extends Service {
            queryRecord = sinon.stub();
          }

          this.owner.register('service:store', StoreStub);

          const route = this.owner.lookup('route:session-supervising');
          route.store.queryRecord.rejects({ errors: [{ status: '401' }] });

          // when
          route.afterModel(session);
          await clock.tickAsync(250);

          // then
          assert.ok(route.router.replaceWith.calledWith('login-session-supervisor'));
        });
      });

      module('when the user loses connection', function () {
        test('it should display a notification', async function (assert) {
          // given
          ENV.APP.sessionSupervisingPollingRate = 100;
          const session = { id: '123' };

          class NotificationStub extends Service {
            error = sinon.stub();
          }

          this.owner.register('service:notifications', NotificationStub);

          class StoreStub extends Service {
            queryRecord = sinon.stub();
          }

          this.owner.register('service:store', StoreStub);
          const route = this.owner.lookup('route:session-supervising');
          const notification = this.owner.lookup('service:notifications');

          route.store.queryRecord.rejects({ message: 'Failed to fetch' });

          // when
          route.afterModel(session);
          await clock.tickAsync(250);

          // then
          assert.ok(
            notification.error.calledWith(
              'Votre connexion internet est actuellement interrompue, les données affichées ne sont plus à jour. Veuillez vous reconnecter à internet et recharger la page.',
            ),
          );
        });
      });
    });
  });
});
