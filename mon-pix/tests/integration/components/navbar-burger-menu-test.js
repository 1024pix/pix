import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar-burger-menu', function() {

  setupRenderingTest();

  beforeEach(async function() {
    this.owner.register('service:currentUser', Service.extend({
      user: {
        email: 'bobby.carotte@example.net',
        fullName: 'Bobby Carotte',
      }
    }));

    await render(hbs`{{navbar-burger-menu}}`);
  });

  it('should display logged user details informations', function() {
    const MENU_ITEMS_COUNT = 4;

    // then
    expect(find('.navbar-burger-menu__user-info')).to.exist;

    expect(findAll('.navbar-burger-menu-user-info__item')).to.have.lengthOf(MENU_ITEMS_COUNT);
    expect(find('.navbar-burger-menu-user-info-item__name').textContent.trim()).to.equal('Bobby Carotte');
    expect(find('.navbar-burger-menu-user-info-item__email').textContent.trim()).to.equal('bobby.carotte@example.net');
    expect(findAll('.navbar-burger-menu-user-info__item')[1].textContent.trim()).to.equal('Mes tutos');
    expect(findAll('.navbar-burger-menu-user-info__item')[2].textContent.trim()).to.equal('Mes certifications');
    expect(findAll('.navbar-burger-menu-user-info__item')[3].textContent.trim()).to.equal('Se déconnecter');
  });

  it('should display the navigation menu with expected elements outside of campaign results', function() {
    // then
    expect(find('.navbar-burger-menu__navigation')).to.exist;

    expect(findAll('.navbar-burger-menu-navigation__item')).to.have.lengthOf(4);
    expect(findAll('.navbar-burger-menu-navigation__item')[0].textContent.trim()).to.equal('Profil');
    expect(findAll('.navbar-burger-menu-navigation__item')[1].textContent.trim()).to.equal('Certification');
    expect(findAll('.navbar-burger-menu-navigation__item')[2].textContent.trim()).to.equal('Aide');
  });
});
