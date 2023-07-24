import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import dayjs from 'dayjs';

module('Integration | Component | ComplementaryCertifications::TargetProfiles::Log', function (hooks) {
  setupRenderingTest(hooks);

  test("it should display logs for complementary certification's target profiles", async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const complementaryCertification = store.createRecord('complementary-certification', {
      targetProfilesLog: [
        { id: 1023, name: 'Target Cascade', attachedAt: dayjs('2023-10-10T10:50:00Z') },
        { id: 1025, name: 'Target Volcan', attachedAt: dayjs('2019-10-08T10:50:00Z') },
      ],
    });
    this.targetProfilesLog = complementaryCertification.targetProfilesLog;

    // when
    const screen = await render(
      hbs`<ComplementaryCertifications::TargetProfiles::Log @targetProfilesLog={{this.targetProfilesLog}} />`,
    );

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Nom du profil cible' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de rattachement' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Date de détachement' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Target Cascade 10/10/2023 TODO' })).exists();
    assert.dom(screen.getByRole('row', { name: 'Target Volcan 08/10/2019 TODO' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Target Cascade' })).exists();
    assert.dom(screen.getByRole('link', { name: 'Target Volcan' })).exists();
  });
});
