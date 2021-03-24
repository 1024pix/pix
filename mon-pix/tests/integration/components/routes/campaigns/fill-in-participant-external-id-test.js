import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | routes/campaigns/restricted/fill-in-participant-external-id', function() {
  setupIntlRenderingTest();

  let onSubmitStub;
  let onCancelStub;

  beforeEach(function() {
    this.set('onSubmitStub', onSubmitStub);
    this.set('onCancelStub', onCancelStub);
  });

  context('when externalIdHelpImageUrl exists', function() {
    it('should display image help', async function() {
      // when
      const campaign = {
        externalIdHelpImageUrl: '/images/pix-logo.svg',
        alternativeTextToExternalIdHelpImage: 'alternative text',
      };
      this.set('campaign', campaign);

      // given
      await render(hbs`<Routes::Campaigns::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`);

      // then
      expect(find('img')).to.exist;
      expect(find('img').getAttribute('alt')).to.contain(campaign.alternativeTextToExternalIdHelpImage);

    });
  });

  context('when externalIdHelpImageUrl does not exist', function() {
    it('should not display image help', async function() {
      // when
      const campaign = {
        externalIdHelpImageUrl: undefined,
      };
      this.set('campaign', campaign);

      // given
      await render(hbs`<Routes::Campaigns::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`);

      // then
      expect(find('img')).to.not.exist;
    });
  });

});
