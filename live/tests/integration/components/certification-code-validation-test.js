import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | certification-code-validation', function() {

  setupComponentTest('certification-code-validation', {
    integration: true
  });

  describe('Error management', () => {

    it('should not display an error message by default', function() {
      // when
      this.render(hbs`{{certification-code-validation}}`);

      // then
      expect(this.$('.certification-course-page__errors')).to.have.length(0);
    });

    it('should display an error message when it exists', function() {
      // given
      this.set('_errorMessage', 'Un lapin ne peut pas s’enamourer d’une belette :(');

      // when
      this.render(hbs`{{certification-code-validation _errorMessage=_errorMessage}}`);

      // then
      expect(this.$('.certification-course-page__errors')).to.have.length(1);
    });
  });

  describe('Loading management', () => {

    it('should not display any loading spinner by default', function() {
      // when
      this.render(hbs`{{certification-code-validation}}`);

      // then
      expect(this.$('.certification-course-page__field-button__loader-bar')).to.have.length(0);
      expect(this.$('.certification-course-page__submit_button')).to.have.length(1);
    });

    it('should display a loading spinner when loading certification', function() {
      // given
      this.set('_loadingCertification', true);

      // when
      this.render(hbs`{{certification-code-validation _loadingCertification=_loadingCertification}}`);

      // then
      expect(this.$('.certification-course-page__field-button__loader-bar')).to.have.length(1);
      expect(this.$('.certification-course-page__submit_button')).to.have.length(0);
    });
  });

});
