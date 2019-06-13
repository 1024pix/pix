import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | results-warning', function() {

  setupRenderingTest();

  describe('Warning message display', function() {
    const campaignParticipationToResume = EmberObject.create({});

    it('should display the warning message when user has began a campaign', async function() {
      // given
      this.set('campaignParticipations', [campaignParticipationToResume]);
      // when
      await render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(find('.results-warning__warning-message')).to.exist;
    });

    it('should not display the warning message when user has not began any campaign', async function() {
      // given
      this.set('campaignParticipations', []);
      // when
      await render(hbs`{{results-warning campaignParticipations=campaignParticipations}}`);
      // then
      expect(find('.results-warning__warning-message')).to.not.exist;
    });
  });
});
