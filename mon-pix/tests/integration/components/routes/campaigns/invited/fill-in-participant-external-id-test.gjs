import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import FillInParticipantExternalId from 'mon-pix/components/routes/campaigns/fill-in-participant-external-id';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/invited/fill-in-participant-external-id', function (hooks) {
  setupIntlRenderingTest(hooks);

  const state = {};

  hooks.beforeEach(function () {
    state.onCancelStub = sinon.stub();
    state.onSubmitStub = sinon.stub();
  });

  module('when externalIdHelpImageUrl exists', function () {
    test('should display image help', async function (assert) {
      // when
      const campaign = {
        externalIdHelpImageUrl: '/images/pix-logo.svg',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      };

      // given
      const screen = await render(
        <template>
          <FillInParticipantExternalId
            @campaign={{campaign}}
            @onSubmit={{state.onSubmitStub}}
            @onCancel={{state.onCancelStub}}
          />
        </template>,
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

      // given
      await render(
        <template>
          <FillInParticipantExternalId
            @campaign={{campaign}}
            @onSubmit={{state.onSubmitStub}}
            @onCancel={{state.onCancelStub}}
          />
        </template>,
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

    const screen = await render(
      <template>
        <FillInParticipantExternalId
          @campaign={{campaign}}
          @onSubmit={{state.onSubmitStub}}
          @onCancel={{state.onCancelStub}}
        />
      </template>,
    );

    // when
    await fillIn(screen.getByLabelText(/idpix/), '1234');
    await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.continue') }));

    // then
    assert.ok(state.onSubmitStub.called);
    assert.ok(state.onCancelStub.notCalled);
  });

  test('should called on cancel button', async function (assert) {
    // given
    const campaign = {
      externalIdLabel: 'idpix',
      externaIdType: 'STRING',
    };

    const screen = await render(
      <template>
        <FillInParticipantExternalId
          @campaign={{campaign}}
          @onSubmit={{state.onSubmitStub}}
          @onCancel={{state.onCancelStub}}
        />
      </template>,
    );

    // when
    await click(screen.getByRole('button', { name: t('pages.fill-in-participant-external-id.buttons.cancel') }));

    // then
    assert.ok(state.onSubmitStub.notCalled);
    assert.ok(state.onCancelStub.called);
  });

  module('when fill participant externalId', function () {
    test('should display basic error when participantExternalId is empty', async function (assert) {
      // given
      const campaign = {
        externalIdLabel: 'idpix',
        externaIdType: 'STRING',
      };

      const screen = await render(
        <template>
          <FillInParticipantExternalId
            @campaign={{campaign}}
            @onSubmit={{state.onSubmitStub}}
            @onCancel={{state.onCancelStub}}
          />
        </template>,
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

      const screen = await render(
        <template>
          <FillInParticipantExternalId
            @campaign={{campaign}}
            @onSubmit={{state.onSubmitStub}}
            @onCancel={{state.onCancelStub}}
          />
        </template>,
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

          // given
          const screen = await render(
            <template>
              <FillInParticipantExternalId
                @campaign={{campaign}}
                @onSubmit={{state.onSubmitStub}}
                @onCancel={{state.onCancelStub}}
              />
            </template>,
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

        // given
        const screen = await render(
          <template>
            <FillInParticipantExternalId
              @campaign={{campaign}}
              @onSubmit={{state.onSubmitStub}}
              @onCancel={{state.onCancelStub}}
            />
          </template>,
        );
        const input = screen.getByLabelText(t('pages.signup.fields.email.help'), { exact: false });
        assert.ok(input);
      });
      test(`not return email example for string externaIdType`, async function (assert) {
        const campaign = {
          externalIdLabel: 'idpix',
          externaIdType: 'STRING',
        };

        // given
        const screen = await render(
          <template>
            <FillInParticipantExternalId
              @campaign={{campaign}}
              @onSubmit={{state.onSubmitStub}}
              @onCancel={{state.onCancelStub}}
            />
          </template>,
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
        // given & when
        const screen = await render(
          <template>
            <FillInParticipantExternalId
              @campaign={{campaign}}
              @onSubmit={{state.onSubmitStub}}
              @onCancel={{state.onCancelStub}}
            />
          </template>,
        );

        // then
        const input = screen.getByLabelText(/idpix/);
        assert.strictEqual(input.value, '1234TOTO');
        assert.ok(screen.getByText(t('pages.fill-in-participant-external-id.errors.invalid-external-id-email')));
      });

      test(`remove error message when update input`, async function (assert) {
        // given
        const screen = await render(
          <template>
            <FillInParticipantExternalId
              @campaign={{campaign}}
              @onSubmit={{state.onSubmitStub}}
              @onCancel={{state.onCancelStub}}
            />
          </template>,
        );

        // when
        await fillIn(screen.getByLabelText(/idpix/), '1234');

        // then
        assert.notOk(screen.queryByText(t('pages.fill-in-participant-external-id.errors.invalid-external-id-email')));
      });
    });
  });
});
