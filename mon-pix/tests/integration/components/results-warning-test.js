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
    const campaignParticipationToResume = EmberObject.create({});

    it('should display the warning message when user has began a campaign', function() {
      // given
      this.set('campaignParticipations', [campaignParticipationToResume]);
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
