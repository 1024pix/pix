import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Modifier | did-insert', function (hooks) {
  setupRenderingTest(hooks);

  test('should call the given action', async function (assert) {
    // given
    const actionStub = sinon.stub();

    // when
    await render(
      <template>
        <div {{modifierDidInsert actionStub}}></div>
      </template>,
    );

    // then
    sinon.assert.called(actionStub);
    assert.ok(true);
  });
});
