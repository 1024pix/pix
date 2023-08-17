import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | users | user-profile', function (hooks) {
  setupRenderingTest(hooks);

  test('should display user’s profile', async function (assert) {
    // given
    this.set('profile', {
      pixScore: 1024,
      scorecards: [
        { name: 'Ma superbe compétence', earnedPix: 16, level: 1 },
        { name: 'Ma botte secrète', earnedPix: 48, level: 7 },
      ],
    });

    //  when
    const component = await render(hbs`<Users::UserProfile @profile={{this.profile}} />`);

    // then
    assert.dom(component.getByText(this.profile.pixScore)).exists();
    assert.dom(component.getByText(this.profile.scorecards[0].name)).exists();
    assert.dom(component.getByText(this.profile.scorecards[0].earnedPix)).exists();
    assert.dom(component.getByText(this.profile.scorecards[0].level)).exists();
    assert.dom(component.getByText(this.profile.scorecards[1].name)).exists();
    assert.dom(component.getByText(this.profile.scorecards[1].earnedPix)).exists();
    assert.dom(component.getByText(this.profile.scorecards[1].level)).exists();
  });

  module('when user profile is empty', function () {
    test('should display the empty message', async function (assert) {
      // given
      this.set('profile', {
        pixScore: 0,
      });

      //  when
      const component = await render(hbs`<Users::UserProfile @profile={{this.profile}} />`);

      // then
      assert.dom(component.getByText('Aucun résultat')).exists();
    });
  });
});
