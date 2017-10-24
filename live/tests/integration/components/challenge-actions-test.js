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
    expect(this.$()).to.have.length(1);
  });

  describe('Validate button (and placeholding loader)', function() {

    it('should be displayed and enable by default but not loader', function() {
      // when
      this.render(hbs`{{challenge-actions}}`);
      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(1);
      expect(this.$('.challenge-actions__loader-spinner')).to.have.lengthOf(0);
    });

    it('should be replaced by a (spinning) loader during treatment', function() {
      // given
      this.set('externalAction', function() {
        return new RSVP.Promise(() => {
        });
      });
      this.render(hbs`{{challenge-actions answerValidated=(action externalAction)}}`);

      // when
      this.$('.challenge-actions__action-validate').click();

      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(0);
      expect(this.$('.challenge-actions__loader-spinner')).to.have.lengthOf(1);
    });

    it('should be enable again when the treatment succeeded', function() {
      // given
      this.set('externalAction', function() {
        return RSVP.resolve();
      });
      this.render(hbs`{{challenge-actions answerValidated=(action externalAction)}}`);

      // when
      this.$('.challenge-actions__action-validate').click();

      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(1);
      expect(this.$('.challenge-actions__loader-spinner')).to.have.lengthOf(0);
    });

    it('should be enable again when the treatment failed', function() {
      // given
      this.set('externalAction', function() {
        return RSVP.reject('Some error');
      });
      this.render(hbs`{{challenge-actions answerValidated=(action externalAction)}}`);

      // when
      this.$('.challenge-actions__action-validate').click();

      // then
      expect(this.$(VALIDATE_BUTTON)).to.have.lengthOf(1);
      expect(this.$('.challenge-actions__loader-spinner')).to.have.lengthOf(0);
    });
  });

  describe('Skip button', function() {

    it('should be displayed and enable by default', function() {
      // when
      this.render(hbs`{{challenge-actions}}`);
      // then
      expect(this.$(SKIP_BUTTON)).to.have.lengthOf(1);
    });
  });
});
