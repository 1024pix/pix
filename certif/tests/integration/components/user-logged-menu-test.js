import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | user-logged-menu', function(hooks) {

  setupRenderingTest(hooks);

  let certificationPointOfContact;

  hooks.beforeEach(async function() {
    // given
    certificationPointOfContact = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
      certificationCenterName: 'givenCertificationCenterName',
      certificationCenterExternalId: 'givenCertificationCenterExternalId',
    });

    this.owner.register('service:current-user', Service.extend({ certificationPointOfContact }));

    // when
    await render(hbs`<UserLoggedMenu/>`);
  });

  test('should display user\'s firstName and lastName', function(assert) {
    // then
    assert.contains(`${certificationPointOfContact.firstName} ${certificationPointOfContact.lastName}`);
  });

  module('when certification center doesn\'t have an externalId', function() {

    test('should display the user certification center name only', async function(assert) {
      // given
      delete certificationPointOfContact.certificationCenterExternalId;

      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.contains(certificationPointOfContact.certificationCenterName);
    });
  });

  module('when certification center does have an externalId', function() {

    test('should display the user certification center name and certification center externalId', function(assert) {
      // then
      assert.contains(`${certificationPointOfContact.certificationCenterName} (${certificationPointOfContact.certificationCenterExternalId})`);
    });
  });

  module('when menu is close', function() {

    test('should display the chevron-down icon', function(assert) {
      // then
      assert.dom('.fa-chevron-down').exists();
      assert.dom('.fa-chevron-up').doesNotExist();
    });

    test('should hide the disconnect link', async function(assert) {
      // when
      await click('.logged-user-summary__link');
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__last').doesNotExist();
    });
  });

  module('when menu is close', function() {

    test('should display the chevron-up icon', async function(assert) {
      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.fa-chevron-up').exists();
      assert.dom('.fa-chevron-down').doesNotExist();
    });

    test('should display the disconnect link', async function(assert) {
      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__last').exists();
      assert.contains('Se déconnecter');
    });
  });
});
