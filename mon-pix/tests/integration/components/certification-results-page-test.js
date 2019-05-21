import { alias } from '@ember/object/computed';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import LinkComponent from '@ember/routing/link-component';

describe('Integration | Component | certification results template', function() {
  setupComponentTest('certification-results-page', {
    integration: true
  });

  context('When component is rendered', function() {
    const certificationNumber = 'certification-number';

    beforeEach(function() {
      this.set('certificationNumber', certificationNumber);
    });

    it('should not be able to click on validation button when the verification is unchecked ', function() {
      // when
      this.render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);

      // then
      expect(this.$('.result-content__validation-button')).to.have.lengthOf(0);
      expect(this.$('.result-content__button-blocked')).to.have.lengthOf(1);
    });

    it('should be able to click on validation when we check to show the last message', function() {
      // when
      this.render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);
      this.$('#validSupervisor').click();
      this.$('.result-content__validation-button').click();

      // then
      expect(this.$('.result-content__panel-description').text()).to.contains('Vos résultats seront prochainement disponibles depuis votre compte.');
    });

    it('should have a button to logout at the end of certification', function() {
      // given
      LinkComponent.reopen({
        href: alias('qualifiedRouteName')
      });

      // when
      this.render(hbs`{{certification-results-page certificationNumber=certificationNumber}}`);
      this.$('#validSupervisor').click();
      this.$('.result-content__validation-button').click();

      // then
      expect(this.$('.result-content__logout-button')).to.have.lengthOf(1);
      expect(this.$('.result-content__logout-button').text()).to.equal('Se déconnecter');
      expect(this.$('.result-content__logout-button').attr('href')).to.equal('logout');
    });

  });
});
