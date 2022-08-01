import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
        hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`
      );

      // then
      assert.dom(find('img')).exists();
      assert.dom(find('img').getAttribute('alt')).hasValue(campaign.alternativeTextToExternalIdHelpImage);
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
        hbs`<Routes::Campaigns::Invited::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`
      );

      // then
      assert.dom(find('img')).doesNotExist();
    });
  });
});
