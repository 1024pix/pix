import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'mon-pix/config/environment';
import { run } from '@ember/runloop';

module('Unit | Model | Student-information', function (hooks) {
  setupTest(hooks);

  module('#submitStudentInformation', function () {
    test('submit student information form', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('student-information');
      sinon.stub(adapter, 'ajax');
      adapter.ajax.resolves({
        data: {
          attributes: {
            'first-name': 'James',
            'last-name': 'Potter',
            email: 'james.potter@example.net',
            username: 'james.potter0709',
            'latest-organization-name': 'Collège Louise Michelle',
          },
        },
      });

      const studentInformation = run(() =>
        store.createRecord('student-information', {
          firstName: 'James',
          lastName: 'Potter',
          ineIna: '123456789CC',
          birthdate: '2010-01-22',
        }),
      );

      // when
      const result = await studentInformation.submitStudentInformation();

      // then
      const expectedResult = {
        firstName: 'James',
        lastName: 'Potter',
        email: 'james.potter@example.net',
        username: 'james.potter0709',
        latestOrganizationName: 'Collège Louise Michelle',
      };

      const url = `${ENV.APP.API_HOST}/api/sco-organization-learners/account-recovery`;
      const payload = {
        data: {
          data: {
            attributes: {
              'ine-ina': '123456789CC',
              'first-name': 'James',
              'last-name': 'Potter',
              birthdate: '2010-01-22',
            },
            type: 'student-information',
          },
        },
      };
      assert.true(adapter.ajax.calledWith(url, 'POST', payload));
      assert.deepEqual(result, expectedResult);
    });
  });
});
