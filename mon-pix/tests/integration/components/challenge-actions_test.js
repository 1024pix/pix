import RSVP from 'rsvp';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const VALIDATE_BUTTON = '.challenge-actions__action-validate';
const SKIP_BUTTON = '.challenge-actions__action-skip';

describe('Integration | Component | challenge actions', function() {

  setupIntlRenderingTest();

  it('renders', async function() {
    await render(hbs`<ChallengeActions/>`);
    expect(find('.challenge-actions__action')).to.exist;
  });

  describe('Validate button (and placeholding loader)', function() {

    it('should be displayed and enabled by default but not loader', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', true);
      this.set('validateActionStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @validateAnswer={{this.validateActionStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(find(VALIDATE_BUTTON)).to.exist;
      expect(find('.challenge-actions__action-validate__loader-bar')).to.not.exist;
    });

    it('should be replaced by a loader during treatment', async function() {
      // given
      this.set('isValidateButtonEnabled', false);
      this.set('isSkipButtonEnabled', true);
      this.set('validateActionStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @validateAnswer={{this.validateActionStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(find(VALIDATE_BUTTON)).to.not.exist;
      expect(find('.challenge-actions__action-validate__loader-bar')).to.exist;
    });

    it('should be enabled again when the treatment failed', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', true);
      this.set('validateAnswerStub', () => RSVP.reject('Some error').catch(() => null));
      this.set('skipChallengeStub', () => {});

      await render(hbs`<ChallengeActions
                          @validateAnswer={{this.validateActionStub}}
                          @skipChallenge={{this.skipChallengeStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // when
      await click(VALIDATE_BUTTON);

      // then
      expect(find(VALIDATE_BUTTON)).to.exist;
      expect(find('.challenge-actions__action-skip__loader-bar')).to.not.exist;
    });
  });

  describe('Skip button', function() {

    it('should be displayed and enabled by default', async function() {
      // given
      this.set('isSkipButtonEnabled', true);
      this.set('skipChallengeStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @skipChallenge={{this.skipChallengeStub}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(find(SKIP_BUTTON)).to.exist;
    });

    it('should be replaced by a loader during treatment', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', false);
      this.set('skipChallengeStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @skipChallenge={{this.skipChallengeStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(find(SKIP_BUTTON)).to.not.exist;
      expect(find('.challenge-actions__action-skip__loader-bar')).to.exist;
    });

  });

  describe('Challenge has timed out', function() {

    it('should only display "continue" button', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('hasChallengeTimedOut', true);
      this.set('isSkipButtonEnabled', true);
      this.set('validateActionStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @validateAnswer={{this.validateActionStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @hasChallengeTimedOut={{this.hasChallengeTimedOut}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(findAll('.challenge-actions__action').length).to.equal(1);
      expect(find('.challenge-actions__action-continue')).to.exist;
    });
  });

  describe('When the challenge is focused', function() {

    it('should display continue action when user has focused out', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('hasFocusedOut', true);
      this.set('isSkipButtonEnabled', true);
      this.set('validateActionStub', () => {});

      // when
      await render(hbs`<ChallengeActions
                          @validateAnswer={{this.validateActionStub}}
                          @isValidateButtonEnabled={{this.isValidateButtonEnabled}}
                          @hasFocusedOut={{this.hasFocusedOut}}
                          @isSkipButtonEnabled={{this.isSkipButtonEnabled}}/>`);

      // then
      expect(findAll('.challenge-actions__action').length).to.equal(2);
    });
  });
});
