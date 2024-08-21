import { render as renderScreen } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import SelectedTargetProfile from 'pix-admin/components/complementary-certifications/attach-badges/target-profile-selector/selected-target-profile';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | selected-target-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a link to the provided target profile', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const attachableTargetProfile = store.createRecord('attachable-target-profile', {
      name: 'ALEX TARGET',
      id: 1,
    });

    // when
    const screen = await renderScreen(
      <template><SelectedTargetProfile @attachableTargetProfile={{attachableTargetProfile}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('link', { name: 'ALEX TARGET' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Changer' })).exists();
  });

  module('when change button is clicked', function () {
    test("it should call onReset arg's method", async function (assert) {
      // given
      const onResetStub = sinon.stub();
      const screen = await renderScreen(<template><SelectedTargetProfile @onChange={{onResetStub}} /></template>);

      // when
      const button = screen.getByRole('button', { name: 'Changer' });
      await button.click();

      // then
      sinon.assert.calledOnce(onResetStub);
      assert.ok(true);
    });
  });
});
