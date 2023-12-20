import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Campaign::Header::Title', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display campaign name', async function (assert) {
    // given
    this.campaign = {
      name: 'campagne 1',
      code: '1234PixTest',
      createdAt: new Date('2021-04-14'),
      ownerFullName: 'Mulan Fa',
      type: 'ASSESSMENT',
    };

    // when
    const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

    // then
    const title = screen.getByRole('heading');
    assert.true(title.textContent.includes(this.intl.t('components.campaign.type.explanation.ASSESSMENT')));
    assert.true(title.textContent.includes('campagne 1'));
    assert.ok(screen.getByText('1234PixTest'));
    assert.ok(screen.getByText('Mulan Fa'));
    assert.ok(screen.getByText('14/04/2021'));
  });

  module('multiple sending display', function (hooks) {
    let store;

    hooks.beforeEach(function () {
      store = this.owner.lookup('service:store');
    });

    module('when campaign type is PROFILES_COLLECTION', function () {
      test('it should display multiple sendings label', async function (assert) {
        // given
        this.campaign = store.createRecord('campaign', {
          type: 'PROFILES_COLLECTION',
        });

        // when
        const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);
        // then
        assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.title')));
      });

      module('when multiple sendings is true', function () {
        test("it should display 'oui'", async function (assert) {
          // given
          this.campaign = store.createRecord('campaign', {
            type: 'PROFILES_COLLECTION',
            multipleSendings: true,
          });

          // when
          const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

          // then
          assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.status.enabled')));
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
          const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

          // then
          assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.status.disabled')));
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
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });

          // when
          const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

          // then
          assert.notOk(screen.queryByText(this.intl.t('pages.campaign.multiple-sendings.title')));
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
          this.campaign = store.createRecord('campaign', {
            type: 'ASSESSMENT',
          });
          // when
          const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);
          // then
          assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.title')));
        });

        module('when the campaign multiple sending is true', function () {
          test("it should display 'oui'", async function (assert) {
            // given
            this.campaign = store.createRecord('campaign', {
              type: 'PROFILES_COLLECTION',
              multipleSendings: true,
            });

            // when
            const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

            // then
            assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.status.enabled')));
          });
        });

        module('when the campaign multiple sending is false', function () {
          test("it should display 'non'", async function (assert) {
            // given
            this.campaign = store.createRecord('campaign', {
              type: 'PROFILES_COLLECTION',
              multipleSendings: false,
            });

            // when
            const screen = await render(hbs`<Campaign::Header::Title @campaign={{this.campaign}} />`);

            // then
            assert.ok(screen.getByText(this.intl.t('pages.campaign.multiple-sendings.status.disabled')));
          });
        });
      });
    });
  });
});
