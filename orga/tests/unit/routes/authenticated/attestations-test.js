import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/attestations', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should redirect to application when currentUser.canAccessAttestationsPage is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        canAccessAttestationsPage = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.attestations');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should not redirect to application when currentUser.canAccessAttestationsPage is true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        canAccessAttestationsPage = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.attestations');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.notCalled(replaceWithStub);
      assert.ok(true);
    });
  });

  module('#model', function () {
    test('it should return a list of options based on organization divisions', async function (assert) {
      // given
      const divisions = [{ name: '3èmeA' }, { name: '2ndE' }];
      class CurrentUserStub extends Service {
        canAccessAttestationsPage = true;
        organization = {
          id: 12345,
          divisions,
        };
      }

      const findRecordStub = sinon.stub();
      class StoreStub extends Service {
        findRecord = findRecordStub;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:store', StoreStub);

      const route = this.owner.lookup('route:authenticated/attestations');

      // when
      const actualOptions = await route.model();

      // then
      assert.deepEqual(actualOptions, {
        options: [
          {
            label: '3èmeA',
            value: '3èmeA',
          },
          {
            label: '2ndE',
            value: '2ndE',
          },
        ],
      });
    });
  });
});
