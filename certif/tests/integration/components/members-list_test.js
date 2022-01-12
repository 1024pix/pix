import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';

module('Integration | Component | members-list', function (hooks) {
  setupRenderingTest(hooks);

  test('it should show members firstName and lastName', async function (assert) {
    // given
    const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré' });
    const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams' });
    const members = [certifMember1, certifMember2];
    this.set('members', members);

    // when
    await render(hbs`<MembersList @members={{this.members}} />`);

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
    assert.contains('Maria');
    assert.contains('Carré');
    assert.contains('John');
    assert.contains('Williams');
  });
});
