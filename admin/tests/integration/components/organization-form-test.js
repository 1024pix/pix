import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
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
    this.owner.register('service:notification', notificationMessagesStub);
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
      const selectedOrganizationType = null;
      const organization = EmberObject.create();
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

});
