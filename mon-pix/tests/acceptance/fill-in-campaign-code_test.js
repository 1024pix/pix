import { click, fillIn, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';
import { waitForDialog } from '../helpers/wait-for';

describe('Acceptance | Fill in campaign code page', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
  });

  describe('When connected', function () {
    it('should disconnect when cliking on the link', async function () {
      // given
      await authenticateByEmail(user);
      await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.warning-message-logout'));

      // then
      expect(contains(user.firstName)).to.be.null;
      expect(contains(this.intl.t('navigation.not-logged.sign-in')));
    });
  });

  describe('Explanation link', function () {
    it('should redirect on the right support page', async function () {
      // given
      await authenticateByEmail(user);
      await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.explanation-message'));

      // then
      expect(
        find(
          '[href="https://support.pix.org/fr/support/solutions/articles/15000029147-qu-est-ce-qu-un-code-parcours-et-comment-l-utiliser-"]'
        )
      ).to.exist;
      expect(find('[target="_blank"]')).to.exist;
    });
  });

  describe('when user is not connected to his Mediacentre', function () {
    context('and starts a campaign with GAR as identity provider', function () {
      it('should not redirect the user and display a modal', async function () {
        // given
        const campaign = server.create('campaign', {
          identityProvider: 'GAR',
          targetProfileName: 'My Profile',
          organizationName: 'AWS',
        });

        // when
        const screen = await visit(`/campagnes`);
        await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.description')), campaign.code);
        await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

        // then
        expect(currentURL()).to.equal('/campagnes');
        expect(
          screen.getByText(this.intl.t('pages.fill-in-campaign-code.mediacentre-start-campaign-modal.title'))
        ).to.exist;
      });

      context('and wants to continue', function () {
        it('should be redirected to the campaign entry page', async function () {
          // given
          const campaign = server.create('campaign', {
            identityProvider: 'GAR',
            targetProfileName: 'My Profile',
            organizationName: 'AWS',
          });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.description')), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
          await waitForDialog();
          await click(screen.getByRole('link', { name: 'Continuer' }));

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });
      });

      context('and wants to connect to his Mediacentre', function () {
        it('should stay on the same page after closing the modal', async function () {
          // given
          const campaign = server.create('campaign', {
            identityProvider: 'GAR',
            targetProfileName: 'My Profile',
            organizationName: 'AWS',
          });

          // when
          const screen = await visit(`/campagnes`);
          await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.description')), campaign.code);
          await click(screen.getByRole('button', { name: 'Accéder au parcours' }));
          await waitForDialog();
          await click(screen.getByRole('button', { name: 'Quitter' }));

          // then
          expect(currentURL()).to.equal('/campagnes');
        });
      });
    });

    context('and starts a campaign without GAR as identity provider', function () {
      it('should redirect the user to the campaign entry page', async function () {
        // given
        const campaign = server.create('campaign');

        // when
        const screen = await visit(`/campagnes`);
        await fillIn(screen.getByLabelText(this.intl.t('pages.fill-in-campaign-code.description')), campaign.code);
        await click(screen.getByRole('button', { name: 'Accéder au parcours' }));

        // then
        expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
      });
    });
  });
});
