import { act, cleanup, render, waitFor } from '@testing-library/react';
import { AssistantToolContext, DynamicToolFallback } from 'pix-admin/components/assistant/react/AssistantApp.jsx';
import { module, test } from 'qunit';
import { createElement } from 'react';
import sinon from 'sinon';

module('Unit | Component | assistant/react/DynamicToolFallback', function (hooks) {
  let fetchStub;

  hooks.beforeEach(function () {
    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    cleanup();
    sinon.restore();
  });

  function renderWithContext({ toolAnnotations, getAccessToken, toolName, args, addResult, status }) {
    return render(
      createElement(
        AssistantToolContext.Provider,
        { value: { toolAnnotations, getAccessToken } },
        createElement(DynamicToolFallback, { toolName, args, addResult, status }),
      ),
    );
  }

  test('monte AutoExecToolUI et appelle fetch si readOnlyHint === true', async function (assert) {
    assert.expect(1);
    const toolAnnotations = { list_reference_values: { readOnlyHint: true } };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves({ values: [] }),
    });

    await act(async () => {
      await renderWithContext({
        toolAnnotations,
        getAccessToken,
        toolName: 'list_reference_values',
        args: { target: 'organization:type' },
        addResult,
        status: { type: 'running' },
      });
    });

    await waitFor(() => assert.ok(fetchStub.calledOnce, 'fetch appelé pour un outil readOnly'));
  });

  test('ne monte pas AutoExecToolUI si readOnlyHint === false', async function (assert) {
    assert.expect(1);
    const toolAnnotations = { create_organization: { readOnlyHint: false } };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();

    await act(async () => {
      await renderWithContext({
        toolAnnotations,
        getAccessToken,
        toolName: 'create_organization',
        args: { name: 'Test' },
        addResult,
        status: { type: 'running' },
      });
    });

    assert.ok(fetchStub.notCalled, 'fetch non appelé pour un outil non readOnly');
  });

  test('ne monte rien si toolAnnotations === null (loading)', async function (assert) {
    assert.expect(1);
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();

    await act(async () => {
      await renderWithContext({
        toolAnnotations: null,
        getAccessToken,
        toolName: 'list_reference_values',
        args: {},
        addResult,
        status: { type: 'running' },
      });
    });

    assert.ok(fetchStub.notCalled, 'fetch non appelé pendant le chargement');
  });
});
