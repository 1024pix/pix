import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | results-warning', function() {

  setupComponentTest('results-warning', {
    integration: true
  });

  describe('Warning message display', function() {
    const campaignToResume = EmberObject.create({
      isShared: false,
      createdAt: '2018-01-01',
      campaign: EmberObject.create({
        code: 'AZERTY',
        title: 'Parcours Pix'
      })
    });
    const completedAndNotSharedCampaign = EmberObject.create({
      isShared: false,
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });
    const completedAndSharedCampaign = EmberObject.create({
      isShared: true,
      campaign: EmberObject.create({
        code: 'AZERTY',
      })
    });

    it('should display the warning message when user has began a campaign', function() {
      // given
      this.set('campaignParticipations', [campaignToResume]);
      // when
      this.render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.results-warning__warning-message')).to.have.lengthOf(1);
    });

    it('should display the warning message when user has completed a campaign but not shared his results yet', function() {
      // given
      this.set('campaignParticipations', [completedAndNotSharedCampaign]);
      // when
      this.render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.results-warning__warning-message')).to.have.lengthOf(1);
    });

    it('should display the warning message when user has completed a campaign and shared his results', function() {
      // given
      this.set('campaignParticipations', [completedAndSharedCampaign]);
      // when
      this.render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.results-warning__warning-message')).to.have.lengthOf(1);
    });

    it('should not display the warning message when user has not began any campaign', function() {
      // given
      this.set('campaignParticipations', []);
      // when
      this.render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(this.$('.results-warning__warning-message')).to.have.lengthOf(0);
    });
  });
});
