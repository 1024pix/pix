import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

const TANTPIX_CONTAINER_CLASS = '.scoring-panel-tantpix';

describe('Integration | Component | scoring panel', function() {

  setupComponentTest('scoring-panel', {
    integration: true
  });

  const assessmentWithTrophy = EmberObject.create({ estimatedLevel: 1, pixScore: 67, course: { isAdaptive: true } });
  const assessmentWithNoTrophyAndSomePix = EmberObject.create({
    estimatedLevel: 0,
    pixScore: 20,
    course: { isAdaptive: true }
  });
  const assessmentWithNoTrophyAndNoPix = EmberObject.create({
    estimatedLevel: 0,
    pixScore: 0,
    course: { isAdaptive: true }
  });

  it('renders', function() {
    this.render(hbs`{{scoring-panel}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

  describe('Default display', function() {

    beforeEach(function() {
      this.set('assessment', assessmentWithNoTrophyAndNoPix);
      this.render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('it should not display trophy panel', function() {
      // then
      expect(this.$('.scoring-panel__trophy')).to.have.lengthOf(0);
      expect(this.$('.scoring-panel__text')).to.have.lengthOf(0);
    });

    it('should display tantpix result, when user has no reward', function() {
      // then
      expect(this.$(TANTPIX_CONTAINER_CLASS)).to.lengthOf(1);
    });
  });

  describe('Display a trophy when the user won a trophy', function() {

    beforeEach(function() {
      this.set('assessment', assessmentWithTrophy);
      this.render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('should display the won trophy', function() {
      // then
      expect(this.$('.scoring-panel__reward')).to.have.lengthOf(1);
      expect(this.$('.trophy-item')).to.have.lengthOf(1);
    });

    it('should display the congratulations', function() {
      // then
      expect(this.$('.scoring-panel__congrats-course-name')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-felicitations')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-scoring')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-beta')).to.have.lengthOf(1);
    });

    it('should display the "back to home" button', function() {
      // then
      expect(this.$('.scoring-panel__index-link')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__index-link-back').text()).to.be.equal('REVENIR À L\'ACCUEIL');
    });
  });

  describe('Display a medal when the user won some pix but not a trophy', function() {

    beforeEach(function() {
      this.set('assessment', assessmentWithNoTrophyAndSomePix);
      this.render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('should display the won medal', function() {
      // then
      // then
      expect(this.$('.scoring-panel__reward')).to.have.lengthOf(1);
      expect(this.$('.medal-item')).to.have.lengthOf(1);
    });

    it('should display the congratulations', function() {
      // then
      expect(this.$('.scoring-panel__congrats-course-name')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-pas-mal')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-scoring')).to.have.lengthOf(1);
      expect(this.$('.scoring-panel__congrats-beta')).to.have.lengthOf(1);
    });
  });

  describe('Display the BackToHome button', function() {

    beforeEach(function() {
      this.set('assessment', assessmentWithTrophy);
      this.render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('should not have a blue border when the user clicks on its', function() {
      // then
      expect(this.$('.scoring-panel__index-link__element').css('outline')).to.equal('rgb(255, 255, 255) none 0px');
    });
  });
});
