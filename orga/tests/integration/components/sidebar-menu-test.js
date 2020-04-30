import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | sidebar-menu', function(hooks) {
  setupRenderingTest(hooks);

  let user;
  hooks.beforeEach(function() {
    user = Object.create({
      firstName: 'givenFirstName',
      lastName: 'givenLastName',
    });
  });

  test('it should display documentation a pro organization', async function(assert) {
    const organization = Object.create({ id: 1, isPro: true });
    this.owner.register('service:current-user', Service.extend({ user, organization }));

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('a[href="https://cloud.pix.fr/s/cwZN2GAbqSPGnw4"]').exists();
  });

  test('it should display documentation a sco organization', async function(assert) {
    const organization = Object.create({ id: 1, type: 'SCO' });
    this.owner.register('service:current-user', Service.extend({ user, organization, isSCOManagingStudents: true }));

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('a[href="https://bit.ly/ressourcespixorga"]').exists();
  });

  test('it should not display documentation for a sco organization that does not managed students', async function(assert) {
    const organization = Object.create({ id: 1, type: 'SCO' });
    this.owner.register('service:current-user', Service.extend({ user, organization, isSCOManagingStudents: false }));

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('.sidebar-menu__documentation-item').doesNotExist();
  });
});
