import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { organizationRequestsBuilder } from 'pix-admin/requests-builders/organization-requests-builder';
import { module, test } from 'qunit';

module('Unit | Requests Builders | organization-requests-builder', function (hooks) {
  setupTest(hooks);

  module('#buildAttachCertificationCenterRequest', function () {
    test('it builds correct request', function (assert) {
      // given
      const organizationId = 42;
      const certificationCenterId = 17;

      const expectedBuiltRequest = {
        url: `${ENV.APP.API_HOST}/api/admin/organizations/42/attach-certification-centers`,
        method: 'POST',
        body: JSON.stringify({ certificationCenterId: 17 }),
      };

      // when
      const builtRequest = organizationRequestsBuilder.buildAttachCertificationCenterRequest({
        organizationId,
        certificationCenterId,
      });

      // then
      assert.deepEqual(builtRequest, expectedBuiltRequest);
    });
  });

  module('#buildDetachCertificationCenterRequest', function () {
    test('it builds correct request', function (assert) {
      // given
      const organizationId = 42;

      const expectedBuiltRequest = {
        url: `${ENV.APP.API_HOST}/api/admin/organizations/42/detach-certification-center`,
        method: 'POST',
      };

      // when
      const builtRequest = organizationRequestsBuilder.buildDetachCertificationCenterRequest({
        organizationId,
      });

      // then
      assert.deepEqual(builtRequest, expectedBuiltRequest);
    });
  });
});
