import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.campaign-type.assessment'))).exists();
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should display profile collection campaign', async function (assert) {
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.campaign-type.profiles-collection'))).exists();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText('profil cible de la campagne 1')).exists();
      });

      test('it should display target profile description related to campaign', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileDescription: 'Description du profile cible',
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText('Description du profile cible')).exists();
      });

      test('it should display target profile tubes count related to campaign', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileTubesCount: 3,
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert
          .dom(
            screen.getByText(
              t('common.target-profile-details.subjects', { value: this.campaign.targetProfileTubesCount }),
            ),
          )
          .exists();
      });

      module('Badge context', function () {
        test('it should not display target profile thematic result when empty related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 0,
          });

          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert
            .dom(
              screen.queryByText(
                t('common.target-profile-details.thematic-results', {
                  value: this.campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .doesNotExist();
        });

        test('it should display target profile thematic result related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 1,
          });

          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert
            .dom(
              screen.getByText(
                t('common.target-profile-details.thematic-results', {
                  value: this.campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .exists();
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
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.star'))).exists();
        });

        test('it should display target profile result with percentage when no stages related to campaign', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: false,
          });

          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.percent'))).exists();
        });
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display target profile', async function (assert) {
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILE_COLLECTION',
          targetProfileName: 'profil cible inexistant',
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText('profil cible inexistant')).doesNotExist();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText('idPixLabel')).exists();
      });
    });

    module('when idPixLabel is not set', function () {
      test('it should not display the idPixLabel', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          idPixLabel: null,
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText(t('pages.campaign-settings.external-user-id-label'))).doesNotExist();
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
        const userOrgaSettings = store.createRecord('user-orga-setting', { organization });
        const membership = store.createRecord('membership', { organizationRole: 'ADMIN', organization });
        const memberships = [membership];
        const prescriber = store.createRecord('prescriber', { memberships, userOrgaSettings });

        class CurrentUserStub extends Service {
          prescriber = prescriber;
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', { code: '1234' });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText('root-url/1234')).exists();
      });
    });

    module("when prescriber's current organization has GAR as identity provider", function () {
      test('it should not display the campaign url', async function (assert) {
        // given
        const organization = store.createRecord('organization', {
          name: 'Willow school',
          identityProviderForCampaigns: 'GAR',
        });
        const userOrgaSettings = store.createRecord('user-orga-setting', { organization });
        const membership = store.createRecord('membership', { organizationRole: 'ADMIN', organization });
        const memberships = [membership];
        const prescriber = store.createRecord('prescriber', { memberships, userOrgaSettings });

        class CurrentUserStub extends Service {
          prescriber = prescriber;
        }
        this.owner.register('service:currentUser', CurrentUserStub);

        this.campaign = store.createRecord('campaign', { code: '1234' });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText('root-url/1234')).doesNotExist();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText('Mon titre de Campagne')).exists();
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display the campaign title', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          title: 'Mon titre de Campagne',
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText('Mon titre de Campagne')).doesNotExist();
      });
    });
  });

  module('on Archived action display', function () {
    test('it should display the button archived', async function (assert) {
      // given
      this.campaign = store.createRecord('campaign', { isArchived: false });

      // when
      const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
      // then
      assert.dom(screen.getByRole('button', { name: t('pages.campaign-settings.actions.archive') })).exists();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByRole('button', { name: t('pages.campaign-settings.actions.edit') })).doesNotExist();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.actions.edit'))).exists();
      });
    });

    module('when the campaign is archived', function () {
      test('it should not display the button modify', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', { isArchived: true });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert
          .dom(screen.queryByText(t('pages.campaign-settings.actions.editpages.campaign-settings.actions.edit')))
          .doesNotExist();
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
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.title'))).exists();
      });

      test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          multipleSendings: true,
        });

        // when
        const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.tooltip.text'))).exists();
      });

      module('when multiple sendings is true', function () {
        test("it should display 'oui'", async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
          });

          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.status.enabled'))).exists();
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
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.status.disabled'))).exists();
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
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.multiple-sendings.title'))).doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-settings.multiple-sendings.tooltip.aria-label')))
            .doesNotExist();
        });

        test('it should not display reset to zero label or tooltip', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileAreKnowledgeElementsResettable: true,
          });

          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-settings.reset-to-zero.tooltip.aria-label')))
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
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.title'))).exists();
        });

        test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.tooltip.text'))).exists();
        });
      });

      module('when the campaign has multiple sending enabled', function (hooks) {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            prescriber = { isAdminOfTheCurrentOrganization: true, enableMultipleSendingAssessment: true };
          }
          this.owner.register('service:currentUser', CurrentUserStub);
        });
        test('it should display reset to zero label as enabled when targetProfileAreKnowledgeElementsResettable is true', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.enabled')))
            .exists();
        });

        test('it should display the reset to zero label as disabled when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.disabled')))
            .exists();
        });

        test('it should display tooltip with reset to zero explanatory text', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.reset-to-zero.tooltip.text'))).exists();
        });
      });

      module('when the campaign has multiple sending disabled', function (hooks) {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            prescriber = { isAdminOfTheCurrentOrganization: true, enableMultipleSendingAssessment: true };
          }
          this.owner.register('service:currentUser', CurrentUserStub);
        });
        test('it should not display reset to zero label when targetProfileAreKnowledgeElementsResettable is true', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });

        test('it should not display the reset to zero label when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(hbs`<Campaign::Settings::View @campaign={{this.campaign}} />`);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });
      });
    });
  });
});
