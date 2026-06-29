import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import Information from 'pix-admin/components/certification-frameworks/certification-framework/target-profile/information';
import { module, test } from 'qunit';

module(
  'Integration | Component | complementary-certifications/certification-framework/target-profile/information',
  function (hooks) {
    setupRenderingTest(hooks);

    test("it should display information on the current complementary certification's target profile", async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentUser = this.owner.lookup('service:currentUser');
      currentUser.adminMember = { isSuperAdmin: true };
      const complementaryCertification = store.createRecord('complementary-certification', {
        label: 'Pix+ Droit',
        targetProfilesHistory: [{ name: 'ALEX TARGET', id: '3' }],
      });
      const currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

      // when
      const screen = await render(
        <template>
          <Information
            @complementaryCertification={{complementaryCertification}}
            @currentTargetProfile={{currentTargetProfile}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('link', { name: 'ALEX TARGET' })).exists();
    });

    module('when admin member has role "CERTIF", "METIER" and "SUPPORT"', function () {
      test('it should not display the button to attach new target profile', async function (assert) {
        // given
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: false };
        const store = this.owner.lookup('service:store');
        const complementaryCertification = store.createRecord('complementary-certification', {
          label: 'MARIANNE CERTIF',
          targetProfilesHistory: [{ name: 'ALEX TARGET', id: '3' }],
        });
        const currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

        // when
        const screen = await render(
          <template>
            <Information
              @complementaryCertification={{complementaryCertification}}
              @currentTargetProfile={{currentTargetProfile}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText('Rattacher un nouveau profil cible')).doesNotExist();
      });
    });

    module('when admin member has role "SUPER ADMIN"', function () {
      test('it should display the button to attach new target profile', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentUser = this.owner.lookup('service:currentUser');
        currentUser.adminMember = { isSuperAdmin: true };
        const complementaryCertification = store.createRecord('complementary-certification', {
          label: 'MARIANNE CERTIF',
          targetProfilesHistory: [{ name: 'ALEX TARGET', id: '3' }],
        });
        const currentTargetProfile = complementaryCertification.currentTargetProfiles[0];

        // when
        const screen = await render(
          <template>
            <Information
              @complementaryCertification={{complementaryCertification}}
              @currentTargetProfile={{currentTargetProfile}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Rattacher un nouveau profil cible')).exists();
      });
    });
  },
);
