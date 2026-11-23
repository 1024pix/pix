import { render, within } from '@1024pix/ember-testing-library';
import CampaignTitle from 'pix-orga/components/campaign/header/title';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | CampaignTitle', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display campaign name', async function (assert) {
    // given
    const campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
      type: 'ASSESSMENT',
      isFromCombinedCourse: false,
    };

    // when
    const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

    // then
    const title = screen.getByRole('heading');

    assert.ok(within(title).getByRole('img', { name: t('components.activity-type.explanation.ASSESSMENT') }));
    assert.ok(within(title).getByText('campagne 1'));
    assert.ok(screen.getByText('1234PixTest'));
    assert.ok(screen.getByText('Mulan Fa'));
    assert.ok(screen.getByText('14/04/2021'));
  });

  test('it should display combined course name if campaign is from combined course', async function (assert) {
    // given
    const campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
      type: 'ASSESSMENT',
      isFromCombinedCourse: true,
      combinedCourse: { id: '1', name: 'COMBINIX' },
    };

    // when
    const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

    // then
    assert.ok(screen.getByText(new RegExp(t('pages.campaign.included-in-combined-course'))));
    assert.ok(screen.getByRole('link', { name: campaign.combinedCourse.name }));
  });

  test('it should not display combined course name if campaign is not from combined course', async function (assert) {
    // given
    const campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
      type: 'ASSESSMENT',
      isFromCombinedCourse: false,
      combinedCourse: { id: '1', name: 'ABC123' },
    };

    // when
    const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

    // then
    assert.notOk(screen.queryByText(t('pages.campaign.included-in-combined-course', { name: 'ABC123' })));
  });

  module('campaign code display', function () {
    test('it should display campaign code when campaign is not from combined course', async function (assert) {
      // given
      const campaign = {
        name: 'campagne 1',
        code: '1234PixTest',
        createdAt: new Date('2021-04-14'),
        ownerFullName: 'Mulan Fa',
        type: 'ASSESSMENT',
        isFromCombinedCourse: false,
      };

      // when
      const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

      // then
      assert.ok(screen.getByText('1234PixTest'));
      assert.ok(screen.getByText(t('pages.campaign.code')));
    });

    test('it should not display campaign code when campaign is from combined course', async function (assert) {
      // given
      const campaign = {
        name: 'campagne 1',
        code: '1234PixTest',
        createdAt: new Date('2021-04-14'),
        ownerFullName: 'Mulan Fa',
        type: 'ASSESSMENT',
        isFromCombinedCourse: true,
      };

      // when
      const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

      // then
      assert.notOk(screen.queryByText('1234PixTest'));
      assert.notOk(screen.queryByText(t('pages.campaign.code')));
    });
  });

  module('multiple sending display', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    module('when campaign type is PROFILES_COLLECTION', function () {
      test('it should display multiple sendings label', async function (assert) {
        // given
        const campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);
        // then
        assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.title')));
      });

      module('when multiple sendings is true', function () {
        test("it should display 'oui'", async function (assert) {
          // given
          const campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
          });

          // when
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

          // then
          assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.enabled')));
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
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

          // then
          assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.disabled')));
        });
      });
    });

    module('when type is ASSESSMENT', function () {
      module('when organization feature enableMultipleSending is false', function () {
        test('it should not display multiple sendings label', async function (assert) {
          // given
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: false,
          };
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });

          // when
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

          // then
          assert.notOk(screen.queryByText(t('pages.campaign.multiple-sendings.title')));
        });
      });

      module('when organization feature enableMultipleSending is true', function (hooks) {
        hooks.beforeEach(function () {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: true,
          };
        });

        test('it should display multiple sendings label', async function (assert) {
          // given
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: true,
          };
          const campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);
          // then
          assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.title')));
        });

        module('when the campaign multiple sending is true', function () {
          test("it should display 'oui'", async function (assert) {
            // given
            const campaign = store.createRecord('campaign', {
              type: 'ASSESSMENT',
              multipleSendings: true,
            });

            // when
            const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

            // then
            assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.enabled')));
          });
        });

        module('when the campaign multiple sending is false', function () {
          test("it should display 'non'", async function (assert) {
            // given
            const campaign = store.createRecord('campaign', {
              type: 'ASSESSMENT',
              multipleSendings: false,
            });

            // when
            const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

            // then
            assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.disabled')));
          });
        });
      });
    });

    module('when type is EXAM', function () {
      module('when organization feature enableMultipleSending is false', function () {
        test('it should not display multiple sendings label', async function (assert) {
          // given
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: false,
          };
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
          });

          // when
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

          // then
          assert.notOk(screen.queryByText(t('pages.campaign.multiple-sendings.title')));
        });
      });

      module('when organization feature enableMultipleSending is true', function (hooks) {
        hooks.beforeEach(function () {
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: true,
          };
        });

        test('it should display multiple sendings label', async function (assert) {
          // given
          const currentUser = this.owner.lookup('service:currentUser');
          currentUser.prescriber = {
            enableMultipleSendingAssessment: true,
          };
          const campaign = store.createRecord('campaign', {
            type: 'EXAM',
          });
          // when
          const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);
          // then
          assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.title')));
        });

        module('when the campaign multiple sending is true', function () {
          test("it should display 'oui'", async function (assert) {
            // given
            const campaign = store.createRecord('campaign', {
              type: 'EXAM',
              multipleSendings: true,
            });

            // when
            const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

            // then
            assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.enabled')));
          });
        });

        module('when the campaign multiple sending is false', function () {
          test("it should display 'non'", async function (assert) {
            // given
            const campaign = store.createRecord('campaign', {
              type: 'EXAM',
              multipleSendings: false,
            });

            // when
            const screen = await render(<template><CampaignTitle @campaign={{campaign}} /></template>);

            // then
            assert.ok(screen.getByText(t('pages.campaign.multiple-sendings.status.disabled')));
          });
        });
      });
    });
  });
});
