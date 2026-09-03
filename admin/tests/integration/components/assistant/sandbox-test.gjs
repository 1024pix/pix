import { setupTest } from 'ember-qunit';
import { executer } from 'pix-admin/components/assistant/sandbox/bac-a-sable';
import { module, test } from 'qunit';

module('Integration | Component | assistant/sandbox', function (hooks) {
  setupTest(hooks);

  test('a script runs and calls a tool — onToolCall receives correct name and args', async function (assert) {
    // given
    const receivedCalls = [];
    const onToolCall = async ({ name, args }) => {
      receivedCalls.push({ name, args });
      return { ok: true };
    };

    const script = `await tools.call('create_organization', { name: 'Test' });`;

    // when
    await executer({ script, sheets: {}, onToolCall });

    // then
    assert.strictEqual(receivedCalls.length, 1);
    assert.strictEqual(receivedCalls[0].name, 'create_organization');
    assert.deepEqual(receivedCalls[0].args, { name: 'Test' });
  });

  test('sandbox passes args faithfully — caller is responsible for adding simulate: true', async function (assert) {
    // given
    // The script passes { name: 'Test', simulate: false }.
    // The onToolCall callback adds simulate: true on its own copy — but it
    // receives the original args unchanged from the sandbox.
    const receivedArgs = [];
    const onToolCall = async ({ args }) => {
      receivedArgs.push({ ...args });
      // Caller adds simulate: true — sandbox is not involved.
      return { ok: true, simulate: true };
    };

    const script = `await tools.call('create_organization', { name: 'Test', simulate: false });`;

    // when
    await executer({ script, sheets: {}, onToolCall });

    // then — sandbox must NOT have modified the args; simulate: false is preserved
    assert.strictEqual(receivedArgs.length, 1);
    assert.false(receivedArgs[0].simulate, 'sandbox passes args faithfully without overriding simulate');
    assert.strictEqual(receivedArgs[0].name, 'Test');
  });

  test('a script that throws rejects the executer promise with the error message', async function (assert) {
    // given
    const onToolCall = async () => ({ ok: true });
    const script = `throw new Error('something went wrong');`;

    // when / then
    await assert.rejects(executer({ script, sheets: {}, onToolCall }), /something went wrong/);
  });

  test('onToolCall returning { error } does not break execution — script continues and done is posted', async function (assert) {
    // given
    const onToolCall = async () => ({ error: 'simulated tool error' });

    // The script calls a tool, receives { error }, then continues and calls another tool.
    const script = `
      const result = await tools.call('create_organization', { name: 'First' });
      // result has an error but script doesn't throw — it continues
      await tools.call('create_organization', { name: 'Second' });
    `;

    const callCount = { value: 0 };
    const countingOnToolCall = async (call) => {
      callCount.value++;
      return onToolCall(call);
    };

    // when — should resolve (not reject) because the script completes normally
    await executer({ script, sheets: {}, onToolCall: countingOnToolCall });

    // then
    assert.strictEqual(callCount.value, 2, 'both tool calls were received despite first returning an error');
  });
});
