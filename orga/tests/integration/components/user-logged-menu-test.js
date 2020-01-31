import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | user-logged-menu', function(hooks) {

  setupRenderingTest(hooks);

  let user, organization;

  hooks.beforeEach(function() {
    organization = Object.create({ id: 1, name: 'Main organization', externalId: 'EXT' });
    user = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
    });
    this.owner.register('service:current-user', Service.extend({ user, organization }));
  });

  test('it renders', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);

    // then
    assert.dom('.logged-user-summary').exists();
  });

  test('should display user\'s firstName and lastName', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);

    // then
    assert.dom('.logged-user-summary__name').hasText(`${user.firstName} ${user.lastName}`);
  });

  test('should display the user current organization name and externalId', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);

    // then
    assert.dom('.logged-user-summary__organization').hasText(`${organization.name} (${organization.externalId})`);
  });

  test('should display the chevron-down icon when menu is close', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);

    // then
    assert.dom('.fa-chevron-down').exists();
    assert.dom('.fa-chevron-up').doesNotExist();
  });

  test('should display the chevron-up icon when menu is open', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);
    await click('.logged-user-summary__link');

    // then
    assert.dom('.fa-chevron-up').exists();
    assert.dom('.fa-chevron-down').doesNotExist();
  });

  test('should display the disconnect link when menu is open', async function(assert) {
    // when
    await render(hbs`{{user-logged-menu}}`);
    await click('.logged-user-summary__link');

    // then
    assert.dom('.logged-user-menu').exists();
    assert.dom('.logged-user-menu-item__last').hasText('Se déconnecter');
  });

  test('should display the organizations name and externalId when menu is open', async function(assert) {
    // when
    const organization1 = { id: 2, name: 'Organization 2', externalId: 'EXT2' };
    const organization2 = { id: 3, name: 'Organization 3', externalId: 'EXT3' };
    this.set('organizations', [organization1, organization2]);
    await render(hbs`{{user-logged-menu organizations=organizations}}`);
    await click('.logged-user-summary__link');

    // then
    assert.dom('.logged-user-menu').exists();
    assert.dom('.logged-user-menu > div:nth-child(1) > span.logged-user-menu-item__organization-name').hasText(organization1.name);
    assert.dom('.logged-user-menu > div:nth-child(1) > span.logged-user-menu-item__organization-externalId').hasText(`(${organization1.externalId})`);
    assert.dom('.logged-user-menu > div:nth-child(2) > span.logged-user-menu-item__organization-name').hasText(organization2.name);
    assert.dom('.logged-user-menu > div:nth-child(2) > span.logged-user-menu-item__organization-externalId').hasText(`(${organization2.externalId})`);
  });
});
