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
    const user = { id: 5, firstName: 'shi', lastName: 'fu' };
    const certificationNumber = 'certification-number';

    beforeEach(function() {
      this.set('user', user);
      this.set('certificationNumber', certificationNumber);
    });

    it('should also render a certification banner', function() {
      // when
      this.render(hbs`{{certification-results-page user=user certificationNumber=certificationNumber}}`);

      // then
      expect(this.$('.certification-banner')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__user-fullname')).to.have.lengthOf(1);
      expect(this.$('.certification-banner__container .certification-banner__user-fullname').text().trim()).to.equal(`${user.firstName} ${user.lastName}`);
      expect(this.$('.certification-banner__container .certification-banner__certification-number').text().trim()).to.equal(`#${certificationNumber}`);
    });

    it('should not be able to click on validation button when the verification is unchecked ', function() {
      // when
      this.render(hbs`{{certification-results-page user=user certificationNumber=certificationNumber}}`);

      // then
      expect(this.$('.result-content__validation-button')).to.have.lengthOf(0);
      expect(this.$('.result-content__button-blocked')).to.have.lengthOf(1);
    });

    it('should be able to click on validation when we check to show the last message', function() {
      // when
      this.render(hbs`{{certification-results-page user=user certificationNumber=certificationNumber}}`);
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
      this.render(hbs`{{certification-results-page user=user certificationNumber=certificationNumber}}`);
      this.$('#validSupervisor').click();
      this.$('.result-content__validation-button').click();

      // then
      expect(this.$('.result-content__logout-button')).to.have.lengthOf(1);
      expect(this.$('.result-content__logout-button').text()).to.equal('Se déconnecter');
      expect(this.$('.result-content__logout-button').attr('href')).to.equal('logout');
    });

  });
});
