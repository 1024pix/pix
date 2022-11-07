import Service from '@ember/service';
import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar-burger-menu', function () {
  setupIntlRenderingTest();

  beforeEach(async function () {
    class currentUser extends Service {
      user = {
        fullName: 'Bobby Carotte',
      };
    }
    this.owner.register('service:currentUser', currentUser);
  });

  it("should display the user's fullname", async function () {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

    // then
    expect(screen.getByRole('heading', { name: 'Bobby Carotte' })).to.exist;
  });

  it('should display the navigation menu with "Home", "Skills", "Certification", "My tutorials" and "I have a code" links', async function () {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}}/>`);

    // then
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.code') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.dashboard') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.skills') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.start-certification') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.tutorials') })).to.exist;
  });

  it('should display the user menu with "My account", "My certifications", "Help", "Log-out" links', async function () {
    // when
    const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}}/>`);

    // then
    expect(screen.getByRole('link', { name: this.intl.t('navigation.user.account') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.user.certifications') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.main.help') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.user.sign-out') })).to.exist;
  });

  context('when user has participations', function () {
    beforeEach(async function () {
      class currentUser extends Service {
        user = {
          fullName: 'Bobby Carotte',
          hasAssessmentParticipations: true,
        };
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    it('should display "My tests" link', async function () {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}}/>`);

      // then
      expect(screen.getByRole('link', { name: this.intl.t('navigation.user.tests') })).to.exist;
    });
  });

  context('when user has no participations', function () {
    beforeEach(async function () {
      class currentUser extends Service {
        user = {
          hasAssessmentParticipations: false,
        };
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    it('should not display "My tests" link', async function () {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

      // then
      expect(screen.queryByRole('link', { name: this.intl.t('navigation.user.tests') })).to.not.exist;
    });
  });
  context('when user has recommended trainings', function () {
    beforeEach(async function () {
      class currentUser extends Service {
        user = {
          hasRecommendedTrainings: true,
        };
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);
    });

    it('should not display "My trainings" link', async function () {
      // when
      const screen = await render(hbs`<NavbarBurgerMenu @showSidebar={{true}} />`);

      // then
      expect(screen.queryByRole('link', { name: this.intl.t('navigation.user.trainings') })).to.not.exist;
    });
  });
});
