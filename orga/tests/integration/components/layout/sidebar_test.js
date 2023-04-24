import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

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

  module('Commun menu', function () {
    test('should display Campagne and Équipe menu for all organisation members', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.dom(screen.getByText('Campagnes')).exists();
      assert.dom(screen.getByText('Équipe')).exists();
    });

    test('should display Documentation menu when the organization has a documentation url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, documentationUrl: 'www.amazing-doc.fr' });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.dom(screen.getByText('Documentation')).exists();
    });
  });

  module('When the user is from a PRO organization', function () {
    test('it should display Participants menu for all organisation members', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'PRO' });
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      // when
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Participants')).exists();
    });
  });

  module('When the user is from a SUP organization', function () {
    test('it should display Étudiants menu for all organisation members when the organization is isSUPManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SUP' });
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      // when
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Étudiants')).exists();
    });

    test('it should display Participants menu for all organisation members when the organization is not isSUPManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SUP' });
        isSUPManagingStudents = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      // when
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Participants')).exists();
    });
  });

  module('When the user is from a SCO organization', function () {
    test('it should display Élèves menu for all organisation members when the organization is isSCOManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      // when
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Élèves')).exists();
    });

    test('it should display Participants menu for all organisation members when the organization is not isSCOManagingStudents ', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isSCOManagingStudents = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      // when
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Participants')).exists();
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
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.getByText('Certifications')).exists();
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
      const screen = await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom(screen.queryByLabelText('Certifications')).isNotVisible();
    });
  });

  test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, isPro: true });
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    const screen = await render(hbs`<Layout::Sidebar />`);

    // then
    assert.dom(screen.getByLabelText('Navigation principale')).exists();
  });
});
