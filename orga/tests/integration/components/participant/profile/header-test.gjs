import { render } from '@1024pix/ember-testing-library';
import Header from 'pix-orga/components/participant/profile/header';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Participant::Profile::Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {};
  });

  test('it displays user information', async function (assert) {
    const campaignProfile = {
      firstName: 'Godefroy',
      lastName: 'de Montmirail',
    };
    const campaign = {};

    const screen = await render(
      <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
    );

    assert.ok(screen.getByRole('heading', { level: 1, name: 'Godefroy de Montmirail' }));
  });

  test('it displays campaign participation creation date', async function (assert) {
    const campaignProfile = {
      createdAt: '2020-01-01',
    };
    const campaign = {};

    const screen = await render(
      <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
    );

    assert.strictEqual(screen.getByRole('term').textContent.trim(), t('pages.campaign-individual-results.start-date'));
    assert.strictEqual(screen.getByRole('definition').textContent.trim(), '1 janv. 2020');
  });

  module('is shared', function () {
    module('when participant has shared results', function () {
      test('it displays the sharing date', async function (assert) {
        const campaignProfile = {
          isShared: true,
          sharedAt: '2020-01-02',
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.strictEqual(
          screen.getAllByRole('term')[1].textContent.trim(),
          t('pages.campaign-individual-results.shared-date'),
        );
        assert.strictEqual(screen.getAllByRole('definition')[1].textContent.trim(), '2 janv. 2020');
      });
    });
    module('when participant has not shared results', function () {
      test('it does not displays the sharing date', async function (assert) {
        const campaignProfile = {
          isShared: false,
        };

        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText(t('pages.campaign-individual-results.shared-date')));
      });
    });
  });

  module('identifiant', function () {
    module('when the external id is present', function () {
      test('it displays the external id', async function (assert) {
        const campaignProfile = {
          externalId: 'i12345',
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.strictEqual(screen.getAllByRole('term')[0].textContent.trim(), '');
        assert.strictEqual(screen.getAllByRole('definition')[0].textContent.trim(), 'i12345');
      });
    });
    module('when the external id is not present', function () {
      test('it does not display the external id', async function (assert) {
        const campaignProfile = {
          externalId: null,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        // la balise <dt/> liée à l'identifiant est vide, on vérifie donc qu'elle n'est pas présente
        assert.notEqual(screen.getAllByRole('term')[0].textContent.trim(), '');
        assert.notEqual(screen.getAllByRole('definition')[0].textContent.trim(), campaignProfile.externalId);
      });
    });
  });

  module('certification info', function () {
    module('when the  profile is shared', function () {
      test('it displays the pix score', async function (assert) {
        const campaignProfile = {
          pixScore: '124',
          createdAt: '01-01-1990',
          isShared: true,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.getByText('124'));
      });

      test('it displays the total number of competence', async function (assert) {
        const campaignProfile = {
          competencesCount: 12,
          createdAt: '01-01-1990',
          isShared: true,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.getByText('/ 12'));
      });

      test('it displays the total number of certifiable competence', async function (assert) {
        const campaignProfile = {
          certifiableCompetencesCount: 2,
          createdAt: '01-01-1990',
          isShared: true,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.getByText('2'));
      });

      module('certifiable badge', function () {
        module('when the profile is certifiable', function () {
          test('it displays certifiable', async function (assert) {
            const campaignProfile = {
              isCertifiable: true,
              isShared: true,
            };
            const campaign = {};

            const screen = await render(
              <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
            );

            assert.ok(screen.getByText(t('pages.profiles-individual-results.certifiable')));
          });
        });

        module('when the profile is not certifiable', function () {
          test('it does not display certifiable', async function (assert) {
            const campaignProfile = {
              isCertifiable: false,
              isShared: true,
            };
            const campaign = {};

            const screen = await render(
              <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
            );

            assert.notOk(screen.queryByText(t('pages.profiles-individual-results.certifiable')));
          });
        });
      });
    });

    module('when the  profile is not shared', function () {
      test('it does not display the pix score', async function (assert) {
        const campaignProfile = {
          isShared: false,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText('PIX'));
      });

      test('it does not display the total number of competence', async function (assert) {
        const campaignProfile = {
          competencesCount: 32,
          createdAt: '01-01-1990',
          isShared: false,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText('32'));
        assert.notOk(screen.queryByText(t('pages.profiles-individual-results.competences-certifiables')));
      });

      test('it does not display the total number of certifiable competence', async function (assert) {
        const campaignProfile = {
          certifiableCompetencesCount: 33,
          createdAt: '01-01-1990',
          isShared: false,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText('33'));
      });

      test('it does not display certifiable badge', async function (assert) {
        const campaignProfile = {
          isCertifiable: true,
          isShared: false,
        };
        const campaign = {};

        const screen = await render(
          <template><Header @campaignProfile={{campaignProfile}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText(t('pages.profiles-individual-results.certifiable')));
      });
    });
  });
});
