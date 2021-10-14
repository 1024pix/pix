import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import ENV from 'mon-pix/config/environment';
import { run } from '@ember/runloop';

describe('Unit | Model | Student-information', function () {
  setupTest();

  describe('#submitStudentInformation', function () {
    it('submit student information form', async function () {
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
        })
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

      const url = `${ENV.APP.API_HOST}/api/schooling-registration-dependent-users/recover-account`;
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
      expect(adapter.ajax.calledWith(url, 'POST', payload)).to.be.true;
      expect(result).to.be.deep.equal(expectedResult);
    });
  });
});
