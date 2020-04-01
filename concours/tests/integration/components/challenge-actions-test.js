import RSVP from 'rsvp';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const VALIDATE_BUTTON = '.challenge-actions__action-validate';
const SKIP_BUTTON = '.challenge-actions__action-skip';

describe('Integration | Component | challenge actions', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{challenge-actions}}`);
    expect(find('.challenge-actions__action')).to.exist;
  });

  describe('Validate button (and placeholding loader)', function() {

    it('should be displayed and enabled by default but not loader', async function() {
      // when
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => {});
      await render(hbs`{{challenge-actions validateAnswer=(action externalAction) isValidateButtonEnabled=isValidateButtonEnabled isSkipButtonEnabled=isSkipButtonEnabled}}`);

      // then
      expect(find(VALIDATE_BUTTON)).to.exist;
      expect(find('.challenge-actions__action-validate__loader-bar')).to.not.exist;
    });

    it('should be replaced by a loader during treatment', async function() {
      // given
      this.set('isValidateButtonEnabled', false);
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => {});
      await render(hbs`{{challenge-actions validateAnswer=(action externalAction) isValidateButtonEnabled=isValidateButtonEnabled isSkipButtonEnabled=isSkipButtonEnabled}}`);

      // then
      expect(find(VALIDATE_BUTTON)).to.not.exist;
      expect(find('.challenge-actions__action-validate__loader-bar')).to.exist;
    });

    it('should be enabled again when the treatment failed', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => RSVP.reject('Some error').catch(() => null));
      this.set('externalAction2', () => {});
      await render(hbs`{{challenge-actions validateAnswer=(action externalAction) skipChallenge=(action externalAction2) isValidateButtonEnabled=isValidateButtonEnabled isSkipButtonEnabled=isSkipButtonEnabled}}`);

      // when
      await click(VALIDATE_BUTTON);

      // then
      expect(find(VALIDATE_BUTTON)).to.exist;
      expect(find('.challenge-actions__action-skip__loader-bar')).to.not.exist;
    });
  });

  describe('Skip button', function() {

    it('should be displayed and enabled by default', async function() {
      // when
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => {});
      await render(hbs`{{challenge-actions skipChallenge=(action externalAction) isSkipButtonEnabled=isSkipButtonEnabled}}`);
      // then
      expect(find(SKIP_BUTTON)).to.exist;
    });

    it('should be replaced by a loader during treatment', async function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', false);
      this.set('externalAction', () => {});
      await render(hbs`{{challenge-actions skipChallenge=(action externalAction)}} isValidateButtonEnabled=isValidateButtonEnabled isSkipButtonEnabled=isSkipButtonEnabled`);

      // then
      expect(find(SKIP_BUTTON)).to.not.exist;
      expect(find('.challenge-actions__action-skip__loader-bar')).to.exist;
    });

  });
});
