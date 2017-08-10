import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | share profile', function() {
  setupComponentTest('share-profile', {
    integration: true
  });

  describe('when the organization is found', function() {

    it('should render a wrapper', function() {
      // given
      const organization = Ember.Object.create({ name: 'Université de la côte d\'Opale' });
      this.set('organization', organization);
      this.set('isShowingModal', true);

      // when
      this.render(hbs`{{share-profile isShowingModal=true organization=organization}}`);

      // then
      expect(Ember.$.find('.share-profile__modal-organization-name')[0].innerText)
        .to.equal('Université de la côte d\'Opale');
    });

    /*it('should render a wrapper', function() {
      // when
      this.render(hbs`{{profile-panel}}`);

      // then
      const WRAPPER_CLASS = '.profile-panel';
      expect(this.$(WRAPPER_CLASS)).to.have.length(1);
    });

    it('should render a profile header', function() {
      // when
      this.render(hbs`{{profile-panel}}`);

      // Then
      const HEADER_CLASS = '.profile-panel__header';
      const HEADER_TITLE = '.profile-header__title';
      expect(this.$(HEADER_CLASS)).to.have.length(1);
      expect(this.$(HEADER_TITLE).text().trim()).to.be.equal('Votre profil');
    });

    it('should render a competence profile block', function() {
      // when
      this.render(hbs`{{profile-panel}}`);

      // Then
      const COMPETENCY_BLOCK = '.profile-panel__competence-areas';
      expect(this.$(COMPETENCY_BLOCK)).to.have.length(1);
    });

    describe('behavior according to totalPixScore value', function() {
      it('should display two dashes instead of zero in total pix score, when user has’nt yet assessed on placement test', function() {
        // given
        const totalPixScore = '';

        this.set('totalPixScore', totalPixScore);
        // when
        this.render(hbs`{{profile-panel totalPixScore=totalPixScore}}`);

        // then
        expect(this.$('.profile-header__score-pastille-wrapper')).to.have.length(1);
      });
    });*/
  });
});
