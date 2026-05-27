import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import View from 'pix-orga/components/campaign/settings/view';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Settings::View', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  class UrlStub extends Service {
    campaignsRootUrl = 'root-url/';
  }

  class CurrentUserStub extends Service {
    prescriber = { isAdminOfTheCurrentOrganization: true };
    organization = { id: 456 };
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
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.campaign-type.assessment'))).exists();
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should display profile collection campaign', async function (assert) {
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.campaign-type.profiles-collection'))).exists();
      });
    });

    module('when type is EXAM', function () {
      test('it should display profile collection campaign', async function (assert) {
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.campaign-type.exam'))).exists();
      });
    });
  });

  module('on TargetProfile display', function () {
    module('when type is ASSESSMENT', function () {
      test('it should display target profile related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileName: 'profil cible de la campagne 1',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('profil cible de la campagne 1')).exists();
      });

      test('it should display target profile description related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileDescription: 'Description du profile cible',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('Description du profile cible')).exists();
      });

      test('it should display target profile tubes count related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfileTubesCount: 3,
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert
          .dom(
            screen.getByText(t('common.target-profile-details.subjects', { value: campaign.targetProfileTubesCount })),
          )
          .exists();
      });

      test('it should display with account when simplified access is false', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfile: store.createRecord('target-profile', {
            isSimplifiedAccess: false,
          }),
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.ok(screen.getByText(t('common.target-profile-details.simplified-access.with-account')));
      });

      test('it should display without account when simplified access is true', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          targetProfile: store.createRecord('target-profile', {
            isSimplifiedAccess: true,
          }),
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.ok(screen.getByText(t('common.target-profile-details.simplified-access.without-account')));
      });

      module('Badge context', function () {
        test('it should not display target profile thematic result when empty related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 0,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert
            .dom(
              screen.queryByText(
                t('common.target-profile-details.thematic-results', {
                  value: campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .doesNotExist();
        });

        test('it should display target profile thematic result related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileThematicResultCount: 1,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert
            .dom(
              screen.getByText(
                t('common.target-profile-details.thematic-results', {
                  value: campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .exists();
        });
      });

      module('Display Result', function () {
        test('it should display target profile result with stars when stages related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: true,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.star'))).exists();
        });

        test('it should display target profile result with percentage when no stages related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileHasStage: false,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.percent'))).exists();
        });
      });
    });

    module('when type is EXAM', function () {
      test('it should display target profile related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileName: 'profil cible de la campagne 1',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('profil cible de la campagne 1')).exists();
      });

      test('it should display target profile description related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileDescription: 'Description du profile cible',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('Description du profile cible')).exists();
      });

      test('it should display target profile tubes count related to campaign', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          targetProfileTubesCount: 3,
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert
          .dom(
            screen.getByText(t('common.target-profile-details.subjects', { value: campaign.targetProfileTubesCount })),
          )
          .exists();
      });

      module('Badge context', function () {
        test('it should not display target profile thematic result when empty related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileThematicResultCount: 0,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert
            .dom(
              screen.queryByText(
                t('common.target-profile-details.thematic-results', {
                  value: campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .doesNotExist();
        });

        test('it should display target profile thematic result related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileThematicResultCount: 1,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert
            .dom(
              screen.getByText(
                t('common.target-profile-details.thematic-results', {
                  value: campaign.targetProfileThematicResultCount,
                }),
              ),
            )
            .exists();
        });
      });

      module('Display Result', function () {
        test('it should display target profile result with stars when stages related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileHasStage: true,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.star'))).exists();
        });

        test('it should display target profile result with percentage when no stages related to campaign', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileHasStage: false,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByLabelText(t('common.target-profile-details.results.percent'))).exists();
        });
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display target profile', async function (assert) {
        const campaign = store.createRecord('campaign', {
          type: 'PROFILE_COLLECTION',
          targetProfileName: 'profil cible inexistant',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.queryByText('profil cible inexistant')).doesNotExist();
      });
    });
  });

  module('on externalIdLabel display', function () {
    module('when externalIdLabel is set', function () {
      test('it should display the externalIdLabel', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          externalIdLabel: 'externalIdLabel',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('externalIdLabel')).exists();
      });
    });

    module('when externalIdLabel is not set', function () {
      test('it should not display the externalIdLabel', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          externalIdLabel: null,
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
        const campaign = store.createRecord('campaign', { code: '1234' });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

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

        const campaign = store.createRecord('campaign', { code: '1234' });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.queryByText('root-url/1234')).doesNotExist();
      });
    });
  });

  module('on campaign title display', function () {
    module('when type is ASSESSMENT', function () {
      test('it should display the campaign title', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'ASSESSMENT',
          title: 'Mon titre de Campagne',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('Mon titre de Campagne')).exists();
      });
    });

    module('when type is EXAM', function () {
      test('it should display the campaign title', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'EXAM',
          title: 'Mon titre de Campagne',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText('Mon titre de Campagne')).exists();
      });
    });

    module('when type is PROFILES_COLLECTION', function () {
      test('it should not display the campaign title', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          title: 'Mon titre de Campagne',
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.queryByText('Mon titre de Campagne')).doesNotExist();
      });
    });
  });

  module('on Archived action display', function () {
    test('it should display the button archived', async function (assert) {
      // given
      const campaign = store.createRecord('campaign', { isArchived: false });

      // when
      const screen = await render(<template><View @campaign={{campaign}} /></template>);
      // then
      assert.dom(screen.getByRole('button', { name: t('pages.campaign-settings.actions.archive') })).exists();
    });
  });

  module('Delete campaign Action', function () {
    module('when the user is a MEMBER and does not own the campaign', function () {
      test('it should not display the delete button', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: false };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        const campaign = store.createRecord('campaign', { isArchived: false, ownerId: 1 });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.queryByRole('button', { name: t('pages.campaign-settings.actions.delete') })).doesNotExist();
      });
    });
    module('when user is ADMIN or owns the campaign', function () {
      test('it should display the delete button', async function (assert) {
        // given
        const campaign = store.createRecord('campaign');

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') })).exists();
      });

      module('when deleting campaign', function (hooks) {
        let deleteStub, routerService, replaceWithStub, notificationsService;

        hooks.beforeEach(function () {
          deleteStub = sinon.stub();
          notificationsService = this.owner.lookup('service:notifications');
          routerService = this.owner.lookup('service:router');
          sinon.stub(store, 'adapterFor').withArgs('campaign').returns({ delete: deleteStub });
          sinon.stub(store, 'peekRecord');
          replaceWithStub = sinon.stub(routerService, 'replaceWith');
        });

        test('it should open the confirmation modal when clicking the delete button', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', { isArchived: false });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');

          // then
          assert
            .dom(screen.getByRole('heading', { name: t('pages.campaign-settings.delete-confirmation-modal.title') }))
            .exists();
          assert.ok(deleteStub.notCalled);
        });

        test('it should not delete campaign when cancelling the confirmation modal', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', { isArchived: false });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');
          await click(screen.getByRole('button', { name: t('common.actions.cancel') }));

          // then
          assert.ok(deleteStub.notCalled);
        });

        test('it should delete campaign after confirmation', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', { isArchived: false });
          deleteStub.resolves(true);

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');
          await click(screen.getByLabelText(t('components.ui.deletion-modal.confirmation-checkbox', { count: 1 })));
          await click(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));

          // then
          assert.ok(deleteStub.calledOnceWithExactly(456, [campaign.id]));
        });

        test('it should display a success notification', async function (assert) {
          // given
          sinon.stub(notificationsService, 'sendSuccess');
          const campaign = store.createRecord('campaign', { isArchived: false });
          deleteStub.resolves();

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');
          await click(screen.getByLabelText(t('components.ui.deletion-modal.confirmation-checkbox', { count: 1 })));
          await click(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));

          // then
          assert.ok(
            notificationsService.sendSuccess.calledOnceWithExactly(t('pages.campaign-settings.actions.delete-success')),
          );
        });

        test('it should display an error notification when delete fails', async function (assert) {
          // given
          sinon.stub(notificationsService, 'sendError');
          const campaign = store.createRecord('campaign', { isArchived: false });
          deleteStub.rejects();

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');
          await click(screen.getByLabelText(t('components.ui.deletion-modal.confirmation-checkbox', { count: 1 })));
          await click(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));

          // then
          assert.ok(
            notificationsService.sendError.calledOnceWithExactly(t('pages.campaign-settings.actions.delete-error')),
          );
        });

        test('it should redirect to index after delete', async function (assert) {
          // given
          sinon.stub(notificationsService, 'sendSuccess');
          const campaign = store.createRecord('campaign', { isArchived: false });
          deleteStub.resolves();

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          await click(screen.getByRole('button', { name: t('pages.campaign-settings.actions.delete') }));
          await screen.findByRole('dialog');
          await click(screen.getByLabelText(t('components.ui.deletion-modal.confirmation-checkbox', { count: 1 })));
          await click(screen.getByRole('button', { name: t('components.ui.deletion-modal.confirm-deletion') }));

          // then
          assert.ok(replaceWithStub.calledOnceWithExactly('authenticated.campaigns.list.my-campaigns'));
        });
      });
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
        const campaign = store.createRecord('campaign', { isArchived: false, ownerId: 1 });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
        const campaign = store.createRecord('campaign', { isArchived: false });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.actions.edit'))).exists();
      });
    });

    module('when the campaign is archived', function () {
      test('it should not display the button modify', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', { isArchived: true });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);
        // then
        assert.dom(screen.queryByText(t('pages.campaign-settings.actions.edit'))).doesNotExist();
      });
    });
  });

  module('on multiple sending display', function () {
    module('when type is PROFILES_COLLECTION', function () {
      test('it should display multiple sendings label', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });
        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);
        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.title'))).exists();
      });

      test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
          multipleSendings: true,
        });

        // when
        const screen = await render(<template><View @campaign={{campaign}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.tooltip.text'))).exists();
      });

      module('when multiple sendings is true', function () {
        test("it should display 'oui'", async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.status.enabled'))).exists();
        });
      });

      module('when multiple sendings is false', function () {
        test("it should display 'Non'", async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: false,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.status.disabled'))).exists();
        });
      });
    });

    module('when type is ASSESSMENT', function () {
      module('when organization feature enableMultipleSending is false', function () {
        test('it should not display multiple sendings label or tooltip', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.multiple-sendings.title'))).doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-settings.multiple-sendings.tooltip.aria-label')))
            .doesNotExist();
        });

        test('it should not display reset to zero label or tooltip', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            targetProfileAreKnowledgeElementsResettable: true,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.title'))).exists();
        });

        test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.enabled')))
            .exists();
        });

        test('it should display the reset to zero label as disabled when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.disabled')))
            .exists();
        });

        test('it should display tooltip with reset to zero explanatory text', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });

        test('it should not display the reset to zero label when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });
      });
    });

    module('when type is EXAM', function () {
      module('when organization feature enableMultipleSending is false', function () {
        test('it should not display multiple sendings label or tooltip', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.multiple-sendings.title'))).doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-settings.multiple-sendings.tooltip.aria-label')))
            .doesNotExist();
        });

        test('it should not display reset to zero label or tooltip', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            targetProfileAreKnowledgeElementsResettable: true,
          });

          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.getByText(t('pages.campaign-settings.multiple-sendings.title'))).exists();
        });

        test('it should display tooltip with multiple sendings explanatory text', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.enabled')))
            .exists();
        });

        test('it should display the reset to zero label as disabled when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            multipleSendings: true,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          const resetToZeroNode = screen.getByText(t('pages.campaign-settings.reset-to-zero.title')).parentNode
            .parentNode;
          assert
            .dom(within(resetToZeroNode).getByText(t('pages.campaign-settings.reset-to-zero.status.disabled')))
            .exists();
        });

        test('it should display tooltip with reset to zero explanatory text', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            multipleSendings: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);

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
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: true,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });

        test('it should not display the reset to zero label when targetProfileAreKnowledgeElementsResettable is false', async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
            multipleSendings: false,
            targetProfileAreKnowledgeElementsResettable: false,
          });
          // when
          const screen = await render(<template><View @campaign={{campaign}} /></template>);
          // then
          assert.dom(screen.queryByText(t('pages.campaign-settings.reset-to-zero.title'))).doesNotExist();
        });
      });
    });
  });
});
