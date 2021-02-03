import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'mon-pix/config/environment';

describe('Integration | Component | navbar-burger-menu', function() {

  setupIntlRenderingTest();

  beforeEach(async function() {
    class currentUser extends Service { user = {
      email: 'bobby.carotte@example.net',
      fullName: 'Bobby Carotte',
    }}
    this.owner.register('service:currentUser', currentUser);

  });

  context('when dashboard feature toggle is disabled', async function() {
    beforeEach(async function() {
      ENV.APP.FT_DASHBOARD = false;
      await render(hbs`<NavbarBurgerMenu />`);
    });

    it('should display logged user details informations', function() {
      const MENU_ITEMS_COUNT = 4;

      // then
      expect(find('.navbar-burger-menu__user-info')).to.exist;

      expect(findAll('.navbar-burger-menu-user-info__item')).to.have.lengthOf(MENU_ITEMS_COUNT);
      expect(find('.navbar-burger-menu-user-info-item__name').textContent.trim()).to.equal('Bobby Carotte');
      expect(find('.navbar-burger-menu-user-info-item__email').textContent.trim()).to.equal('bobby.carotte@example.net');
      expect(findAll('.navbar-burger-menu-user-info__item')[1].textContent.trim()).to.equal('Mes certifications');
      expect(findAll('.navbar-burger-menu-user-info__item')[2].textContent.trim()).to.equal('Aide');
      expect(findAll('.navbar-burger-menu-user-info__item')[3].textContent.trim()).to.equal('Se déconnecter');
    });

    it('should display the navigation menu with expected elements outside of campaign results', function() {
      // then
      expect(find('.navbar-burger-menu__navigation')).to.exist;

      expect(findAll('.navbar-burger-menu-navigation__item')).to.have.lengthOf(4);
      expect(findAll('.navbar-burger-menu-navigation__item')[0].textContent.trim()).to.equal('Profil');
      expect(findAll('.navbar-burger-menu-navigation__item')[1].textContent.trim()).to.equal('Certification');
      expect(findAll('.navbar-burger-menu-navigation__item')[2].textContent.trim()).to.equal('Mes tutos');
      expect(findAll('.navbar-burger-menu-navigation__item')[3].textContent.trim()).to.equal('J\'ai un code');
    });
  });

  context('when dashboard feature toggle is enabled', function() {
    beforeEach(async function() {
      ENV.APP.FT_DASHBOARD = true;
      await render(hbs`<NavbarBurgerMenu />`);
    });

    afterEach(function() {
      ENV.APP.FT_DASHBOARD = false;
    });

    it('should display the navigation menu with expected elements outside of campaign results', function() {
      // then
      expect(find('.navbar-burger-menu__navigation')).to.exist;

      expect(findAll('.navbar-burger-menu-navigation__item')).to.have.lengthOf(5);
      expect(findAll('.navbar-burger-menu-navigation__item')[0].textContent.trim()).to.equal('Accueil');
      expect(findAll('.navbar-burger-menu-navigation__item')[1].textContent.trim()).to.equal('Compétences');
      expect(findAll('.navbar-burger-menu-navigation__item')[2].textContent.trim()).to.equal('Certification');
      expect(findAll('.navbar-burger-menu-navigation__item')[3].textContent.trim()).to.equal('Mes tutos');
      expect(findAll('.navbar-burger-menu-navigation__item')[4].textContent.trim()).to.equal('J\'ai un code');
    });
  });
});
