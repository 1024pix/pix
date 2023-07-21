import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::Information', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display information on the current complementary certification's target profile", async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.complementaryCertification = store.createRecord('complementary-certification', {
      label: 'MARIANNE CERTIF',
      currentTargetProfile: { name: 'ALEX TARGET', id: 3 },
    });

    // when
    const screen = await render(
      hbs`<ComplementaryCertifications::TargetProfiles::Information @complementaryCertification={{this.complementaryCertification}} />`,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Certification complémentaire' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Rattacher un nouveau profil cible' })).exists();
    assert.dom(screen.getByRole('link', { name: 'ALEX TARGET' })).exists();
    assert.dom(screen.getByText('MARIANNE CERTIF')).exists();
  });
});
