import { visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';

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
});
