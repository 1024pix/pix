import { act, cleanup, render, waitFor } from '@testing-library/react';
import DocumentDepose from 'pix-admin/components/assistant/domain/document-depose.js';
import { ReadDocumentExecutor } from 'pix-admin/components/assistant/react/AssistantApp.jsx';
import { documentRegistry } from 'pix-admin/components/assistant/react/LotToolUI.jsx';
import { module, test } from 'qunit';
import { createElement } from 'react';
import sinon from 'sinon';

module('Unit | Component | assistant/react/AssistantApp', function (hooks) {
  hooks.afterEach(function () {
    cleanup();
    sinon.restore();
    documentRegistry.clear();
  });

  module('ReadDocumentExecutor', function () {
    test('calls addResult with the result of doc.plage()', async function (assert) {
      assert.expect(2);
      const feuilles = {
        Feuille1: [
          ['A', 'B'],
          ['1', '2'],
          ['3', '4'],
        ],
      };
      const doc = new DocumentDepose({ id: 'doc-1', nom: 'test.xlsx', feuilles });
      documentRegistry.set('doc-1', doc);

      const addResult = sinon.spy();

      await act(async () => {
        await render(
          createElement(ReadDocumentExecutor, {
            args: { documentId: 'doc-1', sheet: 'Feuille1', from: 1, to: 2 },
            addResult,
            status: { type: 'running' },
          }),
        );
      });

      await waitFor(() => assert.ok(addResult.calledOnce, 'addResult called once'));
      assert.strictEqual(typeof addResult.firstCall.args[0], 'string', 'result is a string');
    });

    test('records plagesVues after reading', async function (assert) {
      assert.expect(2);
      const feuilles = {
        Feuille1: [
          ['A', 'B'],
          ['1', '2'],
          ['3', '4'],
        ],
      };
      const doc = new DocumentDepose({ id: 'doc-2', nom: 'test.xlsx', feuilles });
      documentRegistry.set('doc-2', doc);

      const addResult = sinon.spy();

      await act(async () => {
        await render(
          createElement(ReadDocumentExecutor, {
            args: { documentId: 'doc-2', sheet: 'Feuille1', from: 1, to: 2 },
            addResult,
            status: { type: 'running' },
          }),
        );
      });

      await waitFor(() => assert.ok(addResult.calledOnce));
      assert.strictEqual(doc.plagesVues.length, 1, 'one range recorded in plagesVues');
    });

    test('returns an error when the range exceeds 50 rows', async function (assert) {
      assert.expect(1);
      const rows = Array.from({ length: 60 }, (_, i) => [`val${i}`]);
      const feuilles = { Feuille1: rows };
      const doc = new DocumentDepose({ id: 'doc-3', nom: 'test.xlsx', feuilles });
      documentRegistry.set('doc-3', doc);

      const addResult = sinon.spy();

      await act(async () => {
        await render(
          createElement(ReadDocumentExecutor, {
            args: { documentId: 'doc-3', sheet: 'Feuille1', from: 1, to: 60 },
            addResult,
            status: { type: 'running' },
          }),
        );
      });

      await waitFor(() => assert.ok(addResult.calledOnce, 'addResult called with error'));
    });
  });
});
