import RSVP from 'rsvp';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

const VALIDATE_BUTTON = '.challenge-actions__action-validate';
const SKIP_BUTTON = '.challenge-actions__action-skip';

describe('Integration | Component | challenge actions', function() {

  setupComponentTest('challenge-actions', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{challenge-actions}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

  describe('Validate button (and placeholding loader)', function() {

    it('should be displayed and enabled by default but not loader', function() {
      // when
      this.set('isValidateButtonEnabled', true);
      this.set('externalAction', () => {});
      this.render(hbs`{{challenge-actions validateAnswer=(action externalAction) isValidateButtonEnabled=isValidateButtonEnabled}}`);
      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(1);
      expect(this.$('.challenge-actions__action-validate__loader-bar')).to.have.lengthOf(0);
    });

    it('should be replaced by a loader during treatment', function() {
      // given
      this.set('externalAction', () => {});
      this.render(hbs`{{challenge-actions validateAnswer=(action externalAction)}}`);

      // when
      this.$(VALIDATE_BUTTON).click();

      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(0);
      expect(this.$('.challenge-actions__action-validate__loader-bar')).to.have.lengthOf(1);
    });

    it('should be enabled again when the treatment failed', function() {
      // given
      this.set('isValidateButtonEnabled', true);
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => RSVP.reject('Some error').catch(() => null));
      this.set('externalAction2', () => {});
      this.render(hbs`{{challenge-actions validateAnswer=(action externalAction) skipChallenge=(action externalAction2) isValidateButtonEnabled=isValidateButtonEnabled isSkipButtonEnabled=isSkipButtonEnabled}}`);

      // when
      this.$(VALIDATE_BUTTON).click();
      
      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(1);
      expect(this.$('.challenge-actions__action-skip__loader-bar')).to.have.lengthOf(0);
    });
  });

  describe('Skip button', function() {

    it('should be displayed and enabled by default', function() {
      // when
      this.set('isSkipButtonEnabled', true);
      this.set('externalAction', () => {});
      this.render(hbs`{{challenge-actions skipChallenge=(action externalAction) isSkipButtonEnabled=isSkipButtonEnabled}}`);
      // then
      expect(this.$(SKIP_BUTTON)).to.have.lengthOf(1);
    });

    it('should be replaced by a loader during treatment', function() {
      // given
      this.set('externalAction', () => {});
      this.render(hbs`{{challenge-actions skipChallenge=(action externalAction)}}`);

      // when
      this.$(SKIP_BUTTON).click();

      // then
      expect(this.$(SKIP_BUTTON)).to.have.lengthOf(0);
      expect(this.$('.challenge-actions__action-skip__loader-bar')).to.have.lengthOf(1);
    });

  });
});
