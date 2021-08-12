import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | Layout::Sidebar', function(hooks) {
  setupRenderingTest(hooks);

  module('when the user is authenticated on orga.pix.fr', function(hooks) {
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return true;
      }
    }

    hooks.beforeEach(function() {
      this.owner.register('service:url', UrlServiceStub);
    });

    test('it should display documentation for a pro organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, isPro: true });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://cloud.pix.fr/s/cwZN2GAbqSPGnw4"]').exists();
    });

    test('it should display documentation for a pro mediation numerique organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1 });
        isMediationNumerique = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://view.genial.ly/6048a0d3757f980dc010d6d4"]').exists();
    });

    test('it should display documentation for a sco organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isSCOManagingStudents = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://view.genial.ly/5f3e7a5ba8ffb90d11ac034f"]').exists();
    });

    test('it should display documentation for a sco agriculture organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isSCOManagingStudents = true;
        isAgriculture = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://view.genial.ly/5f85a0b87812e90d12b7b593"]').exists();
    });

    test('it should display documentation for a sco AEFE organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isAEFE = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8"]').exists();
    });

    test('it should display documentation for a sco MLF organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isMLF = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);
      // then
      assert.dom('a[href="https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8"]').exists();
    });

    test('it should display documentation for a SUP organization', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, isSup: true });
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);
      // then
      assert.dom('a[href="https://cloud.pix.fr/s/DTTo7Lp7p6Ktceo"]').exists();
    });

    test('it should not display documentation for a sco organization that does not managed students', async function(assert) {
      class CurrentUserStub extends Service {
        organization = Object.create({ id: 1, type: 'SCO' });
        isSCOManagingStudents = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('.sidebar-menu__documentation-item').doesNotExist();
    });
  });

  module('when the user is authenticated on orga.pix.org', function(hooks) {
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return false;
      }
    }
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1 });
    }

    hooks.beforeEach(function() {
      this.owner.register('service:current-user', CurrentUserStub);
      this.owner.register('service:url', UrlServiceStub);
    });

    test('it should display documentation', async function(assert) {
      // when
      await render(hbs`<Layout::Sidebar />`);

      // then
      assert.dom('a[href="https://cloud.pix.fr/s/HxpfpBnY47nYBkz"]').exists();
    });
  });

  test('it should display Certifications menu in the sidebar-menu when user is SCOManagingStudents', async function(assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isAdminInOrganization = true;
      isSCOManagingStudents= true;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<Layout::Sidebar />`);

    // then
    assert.contains('Certifications');
  });

  test('it should hide Certification menu in the sidebar-menu', async function(assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isAdminInOrganization = false;
      isSCOManagingStudents= true;
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
