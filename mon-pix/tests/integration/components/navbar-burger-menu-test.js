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
    expect(contains('Accueil')).to.exist;
    expect(contains('Compétences')).to.exist;
    expect(contains('Certification')).to.exist;
    expect(contains('Mes tutos')).to.exist;
    expect(contains('J\'ai un code')).to.exist;
  });

  it('should display the user menu with expected elements', async function() {
    // when
    await render(hbs`<NavbarBurgerMenu />`);

    // then
    expect(find('.navbar-burger-menu__user-info')).to.exist;

    expect(contains(this.intl.t('navigation.user.account'))).to.exist;
    expect(contains(this.intl.t('navigation.user.certifications'))).to.exist;
    expect(contains(this.intl.t('navigation.main.help'))).to.exist;
    expect(contains(this.intl.t('navigation.user.sign-out'))).to.exist;
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
