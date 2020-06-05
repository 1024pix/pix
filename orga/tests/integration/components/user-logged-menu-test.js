import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | user-logged-menu', function(hooks) {

  setupRenderingTest(hooks);

  let prescriber, organization;

  hooks.beforeEach(function() {
    organization = Object.create({ id: 1, name: 'Main organization', externalId: 'EXT' });
    prescriber = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
    });
    this.owner.register('service:current-user', Service.extend({ prescriber, organization }));
  });

  test('should display user\'s firstName and lastName', async function(assert) {
    // when
    await render(hbs`<UserLoggedMenu/>`);

    // then
    assert.contains(`${prescriber.firstName} ${prescriber.lastName}`);
  });

  test('should display the user current organization name and externalId', async function(assert) {
    // when
    await render(hbs`<UserLoggedMenu/>`);

    // then
    assert.contains(`${organization.name} (${organization.externalId})`);
  });

  test('should display the chevron-down icon when menu is close', async function(assert) {
    // when
    await render(hbs`<UserLoggedMenu/>`);

    // then
    assert.dom('.fa-chevron-down').exists();
    assert.dom('.fa-chevron-up').doesNotExist();
  });

  test('should display the chevron-up icon when menu is open', async function(assert) {
    // when
    await render(hbs`<UserLoggedMenu/>`);
    await click('.logged-user-summary__link');

    // then
    assert.dom('.fa-chevron-up').exists();
    assert.dom('.fa-chevron-down').doesNotExist();
  });

  test('should display the disconnect link when menu is open', async function(assert) {
    // when
    await render(hbs`<UserLoggedMenu/>`);
    await click('.logged-user-summary__link');

    // then
    assert.contains('Se déconnecter');
  });

  test('should display the organizations name and externalId when menu is open', async function(assert) {
    // when
    const organization1 = { id: 2, name: 'Organization 2', externalId: 'EXT2' };
    const organization2 = { id: 3, name: 'Organization 3', externalId: 'EXT3' };
    this.set('organizations', [organization1, organization2]);
    await render(hbs`<UserLoggedMenu @eligibleOrganizations={{organizations}} />`);
    await click('.logged-user-summary__link');

    // then
    assert.contains(organization1.name);
    assert.contains(`(${organization1.externalId})`);
    assert.contains(organization2.name);
    assert.contains(`(${organization2.externalId})`);
  });
});
