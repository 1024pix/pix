import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/invited/fill-in-participant-external-id', function (hooks) {
  setupIntlRenderingTest(hooks);

  let onSubmitStub;
  let onCancelStub;

  hooks.beforeEach(function () {
    this.set('onSubmitStub', onSubmitStub);
    this.set('onCancelStub', onCancelStub);
  });

  module('when externalIdHelpImageUrl exists', function () {
    test('should display image help', async function (assert) {
      // when
      const campaign = {
        externalIdHelpImageUrl: '/images/pix-logo.svg',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      };
      this.set('campaign', campaign);

      // given
      await render(
        hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // then
      assert.dom('img').exists();
      assert.ok(find('img').getAttribute('alt').includes(campaign.alternativeTextToExternalIdHelpImage));
    });
  });

  module('when externalIdHelpImageUrl does not exist', function () {
    test('should not display image help', async function (assert) {
      // when
      const campaign = {
        externalIdHelpImageUrl: undefined,
      };
      this.set('campaign', campaign);

      // given
      await render(
        hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // then
      assert.dom('img').doesNotExist();
    });
  });

  module('with idPixLabel and idPixType', function () {
    module('idPixInputType', function () {
      Object.entries({ STRING: 'text', EMAIL: 'email' }).forEach(function ([idPixType, inputType]) {
        test(`returns ${inputType} input type`, async function (assert) {
          const campaign = {
            idPixLabel: 'idpix',
            idPixType,
          };
          this.set('campaign', campaign);

          // given
          const screen = await render(
            hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
          );
          const input = screen.getByLabelText(/idpix/);
          assert.strictEqual(input.type, inputType);
        });
      });
    });

    module('idPixSubLabel', function () {
      test(`returns email example key for input`, async function (assert) {
        const campaign = {
          idPixLabel: 'idpix',
          idPixType: 'EMAIL',
        };
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );
        const input = screen.getByLabelText(t('pages.sign-up.fields.email.help'), { exact: false });
        assert.ok(input);
      });
      test(`not return email example for string idPixType`, async function (assert) {
        const campaign = {
          idPixLabel: 'idpix',
          idPixType: 'STRING',
        };
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );
        const input = screen.queryByLabelText(t('pages.sign-up.fields.email.help'), { exact: false });
        assert.notOk(input);
      });
    });

    module('with previousError', function (hooks) {
      const campaign = {
        code: 'ABCDE1234',
        idPixLabel: 'idpix',
        idPixType: 'EMAIL',
      };

      hooks.beforeEach(function () {
        const campaignStorage = this.owner.lookup('service:campaignStorage');
        campaignStorage.set(campaign.code, 'error', 'INVALID_EMAIL');
        campaignStorage.set(campaign.code, 'previousParticipantExternalId', '1234TOTO');
      });
      hooks.afterEach(function () {
        const campaignStorage = this.owner.lookup('service:campaignStorage');
        campaignStorage.clear(campaign.code);
      });

      test(`initialize error and previous external id`, async function (assert) {
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );
        const input = screen.getByLabelText(/idpix/);
        assert.strictEqual(input.value, '1234TOTO');
        assert.ok(screen.getByText(t('pages.fill-in-participant-external-id.errors.invalid-external-id-email')));
      });
    });
  });
});
