import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateOrganizationToolUI from 'pix-admin/components/assistant/react/CreateOrganizationToolUI.jsx';
import { module, test } from 'qunit';
import { createElement } from 'react';
import sinon from 'sinon';

const baseProps = {
  args: { name: 'Mon Organisation', externalId: 'EXT-001', type: 'PRO' },
  status: { type: 'running' },
  result: undefined,
  addResult: () => {},
  onNavigateToOrganization: () => {},
  toolName: 'create_organization',
};

module('Unit | Component | assistant/react/CreateOrganizationToolUI', function (hooks) {
  let fetchStub;

  hooks.beforeEach(function () {
    fetchStub = sinon.stub(window, 'fetch');
  });

  hooks.afterEach(function () {
    cleanup();
    sinon.restore();
  });

  test('la carte affiche les champs reçus dans les args', async function (assert) {
    await render(createElement(CreateOrganizationToolUI, baseProps));
    assert.ok(screen.getByText('Mon Organisation'), 'affiche le nom');
    assert.ok(screen.getByText('EXT-001'), "affiche l'identifiant externe");
  });

  test('le clic Confirmer fait un fetch vers tools/{toolName} et appelle addResult', async function (assert) {
    assert.expect(6);
    const toolResult = { id: '42', name: 'Mon Organisation' };
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.resolves({
      ok: true,
      json: sinon.stub().resolves(toolResult),
    });

    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        getAccessToken,
        addResult,
        toolName: 'create_organization',
      }),
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Confirmer'));
    });

    await waitFor(() => assert.ok(addResult.calledOnce, 'addResult appelé une fois'));
    assert.deepEqual(addResult.firstCall.args[0], toolResult);
    assert.ok(getAccessToken.calledOnce, 'getAccessToken appelé');
    const [url, options] = fetchStub.firstCall.args;
    assert.strictEqual(url, '/api/admin/llm-assistant/tools/create_organization');
    assert.strictEqual(options.method, 'POST');
    assert.strictEqual(options.headers.Authorization, 'Bearer jwt-token');
  });

  test("l'état succès affiche la notification et un lien", async function (assert) {
    const onNavigateToOrganization = sinon.spy();
    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        result: { id: '42', name: 'Mon Organisation' },
        onNavigateToOrganization,
      }),
    );
    const btn = screen.getByText("Voir l'organisation");
    assert.ok(btn, 'bouton présent');
    fireEvent.click(btn);
    assert.ok(onNavigateToOrganization.calledOnce, 'callback appelée');
    assert.deepEqual(onNavigateToOrganization.firstCall.args[0], '42');
  });

  test("l'état échec affiche les messages d'erreur par champ", async function (assert) {
    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        result: {
          error: {
            fieldErrors: [{ detail: 'Nom requis' }, { detail: 'ID déjà utilisé' }],
          },
        },
      }),
    );
    assert.ok(screen.getByText('Nom requis, ID déjà utilisé'), 'erreurs fieldErrors affichées');
  });

  test("l'état échec affiche error.validation", async function (assert) {
    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        result: {
          error: { validation: 'MCP error -32602: Input validation error: type requis' },
        },
      }),
    );
    assert.ok(
      screen.getByText('MCP error -32602: Input validation error: type requis'),
      'message de validation affiché',
    );
  });

  test('le fetch qui échoue passe en état échec avec Réessayer', async function (assert) {
    assert.expect(2);
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    fetchStub.rejects(new Error('Network error'));

    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        getAccessToken,
        addResult,
        toolName: 'create_organization',
      }),
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Confirmer'));
    });

    assert.ok(screen.getByText('Réessayer'), 'bouton Réessayer affiché');

    await act(async () => {
      fireEvent.click(screen.getByText('Réessayer'));
    });

    assert.ok(fetchStub.calledTwice, 'fetch appelé deux fois');
  });

  test("deux clics sur Confirmer ne déclenchent qu'un seul appel réseau", async function (assert) {
    assert.expect(1);
    const getAccessToken = sinon.stub().resolves('jwt-token');
    const addResult = sinon.spy();
    // fetch ne résout jamais (simule une requête en cours)
    fetchStub.returns(new Promise(() => {}));

    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        getAccessToken,
        addResult,
        toolName: 'create_organization',
      }),
    );

    // Récupérer le bouton avant le premier clic (après le premier clic, le composant passe en état loading)
    const confirmBtn = screen.getByText('Confirmer');
    // Les deux clics se font avant que React rerender — le ref guard bloque le second
    // Premier clic : met submittingRef.current = true et démarre l'appel réseau
    // Deuxième clic : voit submittingRef.current = true et retourne immédiatement
    fireEvent.click(confirmBtn);
    fireEvent.click(confirmBtn);

    // Laisser les microtâches s'exécuter (résolution de getAccessToken, puis appel de fetch)
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    assert.ok(fetchStub.calledOnce, 'fetch appelé exactement une fois');
  });

  test('Annuler injecte { error: cancelled } sans appel réseau', async function (assert) {
    assert.expect(2);
    const addResult = sinon.spy();

    await render(
      createElement(CreateOrganizationToolUI, {
        ...baseProps,
        status: { type: 'complete' },
        addResult,
        toolName: 'create_organization',
      }),
    );

    fireEvent.click(screen.getByText('Annuler'));

    assert.ok(addResult.calledWith({ error: 'cancelled' }), 'addResult appelé avec { error: cancelled }');
    assert.ok(fetchStub.notCalled, 'fetch non appelé');
  });
});
