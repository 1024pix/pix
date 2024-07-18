import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certifications/attach-badges/badges', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when data are loading', function () {
    test('it should display the loader', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      store.queryRecord = sinon.stub().returns(new Promise(() => {}));
      const attachableTargetProfile = store.createRecord('attachable-target-profile', {
        name: 'ALEX TARGET',
        id: 1,
      });
      this.set('attachableTargetProfile', attachableTargetProfile);
      this.set('noop', () => {});

      // when
      const screen = await renderScreen(hbs`<ComplementaryCertifications::AttachBadges::Badges
          @targetProfile={{this.attachableTargetProfile}}
          @onError={{this.noop}}
        />`);

      // then
      assert.dom(screen.getByRole('progressbar', { name: 'chargement' })).exists();
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('when data are loaded', function () {
    module('when there are no badges', function () {
      test('it should display an error message when there are no badges provided', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.queryRecord = sinon.stub().resolves({
          hasMany: sinon.stub().returns({
            value: sinon.stub().returns([]),
          }),
        });

        const attachableTargetProfile = store.createRecord('attachable-target-profile', {
          name: 'ALEX TARGET',
          id: 1,
        });
        this.set('attachableTargetProfile', attachableTargetProfile);
        this.set('noop', () => {});

        // when
        const screen = await renderScreen(hbs`<ComplementaryCertifications::AttachBadges::Badges
            @targetProfile={{this.attachableTargetProfile}}
            @onError={{this.noop}}
          />`);

        // then
        assert
          .dom(
            screen.getByRole('alert', {
              value:
                'Seul un profil cible comportant au moins un résultat thématique certifiant peut être rattaché à une certification complémentaire. Le profil cible que vous avez sélectionné ne comporte pas de résultat thématique certifiant. Veuillez le modifier puis rafraîchir cette page ou bien sélectionner un autre profil cible.',
            }),
          )
          .exists();
      });
    });

    module('when there are badges', function () {
      test('it should display target profile badges', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.queryRecord = sinon.stub().resolves({
          hasMany: sinon.stub().returns({
            value: sinon.stub().returns([
              {
                id: 1000,
                title: 'canards',
                isCertifiable: true,
              },
            ]),
          }),
        });
        const attachableTargetProfile = store.createRecord('attachable-target-profile', {
          name: 'ALEX TARGET',
          id: 1,
        });
        this.set('attachableTargetProfile', attachableTargetProfile);
        this.set('noop', () => {});

        // when
        const screen = await renderScreen(hbs`<ComplementaryCertifications::AttachBadges::Badges
            @targetProfile={{this.attachableTargetProfile}}
            @onError={{this.noop}}
          />`);

        // then
        assert.dom(await screen.queryByRole('alert')).doesNotExist();
        assert.dom(screen.getByRole('row', { name: 'Résultat thématique 1000 canards' })).exists();
      });
    });
  });
});
