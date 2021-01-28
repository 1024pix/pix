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

    it('should return the status when the participation is completed', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'completed' });

      // when
      const result = component.status;

      // then
      expect(result).to.deep.equal({
        tagText: 'pages.campaign-participation-overview.card.tag.completed',
        tagColor: 'yellow-light',
        actionText: 'pages.campaign-participation-overview.card.send',
        actionClass: 'button button--link button--yellow',
        dateText: 'pages.campaign-participation-overview.card.started-at',
      });
    });

    it('should return the status when the participation is completed and shared', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'completed', isShared: true });

      // when
      const result = component.status;

      // then
      expect(result).to.deep.equal({
        tagText: 'pages.campaign-participation-overview.card.tag.finished',
        tagColor: 'grey-light',
        actionText: 'pages.campaign-participation-overview.card.see-more',
        actionClass: 'link campaign-participation-overview-card__see-more',
        dateText: 'pages.campaign-participation-overview.card.finished-at',
      });
    });

    it('should return the status when the participation is not completed', function() {
      // given
      component.args.model = EmberObject.create({ assessmentState: 'started' });

      // when
      const result = component.status;

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

  describe('#date', function() {
    it('should return the sharing date when the participation is shared', function() {
      // given
      component.args.model = EmberObject.create({ isShared: true, sharedAt: '2020-12-18T15:16:20.109Z' });

      // when
      const result = component.date;

      // then
      expect(result).to.equal('2020-12-18T15:16:20.109Z');
    });
    it('should return the starting date when the participation is not shared', function() {
      // given
      component.args.model = EmberObject.create({ isShared: false, createdAt: '2020-12-10T15:16:20.109Z' });

      // when
      const result = component.date;

      // then
      expect(result).to.equal('2020-12-10T15:16:20.109Z');
    });
  });
});
