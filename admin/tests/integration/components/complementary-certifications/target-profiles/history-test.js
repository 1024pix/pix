import { render } from '@1024pix/ember-testing-library';
import dayjs from 'dayjs';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | complementary-certifications/target-profiles/history', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display history for complementary certification's target profiles", async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const complementaryCertification = store.createRecord('complementary-certification', {
      targetProfilesHistory: [
        { id: 1023, name: 'Target Cascade', attachedAt: dayjs('2023-10-10T10:50:00Z'), detachedAt: null },
        {
          id: 1025,
          name: 'Target Volcan',
          attachedAt: dayjs('2019-10-08T10:50:00Z'),
          detachedAt: dayjs('2020-10-08T10:50:00Z'),
        },
      ],
    });
    this.targetProfilesHistory = complementaryCertification.targetProfilesHistory;

    // when
    const screen = await render(
      hbs`<ComplementaryCertifications::TargetProfiles::History @targetProfilesHistory={{this.targetProfilesHistory}} />`,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Nom du profil cible' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de rattachement' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de détachement' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Target Cascade 10/10/2023 -' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Target Volcan 08/10/2019 08/10/2020' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Target Cascade' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Target Volcan' })).exists();
  });
});
