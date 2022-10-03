import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
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
    const screen = await renderScreen(hbs`<MembersList @members={{this.members}} />`);

    // then
    assert.dom(screen.getByText('Nom')).exists();
    assert.dom(screen.getByText('Prénom')).exists();
    assert.dom(screen.getByText('Maria')).exists();
    assert.dom(screen.getByText('Carré')).exists();
    assert.dom(screen.getByText('John')).exists();
    assert.dom(screen.getByText('Williams')).exists();
  });
});
