import Batch from 'pix-admin/components/assistant/domain/lot';
import { module, test } from 'qunit';

module('Unit | Component | assistant/domain/lot', function () {
  module('#addCall()', function () {
    test('creates ToolCall with correct index (1-based, increments)', function (assert) {
      // given
      const batch = new Batch();

      // when
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'A1' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'A2' } });

      // then
      assert.strictEqual(batch.calls.length, 2);
      assert.strictEqual(batch.calls[0].index, 1, 'first call has index 1');
      assert.strictEqual(batch.calls[1].index, 2, 'second call has index 2');
    });

    test('throws when batch is not in pending state', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'A1' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.finishSimulation();

      // when / then
      assert.throws(
        () => batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'A2' } }),
        /addCall forbidden/,
        'throws when state is not pending',
      );
    });
  });

  module('#recordSimulationResult()', function () {
    test('sets verdict to "ready" when result has wouldCreate', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });

      // when
      batch.recordSimulationResult(1, { wouldCreate: true });

      // then
      assert.strictEqual(batch.calls[0].verdict, 'ready');
      assert.deepEqual(batch.calls[0].result, { wouldCreate: true });
    });

    test('sets verdict to "error" when result has error', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });

      // when
      batch.recordSimulationResult(1, { error: 'invalid data' });

      // then
      assert.strictEqual(batch.calls[0].verdict, 'error');
      assert.deepEqual(batch.calls[0].result, { error: 'invalid data' });
    });

    test('marks both calls as duplicate when they share the same externalId', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'SAME' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'SAME' } });

      // when — simulate both
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { wouldCreate: true });

      // then
      assert.strictEqual(batch.calls[0].verdict, 'duplicate', 'first call marked duplicate');
      assert.strictEqual(batch.calls[1].verdict, 'duplicate', 'second call marked duplicate');
    });

    test('does not mark duplicate when externalId is null', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: null } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: null } });

      // when
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { wouldCreate: true });

      // then
      assert.strictEqual(batch.calls[0].verdict, 'ready', 'null externalId does not trigger duplicate');
      assert.strictEqual(batch.calls[1].verdict, 'ready');
    });
  });

  module('#finishSimulation()', function () {
    test('sets state to "simulated" when all calls have a verdict', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.recordSimulationResult(1, { wouldCreate: true });

      // when
      batch.finishSimulation();

      // then
      assert.strictEqual(batch.state, 'simulated');
    });

    test('throws when some calls do not have a verdict yet', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'X2' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      // call 2 not yet simulated

      // when / then
      assert.throws(() => batch.finishSimulation(), /simulation-incomplete/, 'throws when not all verdicts set');
    });
  });

  module('#approve()', function () {
    test('throws when an error call exists', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.recordSimulationResult(1, { error: 'bad data' });
      batch.finishSimulation();

      // when / then
      assert.throws(() => batch.approve(), /batch-has-unresolved-errors/);
    });

    test('throws when a duplicate call exists', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'SAME' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'SAME' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { wouldCreate: true });
      batch.finishSimulation();

      // when / then
      assert.throws(() => batch.approve(), /batch-has-unresolved-errors/);
    });

    test('succeeds after excluding all errors', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'X2' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { error: 'bad' });
      batch.finishSimulation();
      batch.calls[1].exclude();

      // when
      batch.approve();

      // then
      assert.strictEqual(batch.state, 'approved');
    });
  });

  module('#callsToExecute()', function () {
    test('returns only calls with verdict "ready" (not "excluded")', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'X2' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { wouldCreate: true });
      batch.finishSimulation();
      batch.calls[1].exclude();
      batch.approve();

      // when
      const result = batch.callsToExecute();

      // then
      assert.strictEqual(result.length, 1, 'only one ready call returned');
      assert.strictEqual(result[0].index, 1, 'the ready call is index 1');
    });
  });

  module('#recordExecutionResult()', function () {
    test('does not re-execute calls that already have an id result', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.addCall({ sourceRow: 3, name: 'create_organization', args: { externalId: 'X2' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.recordSimulationResult(2, { wouldCreate: true });
      batch.finishSimulation();
      batch.approve();
      batch.startExecution();

      // execute call 1 first
      batch.recordExecutionResult(1, { id: 'org-1', name: 'Org 1' });
      const resultAfter = batch.calls[0].result;

      // attempt to re-execute call 1
      batch.recordExecutionResult(1, { id: 'org-OVERWRITE', name: 'Should not overwrite' });

      // then — result should not have changed
      assert.deepEqual(batch.calls[0].result, resultAfter, 'result was not overwritten');
    });

    test('sets state to "done" when all ready calls have been executed', function (assert) {
      // given
      const batch = new Batch();
      batch.addCall({ sourceRow: 2, name: 'create_organization', args: { externalId: 'X1' } });
      batch.recordSimulationResult(1, { wouldCreate: true });
      batch.finishSimulation();
      batch.approve();
      batch.startExecution();

      // when
      batch.recordExecutionResult(1, { id: 'org-1', name: 'Org 1' });

      // then
      assert.strictEqual(batch.state, 'done');
    });
  });
});
