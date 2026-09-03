import { act, cleanup, render, waitFor } from '@testing-library/react';
import AutoExecToolUI from 'pix-admin/components/assistant/react/ListReferenceValuesToolUI.jsx';
import { module, test } from 'qunit';
import { createElement } from 'react';
import sinon from 'sinon';

module('Unit | Component | assistant/react/AutoExecToolUI', function (hooks) {
  let fetchStub;

  hooks.beforeEach(function () {
    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    cleanup();
    sinon.restore();
  });

  test('auto-exécute POST /api/admin/llm-assistant/tools/${toolName} avec le toolName passé en prop', async function (assert) {
    assert.expect(2);
    const toolName = 'some_read_only_tool';
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves({ values: [] }),
    });

    await act(async () => {
      await render(
        createElement(AutoExecToolUI, {
          toolName,
          args: { target: 'organization:type' },
          addResult,
          getAccessToken,
        }),
      );
    });

    await waitFor(() => assert.ok(fetchStub.calledOnce, 'fetch appelé automatiquement'));
    const [url] = fetchStub.firstCall.args;
    assert.strictEqual(url, `/api/admin/llm-assistant/tools/${toolName}`);
  });

  test('appelle addResult avec la réponse JSON', async function (assert) {
    assert.expect(1);
    const referenceResult = { target: 'organization:type', values: [{ value: 'PRO' }] };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(referenceResult),
    });

    await act(async () => {
      await render(
        createElement(AutoExecToolUI, {
          toolName: 'list_reference_values',
          args: { target: 'organization:type' },
          addResult,
          getAccessToken,
        }),
      );
    });

    await waitFor(() => assert.deepEqual(addResult.firstCall.args[0], referenceResult));
  });

  test("affiche un message d'erreur et appelle addResult quand la réponse contient une erreur", async function (assert) {
    assert.expect(2);
    const errorResult = { error: { validation: 'MCP error -32602: Invalid arguments' } };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(errorResult),
    });

    let container;
    await act(async () => {
      ({ container } = await render(
        createElement(AutoExecToolUI, {
          toolName: 'list_reference_values',
          args: {},
          addResult,
          getAccessToken,
        }),
      ));
    });

    await waitFor(() => assert.deepEqual(addResult.firstCall.args[0], errorResult));
    assert.ok(container.querySelector('.tool-error'), "un message d'erreur est affiché");
  });
});
