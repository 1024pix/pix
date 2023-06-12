import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | Campaign::Settings::View', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  class UrlStub extends Service {
    campaignsRootUrl = 'root-url/';
  }

  class CurrentUserStub extends Service {
    prescriber = { isAdminOfTheCurrentOrganization: true };
  }

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    this.owner.register('service:url', UrlStub);
    this.owner.register('service:currentUser', CurrentUserStub);
  });

  module('display the type of campaign', function () {
    module('when type is ASSESSMENT', function () {
      test('it should display assessment type', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains(`Campagne d'évaluation`);
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should display profile collection campaign', async function (assert) {
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('Campagne de collecte de profils');
      });
    });
  });

  module('on TargetProfile display', function () {
    module('when type is ASSESSMENT', function () {
      test('it should display target profile related to campaign', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileName: 'profil cible de la campagne 1',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('profil cible de la campagne 1');
      });

      test('it should display target profile description related to campaign', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileDescription: 'Description du profile cible',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('Description du profile cible');
      });

      test('it should display target profile tubes count related to campaign', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileTubesCount: 3,
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('Sujets : 3');
      });

      module('Badge context', function () {
        test('it should not display target profile thematic result when empty related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 0,
          });

          // when
          await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.notContains('Résultats thématiques :');
        });

        test('it should display target profile thematic result related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 1,
          });

          // when
          await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.contains('Résultats thématiques : 1');
        });
      });

      module('Display Result', function () {
        test('it should display target profile result with stars when stages related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: true,
          });

          // when
          await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(`[aria-label="${this.intl.t('common.target-profile-details.results.star')}"]`).exists();
        });

        test('it should display target profile result with percentage when no stages related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: false,
          });

          // when
          await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(`[aria-label="${this.intl.t('common.target-profile-details.results.percent')}"]`).exists();
        });
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display target profile', async function (assert) {
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.notContains('Profil cible');
      });
    });
  });

  module('on idPixLabel display', function () {
    module('when idPixLabel is set', function () {
      test('it should display the idPixLabel', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          idPixLabel: 'idPixLabel',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('idPixLabel');
      });
    });

    module('when idPixLabel is not set', function () {
      test('it should not display the idPixLabel', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          idPixLabel: null,
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.notContains("Libellé de l'identifiant");
      });
    });
  });

  module('on campaign url display', function () {
    module("when prescriber's current organization has not GAR as identity provider", function () {
      test('it should display the campaign url', async function (assert) {
        const organization = store.createRecord('organization', {
          name: 'Garfield school',
          identityProviderForCampaigns: null,
        });
        const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
        const membership = store.createRecord('membership', { organizationRole: 'ADMIN', organization });
        const memberships = [membership];
        const prescriber = store.createRecord('prescriber', { memberships, userOrgaSettings });

        class CurrentUserStub extends Service {
          prescriber = prescriber;
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', { code: '1234' });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('root-url/1234');
      });
    });

    module("when prescriber's current organization has GAR as identity provider", function () {
      test('it should not display the campaign url', async function (assert) {
        // given
        const organization = store.createRecord('organization', {
          name: 'Willow school',
          identityProviderForCampaigns: 'GAR',
        });
        const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
        const membership = store.createRecord('membership', { organizationRole: 'ADMIN', organization });
        const memberships = [membership];
        const prescriber = store.createRecord('prescriber', { memberships, userOrgaSettings });

        class CurrentUserStub extends Service {
          prescriber = prescriber;
        }
        this.owner.register('service:currentUser', CurrentUserStub);

        this.campaign = store.createRecord('campaign', { code: '1234' });

        // when
        await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.notContains('root-url/1234');
      });
    });
  });

  module('on campaign title display', function () {
    module('when type is ASSESSMENT', function () {
      test('it should display the campaign title', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          title: 'Mon titre de Campagne',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('Mon titre de Campagne');
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display the campaign title', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.notContains('Titre du parcours');
      });
    });
  });

  module('on Archived action display', function () {
    test('it should display the button archived', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', { isArchived: false });

      // when
      await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

      // then
      assert.contains('Archiver');
    });
  });

  module('on Modify action display', function () {
    module('when the user is a MEMBER and does not own the campaign', function () {
      test('it should not display the button modify', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: false };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', { isArchived: false, ownerId: 1 });

        // when
        const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText('Modifier')).doesNotExist();
      });
    });

    module('when the campaign is not archived', function () {
      test('it should display the button modify', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: true };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', { isArchived: false });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.contains('Modifier');
      });
    });

    module('when the campaign is archived', function () {
      test('it should not display the button modify', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', { isArchived: true });

        // when
        await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.notContains('Modifier');
      });
    });
  });

  module('on multiple sending display', function () {
    module('when type is PROFILES_COLLECTION', function () {
      test('it should display multiple sendings label', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });
        // when
        const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
        // then
        assert.dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.title'))).exists();
      });

      test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          multipleSendings: true,
        });

        // when
        const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.text'))).exists();
      });

      module('when multiple sendings is true', function () {
        test("it should display 'oui'", async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
          });

          // when
          const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert
            .dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.status.enabled')))
            .exists();
        });
      });

      module('when multiple sendings is false', function () {
        test("it should display 'Non'", async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: false,
          });

          // when
          const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert
            .dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.status.disabled')))
            .exists();
        });
      });
    });

    module('when type is ASSESSMENT', function () {
      module('when organization feature enableMultipleSending is false', function () {
        test('it should not display multiple sendings label or tooltip', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });

          // when
          const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.queryByText(this.intl.t('pages.campaign-settings.multiple-sendings.title'))).doesNotExist();
          assert
            .dom(screen.queryByLabelText(this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.aria-label')))
            .doesNotExist();
        });
      });
      module('when organization feature enableMultipleSending is true', function (hooks) {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            prescriber = { isAdminOfTheCurrentOrganization: true, enableMultipleSendingAssessment: true };
          }
          this.owner.register('service:currentUser', CurrentUserStub);
        });

        test('it should display multiple sendings label', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          assert.dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.title'))).exists();
        });

        test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await renderScreen(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByText(this.intl.t('pages.campaign-settings.multiple-sendings.tooltip.text'))).exists();
        });
      });
    });
  });
});
