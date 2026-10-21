import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/administration/sco-deployment', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('it should return the correct model', async function (assert) {
      // given
      const findAllStub = sinon.stub();
      class StoreStub extends Service {
        findAll = findAllStub;
      }
      this.owner.register('service:store', StoreStub);
      const route = this.owner.lookup('route:authenticated/administration/sco-deployment');
      const scoBlockedAccessDates = Symbol('sco blocked access date');
      findAllStub.withArgs('sco-blocked-access-date').resolves(scoBlockedAccessDates);

      // when
      const result = await route.model();

      // then
      assert.strictEqual(result.scoBlockedAccessDates, scoBlockedAccessDates);
    });

    test('it should return an empty array and display a warning notification when sco-blocked-access-date returns a 404', async function (assert) {
      // given
      const findAllStub = sinon.stub();
      const sendWarningNotificationStub = sinon.stub();

      class StoreStub extends Service {
        findAll = findAllStub;
      }

      this.owner.register('service:store', StoreStub);

      const route = this.owner.lookup('route:authenticated/administration/sco-deployment');

      route.pixToast = {
        sendWarningNotification: sendWarningNotificationStub,
      };

      route.intl = {
        t: sinon.stub().returns("Les dates de réouverture n'ont pas été trouvées"),
      };

      findAllStub.withArgs('sco-blocked-access-date').rejects({ errors: [{ status: '404' }] });

      // when
      const result = await route.model();

      // then
      assert.deepEqual(result.scoBlockedAccessDates, []);
      assert.ok(
        sendWarningNotificationStub.calledWith({
          message: "Les dates de réouverture n'ont pas été trouvées",
        }),
      );
    });

    test('it should return an empty array and display an error notification when sco-blocked-access-date returns an error other than 404', async function (assert) {
      // given
      const findAllStub = sinon.stub();
      const sendErrorNotificationStub = sinon.stub();

      class StoreStub extends Service {
        findAll = findAllStub;
      }

      this.owner.register('service:store', StoreStub);

      const route = this.owner.lookup('route:authenticated/administration/sco-deployment');

      route.pixToast = {
        sendErrorNotification: sendErrorNotificationStub,
      };

      findAllStub.withArgs('sco-blocked-access-date').rejects({
        errors: [{ status: '500', detail: 'Internal server error' }],
      });

      // when
      const result = await route.model();

      // then
      assert.deepEqual(result.scoBlockedAccessDates, []);
      assert.ok(sendErrorNotificationStub.calledWith({ message: 'Internal server error' }));
    });
  });
});
