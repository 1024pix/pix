import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/invited/fill-in-participant-external-id', function (hooks) {
  setupIntlRenderingTest(hooks);

  let onSubmitStub;
  let onCancelStub;

  hooks.beforeEach(function () {
    onCancelStub = sinon.stub();
    onSubmitStub = sinon.stub();
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
      const screen = await render(
        hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // then
      assert.dom('img').exists();
      assert.ok(screen.getByRole('img', { name: campaign.alternativeTextToExternalIdHelpImage }));
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
        hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // then
      assert.dom('img').doesNotExist();
    });
  });

  test('should called on submit button', async function (assert) {
    // given
    const campaign = {
      externalIdLabel: 'idpix',
      externaIdType: 'STRING',
    };

    this.set('campaign', campaign);
    const screen = await render(
      hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
    );

    // when
    await fillIn(screen.getByLabelText(/idpix/), '1234');
    await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.continue') }));

    // then
    assert.ok(onSubmitStub.called);
    assert.ok(onCancelStub.notCalled);
  });

  test('should called on cancel button', async function (assert) {
    // given
    const campaign = {
      externalIdLabel: 'idpix',
      externaIdType: 'STRING',
    };

    this.set('campaign', campaign);
    const screen = await render(
      hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
    );

    // when
    await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.cancel') }));

    // then
    assert.ok(onSubmitStub.notCalled);
    assert.ok(onCancelStub.called);
  });

  module('when fill participant externalId', function () {
    test('should display basic error when participantExternalId is empty', async function (assert) {
      // given
      const campaign = {
        externalIdLabel: 'idpix',
        externaIdType: 'STRING',
      };

      this.set('campaign', campaign);
      const screen = await render(
        hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // when
      await fillIn(screen.getByLabelText(/idpix/), ' ');
      await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.continue') }));

      // then
      assert.ok(
        screen.getByText(
          t('pages.fill-in-participant-external-id.errors.missing-external-id', {
            externalIdLabel: campaign.externalIdLabel,
          }),
        ),
      );
    });

    test('should display basic error when participantExternalId is over than 255 character', async function (assert) {
      // given
      const campaign = {
        externalIdLabel: 'idpix',
        externaIdType: 'STRING',
      };

      this.set('campaign', campaign);
      const screen = await render(
        hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
      );

      // when
      await fillIn(
        screen.getByLabelText(/idpix/),
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      );
      await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.continue') }));

      // then
      assert.ok(
        screen.getByText(
          t('pages.fill-in-participant-external-id.errors.max-length-external-id', {
            externalIdLabel: campaign.externalIdLabel,
          }),
        ),
      );
    });
  });

  module('with externalIdLabel and externaIdType', function () {
    module('idPixInputType', function () {
      Object.entries({ STRING: 'text', EMAIL: 'email' }).forEach(function ([externaIdType, inputType]) {
        test(`returns ${inputType} input type`, async function (assert) {
          const campaign = {
            externalIdLabel: 'idpix',
            externaIdType,
          };
          this.set('campaign', campaign);

          // given
          const screen = await render(
            hbs`<Routes::Campaigns::FillInParticipantExternalId
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
          externalIdLabel: 'idpix',
          externaIdType: 'EMAIL',
        };
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );
        const input = screen.getByLabelText(t('pages.signup.fields.email.help'), { exact: false });
        assert.ok(input);
      });
      test(`not return email example for string externaIdType`, async function (assert) {
        const campaign = {
          externalIdLabel: 'idpix',
          externaIdType: 'STRING',
        };
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );
        const input = screen.queryByLabelText(t('pages.signup.fields.email.help'), { exact: false });
        assert.notOk(input);
      });
    });

    module('with previousError', function (hooks) {
      const campaign = {
        code: 'ABCDE1234',
        externalIdLabel: 'idpix',
        externaIdType: 'EMAIL',
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

        // given & when
        const screen = await render(
          hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );

        // then
        const input = screen.getByLabelText(/idpix/);
        assert.strictEqual(input.value, '1234TOTO');
        assert.ok(screen.getByText(t('pages.fill-in-participant-external-id.errors.invalid-external-id-email')));
      });

      test(`remove error message when update input`, async function (assert) {
        this.set('campaign', campaign);

        // given
        const screen = await render(
          hbs`<Routes::Campaigns::FillInParticipantExternalId
  @campaign={{this.campaign}}
  @onSubmit={{this.onSubmitStub}}
  @onCancel={{this.onCancelStub}}
/>`,
        );

        // when
        await fillIn(screen.getByLabelText(/idpix/), '1234');

        // then
        assert.notOk(screen.queryByText(t('pages.fill-in-participant-external-id.errors.invalid-external-id-email')));
      });
    });
  });
});
