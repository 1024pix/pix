import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | studentInformation', function (hooks) {
  setupTest(hooks);

  module('submitStudentInformation', function () {
    test('it sends POST to /api/sco-organization-learners/account-recovery', async function (assert) {
      this.requestManagerStub = { request: sinon.stub().resolves() };
      this.owner.register('service:request-manager', this.requestManagerStub, { instantiate: false });

      const service = this.owner.lookup('service:student-information');
      this.requestManagerStub.request = sinon.stub().resolves({
        content: {
          data: {
            type: 'student-information',
            attributes: {
              'first-name': 'prenom',
              'last-name': 'nom',
              email: 'prenom@nom.com',
              username: 'surnom',
              'latest-organization-name': 'organisation',
            },
          },
        },
      });

      const studentInformation = await service.submitStudentInformation({
        firstName: 'first',
        lastName: 'last',
        ineIna: 'ineIna',
        birthdate: '2000-01-01',
      });

      assert.deepEqual(studentInformation, {
        firstName: 'prenom',
        lastName: 'nom',
        email: 'prenom@nom.com',
        username: 'surnom',
        latestOrganizationName: 'organisation',
      });
      assert.true(
        this.requestManagerStub.request.calledWith({
          url: `${ENV.APP.API_HOST}/api/sco-organization-learners/account-recovery`,
          method: 'POST',
          body: JSON.stringify({
            data: {
              type: 'student-information-for-account-recoveries',
              attributes: {
                'first-name': 'first',
                'last-name': 'last',
                'ine-ina': 'ineIna',
                birthdate: '2000-01-01',
              },
            },
          }),
        }),
      );
    });
  });
});
