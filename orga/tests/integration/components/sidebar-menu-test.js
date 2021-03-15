import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | sidebar-menu', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display documentation for a pro organization', async function(assert) {
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, isPro: true });
    }
    this.owner.register('service:current-user', CurrentUserStub);

    // when
    await render(hbs`<SidebarMenu />`);

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
    await render(hbs`<SidebarMenu />`);

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
    await render(hbs`<SidebarMenu />`);

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
    await render(hbs`<SidebarMenu />`);

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
    await render(hbs`<SidebarMenu />`);

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
    await render(hbs`<SidebarMenu />`);

    // then
    assert.dom('a[href="https://view.genial.ly/5ffb6eed1ac90d0d0daf65d8"]').exists();
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

  test('it should display Certifications menu in the sidebar-menu when FT_IS_CERTIFICATION_RESULTS_IN_ORGA_ENABLED is true and user is SCOManagingStudents', async function(assert) {
    // given
    class CurrentUserStub extends Service {
      organization = Object.create({ id: 1, type: 'SCO' });
      isAdminInOrganization = true;
      isSCOManagingStudents= true;
    }

    class FeatureToggleStub extends Service {
      isCertificationResultsInOrgaEnabled = true;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.register('service:feature-toggles', FeatureToggleStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<SidebarMenu />`);

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

    class FeatureToggleStub extends Service {
      isCertificationResultsInOrgaEnabled = false;
    }

    this.owner.register('service:current-user', CurrentUserStub);
    this.owner.register('service:feature-toggles', FeatureToggleStub);
    const intl = this.owner.lookup('service:intl');
    intl.setLocale(['fr', 'fr']);

    // when
    await render(hbs`<SidebarMenu />`);

    // then
    assert.notContains('Certification');
  });
});
