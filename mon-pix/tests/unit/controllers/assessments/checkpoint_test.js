import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import Service from '@ember/service';
import setupIntl from '../../../helpers/setup-intl';
import EmberObject from '@ember/object';

describe('Unit | Controller | Assessments | Checkpoint', function() {

  setupTest();
  setupIntl();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessments/checkpoint');
  });

  describe('#nextPageButtonText', () => {
    it('should propose to continue the assessment if it is not the final checkpoint', function() {
      // when
      controller.set('finalCheckpoint', false);

      // then
      expect(controller.nextPageButtonText).to.equal('Continuer');
    });

    it('should propose to see the results of the assessment if it is the final checkpoint', function() {
      // when
      controller.set('finalCheckpoint', true);

      // then
      expect(controller.nextPageButtonText).to.equal('Voir mes résultats');
    });
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // then
      expect(controller.finalCheckpoint).to.be.false;
    });
  });

  describe('#completionPercentage', () => {
    it('should equal 100 if it is the final checkpoint', function() {
      // when
      controller.set('finalCheckpoint', true);

      // then
      expect(controller.completionPercentage).to.equal(100);
    });

    it('should equal the progression completionPercentage', function() {
      // when
      const model = EmberObject.create({
        progression: {
          completionPercentage: 73,
        },
      });
      controller.set('model', model);

      // then
      expect(controller.completionPercentage).to.equal(73);
    });
  });

  describe('#shouldDisplayAnswers', () => {
    it('should be true when answers are present', function() {
      // when
      const model = {
        answersSinceLastCheckpoints: [0, 1, 2],
      };
      controller.set('model', model);
      // then
      expect(controller.shouldDisplayAnswers).to.be.true;
    });

    it('should be false when answers are absent', function() {
      // when
      const model = {
        answersSinceLastCheckpoints: [],
      };
      controller.set('model', model);
      // then
      expect(controller.shouldDisplayAnswers).to.be.false;
    });
  });

  describe('#displayHomeLink', () => {
    it('should not display home link when user is anonymous', function() {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: true } });

      // when
      controller.displayHomeLink;

      // then
      expect(controller.displayHomeLink).to.be.false;
    });

    it('should display home link when user is not anonymous', function() {
      // given
      controller.currentUser = Service.create({ user: { isAnonymous: false } });

      // when
      controller.displayHomeLink;

      // then
      expect(controller.displayHomeLink).to.be.true;
    });
  });

  describe('#showLevelup', () => {
    it('should display level up pop-in when user has level up', function() {
      // given
      controller.newLevel = true;
      const model = { showLevelup: true };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.true;
    });

    it('should not display level up pop-in when user has not leveled up', function() {
      // given
      controller.newLevel = false;
      const model = { showLevelup: true };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.false;
    });

    it('should not display level up pop-in when it is not in assessment with level up', function() {
      // given
      controller.newLevel = true;
      const model = { showLevelup: false };
      controller.model = model;

      // then
      expect(controller.showLevelup).to.be.false;
    });
  });

});
