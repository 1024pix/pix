import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
import sinon from 'sinon';

module(
  'Integration | Component |  complementary-certifications/target-profiles/target-profile-selector',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it should display the search bar by default', async function (assert) {
      // when
      const screen = await renderScreen(hbs`<ComplementaryCertifications::TargetProfiles::TargetProfileSelector />`);

      // then
      assert.dom(await screen.getByRole('searchbox')).exists();
    });

    module('when user type in the search bar', function () {
      test('it should display the search results', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.query = sinon.stub().resolves([
          {
            id: 3,
            name: 'ALEX TARGET',
          },
        ]);
        const screen = await renderScreen(hbs`<ComplementaryCertifications::TargetProfiles::TargetProfileSelector />`);

        // when
        const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
        await fillIn(input, '3');

        // then
        assert.dom(await screen.findByRole('option', { name: '3 - ALEX TARGET' })).exists();
      });

      test('it should display the loader', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.query = sinon.stub().returns(new Promise(() => {}));
        const screen = await renderScreen(hbs`<ComplementaryCertifications::TargetProfiles::TargetProfileSelector />`);

        // when
        const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
        await fillIn(input, '3');

        // then
        assert.dom(await screen.findByRole('progressbar', { value: { text: 'Recherche en cours...' } })).exists();
      });

      test('it should still display the searchbar if the search fails', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        store.query = sinon.stub().rejects();
        this.set('noop', () => {});
        const screen = await renderScreen(hbs`<ComplementaryCertifications::TargetProfiles::TargetProfileSelector
          @onError={{this.noop}}
        />`);

        // when
        const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
        await fillIn(input, '3');

        // then
        assert.dom(await screen.findByRole('searchbox', { name: 'ID du profil cible' })).exists();
      });
    });

    module('when user selects a target profile in the search bar', function () {
      test('it should validate the selected target profile', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const attachableTargetProfile = store.createRecord('attachable-target-profile', {
          name: 'ALEX TARGET',
          id: 1,
        });
        store.query = sinon.stub().resolves([attachableTargetProfile]);
        this.set('noop', () => {});
        const screen = await renderScreen(hbs`<ComplementaryCertifications::TargetProfiles::TargetProfileSelector
          @onSelection={{this.noop}}
        />`);

        // when
        const input = screen.getByRole('searchbox', { name: 'ID du profil cible' });
        await fillIn(input, '1');
        const searchResult = await screen.findByRole('option', { name: '1 - ALEX TARGET' });
        await searchResult.click();

        // then
        assert.dom(await screen.findByRole('link', { name: 'ALEX TARGET' })).exists();
        assert.dom(await screen.findByRole('button', { name: 'Changer' })).exists();
      });
    });
  },
);
