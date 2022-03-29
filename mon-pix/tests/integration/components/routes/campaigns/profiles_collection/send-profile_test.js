import { describe, it } from 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { contains } from '../../../../../helpers/contains';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | routes/campaigns/profiles_collection/send-profile', function () {
  setupIntlRenderingTest();

  context('when isDisabled is true', () => {
    it('should not display the share results button', async function () {
      // given
      this.set('isDisabled', true);
      this.set('campaignParticipation', { isShared: false });

      // when
      await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile @isDisabled={{isDisabled}} @campaignParticipation={{campaignParticipation}} />`
      );

      expect(contains(this.intl.t('pages.send-profile.form.send'))).to.not.exist;
    });
  });

  context('when isDisabled is false', () => {
    it('should call sendProfile property', async function () {
      // given
      const sendProfile = sinon.stub();
      this.set('isDisabled', false);
      this.set('sendProfile', sendProfile);
      this.set('campaignParticipation', { isShared: false });

      // when
      await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile @isDisabled={{isDisabled}} @campaignParticipation={{campaignParticipation}} @sendProfile={{sendProfile}} />`
      );
      await clickByLabel(this.intl.t('pages.send-profile.form.send'));

      sinon.assert.called(sendProfile);
    });
  });
});
