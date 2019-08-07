import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

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
      expect(find('.checkpoint-progression-gauge-wrapper')).to.have.lengthOf(1);
      expect(find('.assessment-results__list')).to.have.lengthOf(1);
      expect(find('.result-item')).to.have.lengthOf(4);
      expect(find('.checkpoint__continue').text()).to.contain('Continuer mon parcours');
      expect(find('.checkpoint-no-answer')).to.have.lengthOf(0);
    });
  });

  describe('Without answers', () => {

    it('should display a message indicating that there is no answers to provide', async () => {
      // When
      await visit('/assessments/ref_assessment_id_no_answer/checkpoint?finalCheckpoint=true');

      // then
      expect(find('.checkpoint-progression-gauge-wrapper')).to.have.lengthOf(0);
      expect(find('.assessment-results__list')).to.have.lengthOf(0);
      expect(find('.checkpoint-no-answer')).to.have.lengthOf(1);

      const continueElement = find('.checkpoint__continue');
      expect(continueElement).to.have.lengthOf(1);
      expect(continueElement.text()).to.contain('Voir mes résultats');
      expect(find('.checkpoint-no-answer__info').text()).to.contain('Vous avez déjà répondu aux questions, lors de vos parcours précédents. Vous pouvez directement accéder à vos résultats.');
    });
  });
});
