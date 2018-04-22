import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve, reject } from 'rsvp';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import Service from '@ember/service';

const notificationMessagesStub = Service.extend({

  success(message) {
    this.set('calledMethod', 'success');
    this.set('message', message);
    return resolve();
  },

  error(message) {
    this.set('calledMethod', 'error');
    this.set('message', message);
    return resolve();
  }
});

module('Integration | Component | organization-form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:notification-messages', notificationMessagesStub);
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{organization-form}}`);

    // then
    assert.dom('.organization-form').exists();
  });

  module('#selectOrganizationType', function() {

    test('should update attribute organization.type', async function(assert) {
      // given
      let selectedOrganizationType = null;
      let organization = EmberObject.create();
      this.set('selectedOrganizationType', selectedOrganizationType);
      this.set('organization', organization);
      await render(hbs`{{organization-form selectedOrganizationType=selectedOrganizationType organization=organization}}`);

      // when
      await selectChoose('#organizationTypeSelector', 'Établissement scolaire');

      // then
      assert.equal(this.get('selectedOrganizationType.value'), 'SCO');
      assert.equal(this.get('organization.type'), 'SCO');
    });
  });

  async function fillInAllFormFields() {
    await fillIn('#organizationName', 'ACME');
    await selectChoose('#organizationTypeSelector', 'Établissement scolaire');
    await fillIn('#contactFirstName', 'Goku');
    await fillIn('#contactLastName', 'Black');
    await fillIn('#contactEmail', 'test@example.net');
    await fillIn('#contactPassword', 'password1234');
  }

  module('#submitOrganization', function() {

    test('should call external action with good params', async function(assert) {
      assert.expect(2);

      // test double for the external action
      this.set('externalAction', (organization, contact) => {
        let expectedOrganization = {
          name: 'ACME',
          type: 'SCO' };
        let expectedContact = {
          firstName: 'Goku',
          lastName: 'Black',
          email: 'test@example.net',
          password: 'password1234',
        };
        assert.deepEqual(organization, expectedOrganization, 'submitted value is passed to external action');
        assert.deepEqual(contact, expectedContact, 'submitted value is passed to external action');
        return resolve();
      });

      await render(hbs`{{organization-form onSubmitOrganization=(action externalAction)}}`);

      // fill out the form and force an onchange
      await fillInAllFormFields();

      // click the button to submit the form
      await click('.form-action--submit');
    });

    test('should reset form fields when organization creation succeeded', async function(assert) {
      assert.expect(1);

      // test double for the external action
      this.set('externalAction', () => {
        return resolve();
      });

      await render(hbs`{{organization-form onSubmitOrganization=(action externalAction)}}`);

      // fill out the form and force an onchange
      await fillInAllFormFields();

      // click the button to submit the form
      await click('.form-action--submit');

      assert.dom('input').hasNoValue();
    });

    test('should display successful notification when organization creation succeeded', async function(assert) {
      assert.expect(2);

      // test double for the external action
      this.set('externalAction', () => {
        return resolve();
      });

      await render(hbs`{{organization-form onSubmitOrganization=(action externalAction)}}`);

      // fill out the form and force an onchange
      await fillInAllFormFields();

      // click the button to submit the form
      await click('.form-action--submit');

      let notificationMessages = this.owner.lookup('service:notification-messages');
      assert.equal(notificationMessages.get('calledMethod'), 'success');
      assert.equal(notificationMessages.get('message'), 'L’organisation a été créée avec succès.');
    });

    test('should display failed notification when organization creation failed', async function(assert) {
      assert.expect(2);

      // test double for the external action
      this.set('externalAction', () => {
        return reject();
      });

      await render(hbs`{{organization-form onSubmitOrganization=(action externalAction)}}`);

      // fill out the form and force an onchange
      await fillInAllFormFields();

      // click the button to submit the form
      await click('.form-action--submit');

      let notificationMessages = this.owner.lookup('service:notification-messages');
      assert.equal(notificationMessages.get('calledMethod'), 'error');
      assert.equal(notificationMessages.get('message'), 'Une erreur est survenue.');
    });
  });

});
