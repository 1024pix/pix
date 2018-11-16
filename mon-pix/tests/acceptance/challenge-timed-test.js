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

const TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcm_challenge_id';
const NOT_TIMED_CHALLENGE_URL = '/assessments/ref_assessment_id/challenges/ref_qcu_challenge_id';
const CHALLENGE_ITEM_WARNING_BUTTON = '.challenge-item-warning button';

describe('Acceptance | Timed challenge', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Displaying the challenge', function() {

    it('should hide the challenge statement', async function() {
      // When
      await visit(TIMED_CHALLENGE_URL);

      // Then
      expect($('.challenge-statement')).to.have.lengthOf(0);
    });

    it('should display the challenge statementif the challenge is not timed', async function() {
      // When
      await visit(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect($('.challenge-statement')).to.have.lengthOf(1);
    });

    it('should ensure the challenge does not automatically start', async function() {
      // Given
      await visit(TIMED_CHALLENGE_URL);

      // When
      await visit(NOT_TIMED_CHALLENGE_URL);

      // Then
      expect($('.timeout-jauge')).to.have.lengthOf(0);
    });

    it('should ensure the feedback form is not displayed until the user has started the challenge', async function() {
      // Given
      await visit(TIMED_CHALLENGE_URL);

      // Then
      expect($('.feedback-panel')).to.have.lengthOf(0);
    });

  });

  describe('When the confirmation button is clicked', function() {

    beforeEach(function() {
      visit(TIMED_CHALLENGE_URL);
      click(CHALLENGE_ITEM_WARNING_BUTTON);
    });

    it('should hide the warning button', function() {
      expect($(CHALLENGE_ITEM_WARNING_BUTTON)).to.have.lengthOf(0);
    });

    it('should display the challenge statement', function() {
      expect($('.challenge-statement').css('display')).to.contain('block');
    });

    it('should start the timer', function() {
      expect($('.timeout-jauge')).to.have.lengthOf(1);
    });

    it('should display the feedback form', function() {
      expect($('.feedback-panel')).to.have.lengthOf(1);
    });

  });

});
