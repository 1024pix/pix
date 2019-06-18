import EmberObject from '@ember/object';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const TANTPIX_CONTAINER_CLASS = '.scoring-panel-tantpix';

describe('Integration | Component | scoring panel', function() {

  setupRenderingTest();

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

  it('renders', async function() {
    await render(hbs`{{scoring-panel}}`);
    expect(find('.scoring-panel')).to.exist;
  });

  describe('Default display', function() {

    beforeEach(async function() {
      this.set('assessment', assessmentWithNoTrophyAndNoPix);
      await render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('it should not display trophy panel', function() {
      // then
      expect(find('.scoring-panel__trophy')).to.not.exist;
      expect(find('.scoring-panel__text')).to.not.exist;
    });

    it('should display tantpix result, when user has no reward', function() {
      // then
      expect(find(TANTPIX_CONTAINER_CLASS)).to.exist;
    });
  });

  describe('Display a trophy when the user won a trophy', function() {

    beforeEach(async function() {
      this.set('assessment', assessmentWithTrophy);
      await render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('should display the won trophy', function() {
      // then
      expect(find('.scoring-panel__reward')).to.exist;
      expect(find('.trophy-item')).to.exist;
    });

    it('should display the congratulations', function() {
      // then
      expect(find('.scoring-panel__congrats-course-name')).to.exist;
      expect(find('.scoring-panel__congrats-felicitations')).to.exist;
      expect(find('.scoring-panel__congrats-scoring')).to.exist;
    });

    it('should display the "back to home" button', function() {
      // then
      expect(find('.scoring-panel__index-link')).to.exist;
      expect(find('.scoring-panel__index-link-back').textContent).to.be.equal('REVENIR À L\'ACCUEIL');
    });
  });

  describe('Display a medal when the user won some pix but not a trophy', function() {

    beforeEach(async function() {
      this.set('assessment', assessmentWithNoTrophyAndSomePix);
      await render(hbs`{{scoring-panel assessment=assessment}}`);
    });

    it('should display the won medal', function() {
      // then
      // then
      expect(find('.scoring-panel__reward')).to.exist;
      expect(find('.medal-item')).to.exist;
    });

    it('should display the congratulations', function() {
      // then
      expect(find('.scoring-panel__congrats-course-name')).to.exist;
      expect(find('.scoring-panel__congrats-pas-mal')).to.exist;
      expect(find('.scoring-panel__congrats-scoring')).to.exist;
    });
  });
});
