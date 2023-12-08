import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';
import ENV from 'pix-certif/config/environment';

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

  module('#urlForUpdateRecord', function () {
    test('calls the right url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:member');
      const store = this.owner.lookup('service:store');

      const certificationCenterId = 123;
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: certificationCenterId,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const certificationCenterMembershipId = 456;

      // when
      const url = await adapter.urlForUpdateRecord(certificationCenterMembershipId, 'member', {});

      // then
      assert.true(url.endsWith('/certification-centers/123/certification-center-memberships/456'));
    });
  });

  module('#updateRecord', () => {
    test('triggers an ajax call with the url, data and method', async function (assert) {
      // given
      const certificationCenterId = 123;
      const certificationCenterMembershipId = 456;
      const url = `${ENV.APP.API_HOST}/api/certification-centers/${certificationCenterId}/certification-center-memberships/456`;
      const userId = 888;
      const role = 'MEMBER';
      const adapter = this.owner.lookup('adapter:member');
      sinon.stub(adapter, 'ajax').resolves();
      sinon.stub(adapter, 'buildURL').returns(url);
      sinon.stub(adapter, 'serialize').returns({
        id: userId,
        data: { attributes: { 'certification-center-membership-id': certificationCenterMembershipId, role } },
      }); //
      const snapshot = { id: userId };

      const store = this.owner.lookup('service:store');

      // when
      await adapter.updateRecord(store, { modelName: 'certificationCenterMembership' }, snapshot);

      // then
      const expectedModelName = 'certificationCenterMembership';
      const expectedId = 456;
      const expectedSnapshot = { id: userId };
      sinon.assert.calledWith(adapter.buildURL, expectedModelName, expectedId, expectedSnapshot);

      const expectedMethod = 'PATCH';
      const expectedData = {
        data: {
          id: userId,
          data: { attributes: { 'certification-center-membership-id': certificationCenterMembershipId, role } },
        },
      };
      sinon.assert.calledWith(adapter.ajax, url, expectedMethod, expectedData);
      assert.ok(adapter);
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
