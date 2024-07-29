import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
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
});
