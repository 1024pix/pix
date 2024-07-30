import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module(
  'Integration | Component | complementary-certifications/common/link-to-current-target-profile',
  function (hooks) {
    setupRenderingTest(hooks);

    test("it should display the name and the link of the current complementary certification's target profile", async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentTargetProfile = store.createRecord('target-profile', {
        name: 'ALEX TARGET',
        id: 1,
      });
      this.set('currentTargetProfile', currentTargetProfile);

      // when
      const screen = await render(
        hbs`<ComplementaryCertifications::Common::LinkToCurrentTargetProfile @model={{this.currentTargetProfile}} />`,
      );

      // then
      assert.dom(screen.getByText('Profil cible actuel:')).exists();
      assert.dom(screen.getByRole('link', { name: 'ALEX TARGET' })).exists();
    });
  },
);
