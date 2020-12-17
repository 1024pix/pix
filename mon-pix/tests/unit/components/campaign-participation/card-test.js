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
    component = createGlimmerComponent('component:campaign-participation/card');
  });

  describe('#status', function() {

    it('should return the status when the campaign is completed', function() {
      // given
      const assessment = EmberObject.create({
        state: 'completed',
      });
      component.args.model = EmberObject.create({ assessment });

      // when
      const result = component.status;

      // then
      expect(result).to.eql({
        tagText: 'pages.campaign-participation.card.tag.completed',
        tagColor: 'yellow-light',
        actionText: 'pages.campaign-participation.card.send',
        actionClass: 'button--yellow',
      });
    });

    it('should return the status when the campaign is not completed', function() {
      // given
      const assessment = EmberObject.create({
        state: 'started',
      });
      component.args.model = EmberObject.create({ assessment });

      // when
      const result = component.status;

      // then
      expect(result).to.eql({
        tagText: 'pages.campaign-participation.card.tag.started',
        tagColor: 'green-light',
        actionText: 'pages.campaign-participation.card.resume',
        actionClass: '',
      });
    });
  });
});
