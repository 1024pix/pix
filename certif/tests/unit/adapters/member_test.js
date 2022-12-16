import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

module('Unit | Adapter | member', function (hooks) {
  setupTest(hooks);

  module('#urlForQuery', function () {
    test('should call the right url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:member');
      const certificationCenterId = 1;

      // when
      const url = await adapter.urlForQuery({ certificationCenterId });

      // then
      assert.true(url.endsWith(`certification-centers/${certificationCenterId}/members`));
    });
  });

  module('#buildUrl', function () {
    module('when request type is update-referer', function () {
      test('should build url', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          id: 123,
        });

        class CurrentUserStub extends Service {
          currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const adapter = this.owner.lookup('adapter:member');

        // when
        const url = await adapter.buildURL(undefined, undefined, undefined, 'update-referer', undefined);

        // then
        assert.true(url.endsWith('certification-centers/123/update-referer'));
      });
    });
  });
});
