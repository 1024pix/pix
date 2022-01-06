import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | Layout::Sidebar', function (hooks) {
  setupRenderingTest(hooks);

  module('when the user is authenticated on orga.pix.fr', function (hooks) {
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return true;
      }
    }

    hooks.beforeEach(function () {
      this.owner.register('service:url', UrlServiceStub);
    });

    test('it should display documentation url given by current organization', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, isPro: true, documentationUrl: 'https://pix.fr' });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://pix.fr"]').exists();
      assert.dom('a[href="https://cloud.pix.fr/s/cwZN2GAbqSPGnw4"]').doesNotExist();
    });
  });

  test('it should display the team for all organisation members', async function (assert) {
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, isPro: true });
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<Layout::Sidebar />`);

    // then
    assert.contains('Équipe');
  });

  test('it should display Certifications menu in the sidebar-menu when user is SCOManagingStudents', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isAdminInOrganization = true;
      isSCOManagingStudents = true;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<Layout::Sidebar />`);

    // then
    assert.contains('Certifications');
  });

  test('it should hide Certification menu in the sidebar-menu', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isAdminInOrganization = false;
      isSCOManagingStudents = true;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<Layout::Sidebar />`);

    // then
    assert.notContains('Certification');
  });
});
