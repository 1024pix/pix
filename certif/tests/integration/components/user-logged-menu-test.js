/* eslint-disable ember/no-classic-classes,ember/require-tagless-components*/

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | user-logged-menu', (hooks) => {

  setupRenderingTest(hooks);

  let certificationPointOfContact;
  let currentCertificationCenter;
  let firstCertificationCenter;
  let secondCertificationCenter;

  hooks.beforeEach(async function() {
    // given
    currentCertificationCenter = Object.create({
      name: 'currentCertificationCenterName',
      externalId: 'currentCertificationCenterExternalId',
    });

    firstCertificationCenter = Object.create({
      name: 'firstCertificationCenterName',
      externalId: 'firstCertificationCenterExternalId',
    });

    secondCertificationCenter = Object.create({
      name: 'secondCertificationCenterName',
      externalId: 'secondCertificationCenterExternalId',
    });

    certificationPointOfContact = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
      certificationCenters: [currentCertificationCenter, firstCertificationCenter, secondCertificationCenter],
    });

    this.owner.register('service:current-user', Service.extend({ certificationPointOfContact, currentCertificationCenter }));

    // when
    await render(hbs`<UserLoggedMenu/>`);
  });

  test('should display user\'s firstName and lastName', function(assert) {
    // then
    assert.contains(`${certificationPointOfContact.firstName} ${certificationPointOfContact.lastName}`);
  });

  module('when certification center doesn\'t have an externalId', () => {

    test('should display the user certification center name only', async function(assert) {
      // given
      delete currentCertificationCenter.externalId;

      // when
      await render(hbs`<UserLoggedMenu/>`);

      // then
      assert.contains(currentCertificationCenter.name);
    });
  });

  module('when certification center does have an externalId', () => {

    test('should display the user certification center name and certification center externalId', function(assert) {
      // then
      assert.contains(`${currentCertificationCenter.name} (${currentCertificationCenter.externalId})`);
    });
  });

  module('when menu is close', () => {

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

  module('when menu is open', () => {

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

    test('should display the certification centers name and externalId', async function(assert) {
      // when
      await render(hbs`<UserLoggedMenu />`);
      await click('.logged-user-summary__link');

      // then
      assert.contains(firstCertificationCenter.name);
      assert.contains(`(${firstCertificationCenter.externalId})`);
      assert.contains(secondCertificationCenter.name);
      assert.contains(`(${secondCertificationCenter.externalId})`);
    });
  });
});
