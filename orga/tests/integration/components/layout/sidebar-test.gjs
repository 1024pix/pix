import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import Sidebar from 'pix-orga/components/layout/sidebar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Layout::Sidebar', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the user is authenticated on orga.pix.fr', function (hooks) {
    hooks.beforeEach(function () {
      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');
    });

    test('it should display documentation url given by current organization', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', isPro: true, documentationUrl: 'https://pix.fr' });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(<template><Sidebar /></template>);

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

      const screen = await render(<template><Sidebar /></template>);

      const logoLink = screen.getByRole('link', { name: t('common.home-page') });

      assert.dom(logoLink).hasAttribute('href', '/');
    });

    test('should display a home entry', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessCampaignsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);
      const navigation = screen.getByRole('navigation');
      const logoLink = within(navigation).getByRole('link', { name: t('navigation.main.home') });

      assert.dom(logoLink).hasAttribute('href', '/');
    });

    test('should display Campagne, Équipe, Se déconnecter in menu for all organisation members', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1' });
        canAccessCampaignsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const screen = await render(<template><Sidebar /></template>);

      assert.dom(screen.getByText('Campagnes')).exists();
      assert.dom(screen.getByText('Équipe')).exists();
      assert.dom(screen.getByText('Se déconnecter')).exists();
    });

    test('should display Documentation menu when the organization has a documentation url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', documentationUrl: 'www.amazing-doc.fr' });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const screen = await render(<template><Sidebar /></template>);

      assert.dom(screen.getByText('Documentation')).exists();
    });

    test('should display Places menu if canAccessPlacesPage is true', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1' });
        canAccessPlacesPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);

      assert.ok(screen.getByText(t('navigation.main.places')));
    });

    test('should not display Places menu if canAccessPlacesPage is false', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1' });
        canAccessPlacesPage = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);

      assert.notOk(screen.queryByText(t('navigation.main.places')));
    });

    test('should display support menu for all org types', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5, type: 'PRO' });
        canAccessMissionsPage = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const screen = await render(<template><Sidebar /></template>);

      assert.dom(screen.getByRole('link', { name: t('navigation.main.support') })).exists();
    });
    module('canAccessCataloguePage', function () {
      test('displays Catalogue menu if user can access campaign page ', async function (assert) {
        class CurrentUserStub extends Service {
          organization = Object.create({ id: 5, type: 'PRO' });
          canAccessCampaignsPage = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const screen = await render(<template><Sidebar /></template>);

        assert.ok(screen.queryByRole('link', { name: t('navigation.main.catalogue') }));
      });

      test('hides Catalogue menu if user can not access campaign page', async function (assert) {
        class CurrentUserStub extends Service {
          organization = Object.create({ id: 5, type: 'PRO' });
          canAccessCampaignsPage = false;
        }
        this.owner.register('service:current-user', CurrentUserStub);
        const screen = await render(<template><Sidebar /></template>);

        assert.dom(screen.queryByRole('link', { name: t('navigation.main.catalogue') })).doesNotExist();
      });
    });
  });

  module('When the user is from a PRO organization', function () {
    test('it should display Participants menu for all organisation members', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'PRO' });
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Participants')).exists();
    });

    test('should display support menu with PRO url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'PRO' });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const urlService = this.owner.lookup('service:url');
      urlService.currentDomain = { isFranceDomain: true };

      const screen = await render(<template><Sidebar /></template>);

      assert.strictEqual(
        screen.getByRole('link', { name: t('navigation.main.support') }).href,
        'https://contact.pix.org/fr/hc/1137130200',
      );
    });
  });

  module('When the user is from a SUP organization', function () {
    test('should display support menu with SUP url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SUP' });
        isSUPManagingStudents = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const urlService = this.owner.lookup('service:url');
      urlService.currentDomain = { isFranceDomain: true };

      const screen = await render(<template><Sidebar /></template>);

      assert.strictEqual(
        screen.getByRole('link', { name: t('navigation.main.support') }).href,
        'https://contact.pix.org/fr/hc/1137130200',
      );
    });

    test('it should display Étudiants menu for all organisation members when the organization is isSUPManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SUP' });
        isSUPManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Étudiants')).exists();
    });

    test('it should display Participants menu for all organisation members when the organization is not isSUPManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SUP' });
        isSUPManagingStudents = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Participants')).exists();
    });
  });

  module('When the user is from a SCO organization', function () {
    test('should display support menu with SCO url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SCO' });
        isSCOManagingStudents = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      const localeService = this.owner.lookup('service:locale');
      sinon.stub(localeService, 'currentLocale').value('fr-FR');

      const screen = await render(<template><Sidebar /></template>);

      assert.strictEqual(
        screen.getByRole('link', { name: t('navigation.main.support') }).href,
        'https://pix.fr/support/enseignement-scolaire',
      );
    });

    test('it should display Élèves menu for all organisation members when the organization is isSCOManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SCO' });
        isSCOManagingStudents = true;
        canAccessMissionsPage = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Élèves')).exists();
    });

    test('it should display Participants menu for all organisation members when the organization is not isSCOManagingStudents ', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SCO' });
        isSCOManagingStudents = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Participants')).exists();
    });

    test('it should display Certifications menu in the sidebar-menu when user is SCOManagingStudents', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SCO' });
        isAdminInOrganization = true;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

      // then
      assert.dom(screen.getByText('Certifications')).exists();
    });

    test('it should hide Certification menu in the sidebar-menu', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        organization = Object.create({ id: '1', type: 'SCO' });
        isAdminInOrganization = false;
        isSCOManagingStudents = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><Sidebar /></template>);

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

      const screen = await render(<template><Sidebar /></template>);

      const logoLink = screen.getByRole('link', { name: t('common.home-page') });
      assert.dom(logoLink).hasAttribute('href', '/');
    });

    test('should display Mission menu', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);

      assert.dom(screen.getByText('Missions')).exists();
    });

    test('should not display Campagne', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      const screen = await render(<template><Sidebar /></template>);

      assert.dom(screen.queryByText('Campagnes')).doesNotExist();
      assert.dom(screen.queryByText('Étudiants')).doesNotExist();
    });
  });

  module('When the user is from a SCO-1D organization', function () {
    test('should display support menu with SCO-1D url', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5, type: 'SCO-1D' });
        canAccessMissionsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const domainService = this.owner.lookup('service:currentDomain');
      sinon.stub(domainService, 'getExtension').returns('fr');

      const localeService = this.owner.lookup('service:locale');
      sinon.stub(localeService, 'currentLocale').value('fr-FR');

      const screen = await render(<template><Sidebar /></template>);

      assert.strictEqual(
        screen.getByRole('link', { name: t('navigation.main.support') }).href,
        'https://pix.fr/support/enseignement-scolaire/1er-degre',
      );
    });
  });

  module('When the user has the attestations feature', function () {
    test('should display Attestations entry with link to attestation page', async function (assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 5 });
        canAccessAttestationsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);

      const attestationsLink = screen.getByRole('link', { name: t('navigation.main.attestations') });
      assert.dom(attestationsLink).hasAttribute('href', '/attestations');
    });
  });

  module('When the user has the cover rate feature', function () {
    test('should display Statistiques entry with link to statistics page', async function (assert) {
      class CurrentUserStub extends Service {
        organization = { id: 5 };
        canAccessStatisticsPage = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const screen = await render(<template><Sidebar /></template>);

      const statisticsLink = screen.getByRole('link', { name: t('navigation.main.statistics') });
      assert.dom(statisticsLink).hasAttribute('href', '/statistiques');
    });
  });

  test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: '1', isPro: true });
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const screen = await render(<template><Sidebar /></template>);

    // then
    assert.dom(screen.getByLabelText('Navigation principale')).exists();
  });
});
