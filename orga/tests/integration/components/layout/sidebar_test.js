import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout::Sidebar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the user is authenticated on orga.pix.fr', function (hooks) {
    class CurrentDomainServiceStub extends Service {
      get isFranceDomain() {
        return true;
      }
    }

    hooks.beforeEach(function () {
      this.owner.register('service:currentDomain', CurrentDomainServiceStub);
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

  module('Common menu', function () {
    test('the logo should redirect to campaigns page', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessCampaignsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      const logoLink = screen.getByRole('link', { name: this.intl.t('common.home-page') });

      assert.dom(logoLink).hasAttribute('href', '/campagnes');
    });

    test('should display Campagne and Équipe menu for all organisation members', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        canAccessCampaignsPage = true;
        canAccessParticipantsPage = true;
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

    test('should display Places menu if canAccessPlacesPage is true', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        canAccessPlacesPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.ok(screen.getByText(this.intl.t('navigation.main.places')));
    });

    test('should not display Places menu if canAccessPlacesPage is false', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        canAccessPlacesPage = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.notOk(screen.queryByText(this.intl.t('navigation.main.places')));
    });
  });

  module('When the user is from a PRO organization', function () {
    test('it should display Participants menu for all organisation members', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'PRO' });
        canAccessParticipantsPage = true;
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
        canAccessParticipantsPage = true;
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
        canAccessParticipantsPage = true;
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
        canAccessMissionsPage = false;
        canAccessParticipantsPage = true;
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
        canAccessParticipantsPage = true;
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

  module('When the user has the mission-management feature', function () {
    test('the logo should redirect to mission page', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      const logoLink = screen.getByRole('link', { name: this.intl.t('common.home-page') });
      assert.dom(logoLink).hasAttribute('href', '/missions');
    });

    test('should display Mission menu', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.dom(screen.getByText('Missions')).exists();
    });

    test('should not display Campagne and Participants menus', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const intl = this.owner.lookup('service:intl');
      intl.setLocale(['fr', 'fr']);

      const screen = await render(hbs`<Layout::Sidebar />`);

      assert.dom(screen.queryByText('Campagnes')).doesNotExist();
      assert.dom(screen.queryByText('Participants')).doesNotExist();
      assert.dom(screen.queryByText('Étudiants')).doesNotExist();
      assert.dom(screen.queryByText('Élèves')).doesNotExist();
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
