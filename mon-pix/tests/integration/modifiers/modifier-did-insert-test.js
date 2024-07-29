import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Modifier | did-insert', function (hooks) {
  setupRenderingTest(hooks);

  test('should call the given action', async function (assert) {
    // given
    const actionStub = sinon.stub();
    this.set('action', actionStub);

    // when
    await render(hbs`<div {{modifier-did-insert this.action}}></div>`);

    // then
    sinon.assert.called(actionStub);
    assert.ok(true);
  });
});
