import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { computed } from '@ember/object';
import LinkComponent from '@ember/routing/link-component';
import Service from '@ember/service';

describe('Integration | Component | navbar mobile menu', function() {
  setupComponentTest('navbar-mobile-menu', {
    integration: true
  });

  it('should be rendered', function() {
    // when
    this.render(hbs`{{navbar-mobile-menu}}`);

    // then
    expect(this.$()).to.have.length(1);
  });

  context('when close button is clicked', function() {

    it('should close the side-menu', function() {
      // given
      this.render(hbs`{{navbar-mobile-menu}}`);

      // when
      this.$('.burger-close-button').click();

      // then
      expect(this.$('.side-menu').attr('style').indexOf('box-shadow: none')).to.be.at.least(0);
    });
  });

  context('when any menu item is clicked', function() {

    beforeEach(function() {
      LinkComponent.reopen({
        href: computed.alias('qualifiedRouteName')
      });
      this.register('service:-routing', Service.extend({
        hasRoute() {
          return '/compte';
        },
        transitionTo: function() {
          return true;
        }
      }));
      this.inject.service('-routing', { as: '-routing' });
    });

    it('should close the side-menu', function() {
      // given
      const menu = [{ name: 'Projet', link: 'project', class: '', permanent: true },
        { name: 'Compétences', link: 'competences', class: '', permanent: true }];
      this.set('menu', menu);

      this.render(hbs`{{navbar-mobile-menu menu=menu}}`);

      // when
      this.$('.navbar-header-links__item').eq(1).click();

      // then
      expect(this.$('.side-menu').attr('style').indexOf('box-shadow: none')).to.be.at.least(0);
    });
  });
});
