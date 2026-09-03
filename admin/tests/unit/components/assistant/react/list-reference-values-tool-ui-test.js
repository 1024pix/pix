import { act, cleanup, render, waitFor } from '@testing-library/react';
import ListReferenceValuesToolUI from 'pix-admin/components/assistant/react/ListReferenceValuesToolUI.jsx';
import { module, test } from 'qunit';
import { createElement } from 'react';
import sinon from 'sinon';

module('Unit | Component | assistant/react/ListReferenceValuesToolUI', function (hooks) {
  let fetchStub;

  hooks.beforeEach(function () {
    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    cleanup();
    sinon.restore();
  });

  test('appelle addResult automatiquement au montage sans clic utilisateur', async function (assert) {
    assert.expect(2);
    const referenceResult = { values: ['PRO', 'SCO', 'SUP'] };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(referenceResult),
    });

    await act(async () => {
      await render(
        createElement(ListReferenceValuesToolUI, {
          args: { type: 'organizationType' },
          addResult,
          getAccessToken,
        }),
      );
    });

    await waitFor(() => assert.ok(addResult.calledOnce, 'addResult appelé sans clic utilisateur'));
    assert.deepEqual(addResult.firstCall.args[0], referenceResult);
  });

  test("appelle addResult avec l'erreur et affiche un message — le LLM peut ainsi récupérer", async function (assert) {
    assert.expect(3);
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
        createElement(ListReferenceValuesToolUI, {
          args: { target: 'organization:type' },
          addResult,
          getAccessToken,
        }),
      ));
    });

    // addResult doit être appelé même en cas d'erreur : c'est ce qui permet au runtime
    // @assistant-ui de déclencher sendAutomaticallyWhen et de re-soumettre au LLM
    await waitFor(() => assert.ok(addResult.calledOnce, "addResult appelé même en cas d'erreur"));
    assert.deepEqual(addResult.firstCall.args[0], errorResult, "addResult reçoit l'objet erreur");
    assert.ok(container.querySelector('.tool-error'), "un message d'erreur est affiché");
  });
});
