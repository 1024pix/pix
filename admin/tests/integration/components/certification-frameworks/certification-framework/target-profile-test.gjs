import { render } from '@1024pix/ember-testing-library';
import TargetProfile from 'pix-admin/components/certification-frameworks/certification-framework/target-profile';
import { module, test } from 'qunit';

import setupIntlRenderingTest, { t } from '../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | complementary-certifications/certification-framework/target-profile',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    module('Double certification', function () {
      test('it should display target profile information, badge list and history', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };
        const complementaryCertification = store.createRecord('complementary-certification', {
          id: '10',
          key: 'CLEA',
          label: 'CléA Numérique',
          hasComplementaryReferential: false,
          targetProfilesHistory: [
            {
              detachedAt: null,
              name: 'ALEX TARGET',
              id: '3',
              badges: [
                {
                  id: '1023',
                  label: 'Badge Cascade',
                  level: 3,
                  imageUrl: 'http://localhost:4202/logo-placeholder.png',
                },
                { id: '1025', label: 'Badge Volcan', level: 1, imageUrl: 'http://localhost:4202/logo-placeholder.png' },
              ],
            },
          ],
        });

        // when
        const screen = await render(
          <template><TargetProfile @complementaryCertification={{complementaryCertification}} /></template>,
        );

        // then
        assert.dom(screen.getByText('Rattacher un nouveau profil cible')).exists();
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('components.certification-frameworks.target-profiles.badges-list.title'),
            }),
          )
          .exists();
        assert.dom(screen.getByText('Badge Cascade')).exists();
        assert.dom(screen.getByText('Badge Volcan')).exists();

        assert
          .dom(
            screen.getByRole('button', {
              name: t('components.certification-frameworks.target-profiles.history-list.title'),
            }),
          )
          .exists();
      });
    });

    module('Complementary V2', function () {
      test('it should only display target profile history', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };
        const complementaryCertification = store.createRecord('complementary-certification', {
          id: '10',
          key: 'DROIT',
          label: 'Pix+Droit',
          hasComplementaryReferential: true,
          targetProfilesHistory: [
            {
              detachedAt: null,
              name: 'ALEX TARGET',
              id: '3',
              badges: [
                {
                  id: '1023',
                  label: 'Badge Cascade',
                  level: 3,
                  imageUrl: 'http://localhost:4202/logo-placeholder.png',
                },
                { id: '1025', label: 'Badge Volcan', level: 1, imageUrl: 'http://localhost:4202/logo-placeholder.png' },
              ],
            },
          ],
        });

        // when
        const screen = await render(
          <template><TargetProfile @complementaryCertification={{complementaryCertification}} /></template>,
        );

        // then
        assert.dom(screen.queryByText('Rattacher un nouveau profil cible')).doesNotExist();
        assert
          .dom(
            screen.queryByRole('heading', {
              name: t('components.certification-frameworks.target-profiles.badges-list.title'),
            }),
          )
          .doesNotExist();
        assert.dom(screen.queryByText('Badge Cascade')).doesNotExist();
        assert.dom(screen.queryByText('Badge Volcan')).doesNotExist();

        assert
          .dom(screen.getByText(t('components.certification-frameworks.target-profiles.history-list.title')))
          .exists();
      });
    });
  },
);
