import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import $ from 'jquery';

describe('Acceptance | Checkpoint', () => {

  let application;

  beforeEach(() => {
    application = startApp();
  });

  afterEach(() => {
    destroyApp(application);
  });

  describe('With answers', () => {

    it('should display questions and links to solutions', async () => {
      // When
      await visit('/assessments/ref_assessment_id/checkpoint');

      // then
      expect($('.checkpoint-progression-gauge-wrapper')).to.have.lengthOf(1);
      expect($('.assessment-results__list')).to.have.lengthOf(1);
      expect($('.result-item-campaign')).to.have.lengthOf(4);
      expect($('.checkpoint__continue').text()).to.contain('Continuer mon parcours');
      expect($('.checkpoint-no-answer')).to.have.lengthOf(0);
    });
  });

  describe('Without answers', () => {

    it('should display a message indicating that there is no answers to provide', async () => {
      // When
      await visit('/assessments/ref_assessment_id_no_answer/checkpoint?finalCheckpoint=true');

      // then
      expect($('.checkpoint-progression-gauge-wrapper')).to.have.lengthOf(0);
      expect($('.assessment-results__list')).to.have.lengthOf(0);
      expect($('.checkpoint-no-answer')).to.have.lengthOf(1);

      const continueElement = $('.checkpoint__continue');
      expect(continueElement).to.have.lengthOf(1);
      expect(continueElement.text()).to.contain('Voir mes résultats');

      const infoElementText = $('.checkpoint-no-answer__info').text();
      expect(infoElementText).to.contain('Vous avez déjà passé toutes les questions de ce parcours.');
      expect(infoElementText).to.contain('Partagez vos résultats depuis l’écran suivant.');
    });
  });
});
