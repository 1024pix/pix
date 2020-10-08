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

  context('when render', () => {
    it('should focus the participant externalId input  ', async function() {
      // given
      await render(hbs`<Routes::Campaigns::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`);

      // then
      const focusedElement = document.activeElement;
      expect(focusedElement).to.be.not.null;
      expect(focusedElement.id).to.equal('id-pix-label', 'The participant external id was not focused');
    });
  });

  context('when externalIdHelpImageUrl exists', () => {
    it('should display image help', async function() {
      // when
      const campaign = {
        externalIdHelpImageUrl: '/images/pix-logo.svg',
      };
      this.set('campaign', campaign);

      // given
      await render(hbs`<Routes::Campaigns::FillInParticipantExternalId @campaign={{campaign}} @onSubmit={{this.onSubmitStub}} @onCancel={{this.onCancelStub}}/>`);

      // then
      expect(find('img')).to.exist;
    });
  });

  context('when externalIdHelpImageUrl does not exist', () => {
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
