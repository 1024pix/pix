/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { click, fillIn, render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';

describe('Integration | Component | routes/campaigns/restricted/join-sup', function() {
  setupIntlRenderingTest();

  let sessionStub;
  let storeStub;
  let onSubmitStub;

  beforeEach(function() {
    sessionStub = Service.extend({});
    storeStub = Service.extend({});
    this.owner.register('service:session', sessionStub);
    this.owner.register('service:store', storeStub);
  });

  context('when the student number was not found', () => {
    it('should show user data form', async function() {
      // when
      const error = { status: '404' };
      onSubmitStub = sinon.stub().rejects({ errors: [error] });
      this.set('onSubmitStub', onSubmitStub);

      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmit={{this.onSubmitStub}}/>`);

      await fillIn('#studentNumber', '1234');
      await click('[type="submit"]');
      // then
      expect(find('#firstName')).to.exist;
    });

    it('should create a new schooling-registration-user-association', async function() {

      const schoolingRegistration = {
        campaignCode: '123',
        studentNumber: '1234',
        firstName: 'John',
        lastName: 'Doe',
        birthdate: '2000-01-01',
        username: null
      };

      const error = { status: '404' };

      onSubmitStub = sinon.stub();
      onSubmitStub.onCall(0).rejects({ errors: [error] });
      onSubmitStub.onCall(1).resolves();
      this.set('onSubmitStub', onSubmitStub);

      await render(hbs`<Routes::Campaigns::Restricted::JoinSup @campaignCode={{123}} @onSubmit={{this.onSubmitStub}}/>`);

      await fillIn('#studentNumber', schoolingRegistration.studentNumber);
      await click('[type="submit"]');
      await fillIn('#firstName', schoolingRegistration.firstName);
      await fillIn('#lastName', schoolingRegistration.lastName);
      await fillIn('#dayOfBirth', '01');
      await fillIn('#monthOfBirth', '01');
      await fillIn('#yearOfBirth', '2000');
      await click('[type="submit"]');

      expect(onSubmitStub.getCall(1).args[0].toJSON()).to.deep.equal(schoolingRegistration);
    });
  });
});
