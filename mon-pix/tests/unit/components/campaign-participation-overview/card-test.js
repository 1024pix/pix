import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | CampaignParticipation | Card', function() {
  let component;
  let store;

  setupTest();

  beforeEach(function() {
    // given
    store = this.owner.lookup('service:store');
    component = createGlimmerComponent('component:campaign-participation-overview/card');
  });

  describe('#cardInfo', function() {

    it('should return the card info when the status is "completed"', function() {
      // given
      component.args.model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
      });

      // when
      const result = component.cardInfo;

      // then
      expect(result).to.deep.equal({
        tagText: 'pages.campaign-participation-overview.card.tag.completed',
        tagColor: 'yellow-light',
        actionText: 'pages.campaign-participation-overview.card.send',
        actionClass: 'button button--link button--yellow',
        dateText: 'pages.campaign-participation-overview.card.started-at',
      });
    });

    it('should return the card info when the status is "finished"', function() {
      // given
      component.args.model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'completed',
        isShared: true,
      });

      // when
      const result = component.cardInfo;

      // then
      expect(result).to.deep.equal({
        tagText: 'pages.campaign-participation-overview.card.tag.finished',
        tagColor: 'grey-light',
        actionText: 'pages.campaign-participation-overview.card.see-more',
        actionClass: 'link campaign-participation-overview-card__see-more',
        dateText: 'pages.campaign-participation-overview.card.finished-at',
      });
    });

    it('should return the card info when the status is "started"', function() {
      // given
      component.args.model = store.createRecord('campaign-participation-overview', {
        assessmentState: 'started',
      });

      // when
      const result = component.cardInfo;

      // then
      expect(result).to.deep.equal({
        tagText: 'pages.campaign-participation-overview.card.tag.started',
        tagColor: 'green-light',
        actionText: 'pages.campaign-participation-overview.card.resume',
        actionClass: 'button button--link',
        dateText: 'pages.campaign-participation-overview.card.started-at',
      });
    });
  });
});
