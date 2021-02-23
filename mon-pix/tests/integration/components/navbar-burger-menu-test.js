import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar-burger-menu', function() {

  setupIntlRenderingTest();

  beforeEach(async function() {
    class currentUser extends Service { user = {
      email: 'bobby.carotte@example.net',
      fullName: 'Bobby Carotte',
    }}
    this.owner.register('service:currentUser', currentUser);

  });

  it('should display the navigation menu with expected elements outside of campaign results', async function() {
    // when
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    expect(find('.navbar-burger-menu__navigation')).to.exist;

    expect(findAll('.navbar-burger-menu-navigation__item')).to.have.lengthOf(5);
    expect(findAll('.navbar-burger-menu-navigation__item')[0].textContent.trim()).to.equal('Accueil');
    expect(findAll('.navbar-burger-menu-navigation__item')[1].textContent.trim()).to.equal('Compétences');
    expect(findAll('.navbar-burger-menu-navigation__item')[2].textContent.trim()).to.equal('Certification');
    expect(findAll('.navbar-burger-menu-navigation__item')[3].textContent.trim()).to.equal('Mes tutos');
    expect(findAll('.navbar-burger-menu-navigation__item')[4].textContent.trim()).to.equal('J\'ai un code');
  });

  context('when user has participations', function() {
    beforeEach(async function() {
      class currentUser extends Service {
        user = {
          hasAssessmentParticipations: true,
        }
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    it('should display "My tests" link', async function() {
      // when
      await render(hbs`<NavbarBurgerMenu />`);

      // then
      expect(contains('Mes parcours')).to.exist;
    });
  });

  context('when user has no participations', function() {
    beforeEach(async function() {
      class currentUser extends Service {
        user = {
          hasAssessmentParticipations: false,
        }
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    it('should not display "My tests" link', async function() {
      // when
      await render(hbs`<NavbarBurgerMenu />`);

      // then
      expect(contains('Mes parcours')).to.not.exist;
    });
  });
});
