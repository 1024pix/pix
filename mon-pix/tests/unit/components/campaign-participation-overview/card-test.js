import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | CampaignParticipation | Card', function() {
  let component;

  setupTest();

  beforeEach(function() {
    // given
    component = createGlimmerComponent('component:campaign-participation-overview/card');
  });

  describe('#status', function() {

    it('should return the status when the campaign is completed', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'completed' });

      // when
      const result = component.status;

      // then
      expect(result).to.eql({
        tagText: 'pages.campaign-participation-overview.card.tag.completed',
        tagColor: 'yellow-light',
        actionText: 'pages.campaign-participation-overview.card.send',
        actionClass: 'button--yellow',
      });
    });

    it('should return the status when the campaign is completed and shared', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'completed', isShared: true });

      // when
      const result = component.status;

      // then
      expect(result).to.eql({
        tagText: 'pages.campaign-participation-overview.card.tag.finished',
        tagColor: 'grey-light',
        actionText: 'pages.campaign-participation-overview.card.see-more',
        actionClass: '',
      });
    });

    it('should return the status when the campaign is not completed', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'started' });

      // when
      const result = component.status;

      // then
      expect(result).to.eql({
        tagText: 'pages.campaign-participation-overview.card.tag.started',
        tagColor: 'green-light',
        actionText: 'pages.campaign-participation-overview.card.resume',
        actionClass: '',
      });
    });
  });
});
