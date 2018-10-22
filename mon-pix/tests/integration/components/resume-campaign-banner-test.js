import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe.only('Integration | Component | resume-campaign-banner', function () {

  setupComponentTest('resume-campaign-banner', {
    integration: true
  });

  describe('Banner display', function () {

    it('should display the resume campaign banner when `canResumeCampaign` is true', function () {
      // Given
      this.set('canResumeCampaign', true);
      // When
      this.render(hbs`{{resume-campaign-banner}}`);
      // Then
      expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(1);
    });

    it('should not display the resume campaign banner when `canResumeCampaign` is false', function () {
      // Given
      this.set('canResumeCampaign', false);
      // When
      this.render(hbs`{{resume-campaign-banner}}`);
      // Then
      expect(this.$('.resume-campaign-banner__container')).to.have.lengthOf(0);
    });
  });
});
