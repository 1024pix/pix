import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | certification-code-validation', function() {

  setupRenderingTest();

  describe('Error management', () => {

    it('should not display an error message by default', async function() {
      // when
      await render(hbs`{{certification-code-validation}}`);

      // then
      expect(find('.certification-course-page__errors')).to.not.exist;
    });

    it('should display an error message when it exists', async function() {
      // given
      this.set('_errorMessage', 'Un lapin ne peut pas s’enamourer d’une belette :(');

      // when
      await render(hbs`{{certification-code-validation _errorMessage=_errorMessage}}`);

      // then
      expect(find('.certification-course-page__errors')).to.exist;
    });
  });

  describe('Loading management', () => {

    it('should not display any loading spinner by default', async function() {
      // when
      await render(hbs`{{certification-code-validation}}`);

      // then
      expect(find('.certification-course-page__submit_button .loader-in-button')).to.not.exist;
    });

    it('should display a loading spinner when loading certification', async function() {
      // given
      this.set('_loadingCertification', true);

      // when
      await render(hbs`{{certification-code-validation _loadingCertification=_loadingCertification}}`);

      // then
      expect(find('.certification-course-page__submit_button .loader-in-button')).to.exist;
    });
  });

});
