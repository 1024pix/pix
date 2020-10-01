import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | sidebar-menu', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display documentation a pro organization', async function(assert) {
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, isPro: true });
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('a[href="https://cloud.pix.fr/s/cwZN2GAbqSPGnw4"]').exists();
  });

  test('it should display documentation a sco organization', async function(assert) {
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isSCOManagingStudents = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('a[href="https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f"]').exists();
  });

  test('it should not display documentation for a sco organization that does not managed students', async function(assert) {
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isSCOManagingStudents = false;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('.sidebar-menu__documentation-item').doesNotExist();
  });
});
