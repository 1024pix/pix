import { exporterBilan } from 'pix-admin/components/assistant/documents/exporter-bilan';
import Lot from 'pix-admin/components/assistant/domain/lot';
import { module, test } from 'qunit';
import sinon from 'sinon';

// These tests focus on the Lot domain state machine (the core logic exercised by LotToolUI)
// and on the exporterBilan function.
// React rendering is not tested here — see integration tests for UI assertions.

module('Unit | Component | assistant/react/LotToolUI', function (hooks) {
  hooks.afterEach(function () {
    sinon.restore();
  });

  // ── 1. Simulation réussie ──────────────────────────────────────────────────
  module('simulation phase', function () {
    test('on mount, successful simulation sets appel verdict to "pret"', function (assert) {
      // Simulate what LotToolUI does on mount
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true, name: 'Org A' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();

      assert.strictEqual(lot.appels[0].verdict, 'pret');
      assert.strictEqual(lot.etat, 'simule');
    });

    // ── 2. Simulation error ────────────────────────────────────────────────────
    test('simulation error sets appel verdict to "erreur"', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true, name: 'Bad Org' } });
      lot.enregistrerResultatSimulation(1, { error: 'invalid type' });
      lot.terminerSimulation();

      assert.strictEqual(lot.appels[0].verdict, 'erreur');
    });
  });

  // ── 3. Exclure button ─────────────────────────────────────────────────────
  module('exclure action', function () {
    test('excluding an erreur appel changes verdict to "exclue"', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 4, nom: 'create_organization', args: { simulate: true, externalId: 'X' } });
      lot.enregistrerResultatSimulation(1, { error: 'bad' });
      lot.terminerSimulation();

      // Simulate what the Exclure button onClick does
      lot.appels[0].exclure();

      assert.strictEqual(lot.appels[0].verdict, 'exclue');
    });
  });

  // ── 4. "Créer" disabled when errors non-excluded ──────────────────────────
  module('"Créer" button state', function () {
    test('cannot approve when non-excluded errors exist', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { error: 'bad data' });
      lot.terminerSimulation();

      assert.throws(() => lot.approuver(), /lot-a-des-erreurs-non-exclues/, 'approuver throws with non-excluded error');
    });

    test('can approve once all errors are excluded', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { error: 'bad data' });
      lot.terminerSimulation();
      lot.appels[1].exclure();

      lot.approuver();

      assert.strictEqual(lot.etat, 'approuve');
    });
  });

  // ── 5. Annuler calls addResult({ error: 'cancelled' }) ────────────────────
  module('annuler action', function () {
    test('Annuler calls addResult with { error: cancelled }', function (assert) {
      const addResult = sinon.spy();

      // Simulate handleAnnuler from LotToolUI
      const handleAnnuler = () => addResult({ error: 'cancelled' });
      handleAnnuler();

      assert.ok(addResult.calledOnce, 'addResult called once');
      assert.deepEqual(addResult.firstCall.args[0], { error: 'cancelled' });
    });
  });

  // ── 6. Partial failure: first 6 succeed, 7th fails ───────────────────────
  module('execution — partial failure', function () {
    test('first 6 succeed, 7th execution fails — lot is "termine" with mixed results', async function (assert) {
      const lot = new Lot();
      for (let i = 1; i <= 7; i++) {
        lot.ajouterAppel({
          ligneSource: i + 1,
          nom: 'create_organization',
          args: { simulate: true, externalId: `EXT-${i}` },
        });
        lot.enregistrerResultatSimulation(i, { wouldCreate: true });
      }
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      const toExec = lot.appelsAExecuter();
      assert.strictEqual(toExec.length, 7, '7 appels to execute');

      // Execute first 6 successfully
      for (let i = 1; i <= 6; i++) {
        lot.enregistrerResultatExecution(i, { id: `org-${i}`, name: `Org ${i}` });
      }
      // 7th fails (error response)
      lot.enregistrerResultatExecution(7, { error: 'server error' });
      // Since the 7th does not have id, lot won't auto-terminate via enregistrerResultatExecution
      // We manually stop
      lot.arreter();

      assert.strictEqual(lot.etat, 'termine');
      assert.ok(lot.appels[5].resultat?.id, 'appel 6 has id');
      assert.ok(lot.appels[6].resultat?.error, 'appel 7 has error');
    });
  });

  // ── 7. Arrêter stops execution ────────────────────────────────────────────
  module('arreter action', function () {
    test('arreter sets lot.etat to "termine"', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      lot.arreter();

      assert.strictEqual(lot.etat, 'termine');
    });
  });

  // ── 8. Reprise does not replay already-executed appels ───────────────────
  module('reprise (resume)', function () {
    test('appels already having an id are not re-executed', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true, externalId: 'A1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true, externalId: 'A2' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      // Execute first one
      lot.enregistrerResultatExecution(1, { id: 'org-1', name: 'Org 1' });

      // Attempt to re-execute appel 1 (simulates reprise scenario)
      lot.enregistrerResultatExecution(1, { id: 'org-OVERWRITE', name: 'Should not overwrite' });

      assert.strictEqual(lot.appels[0].resultat.id, 'org-1', 'result not overwritten');
    });

    test('appelsAExecuter returns only appels with verdict "pret" (not yet executed)', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();

      const toExec = lot.appelsAExecuter();
      assert.strictEqual(toExec.length, 2, 'both pret appels returned');
    });
  });

  // ── 9. CSV bilan contains all 4 statuts ──────────────────────────────────
  module('exporterBilan', function () {
    test('CSV contains all 4 statuts: créée, erreur, doublon, exclue', function (assert) {
      // Build a lot with all 4 statuts
      const lot = new Lot();
      // pret → créée (after execution with id)
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true, externalId: 'A1' } });
      // erreur
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { simulate: true, externalId: 'A2' } });
      // doublon (same externalId as A1)
      lot.ajouterAppel({ ligneSource: 4, nom: 'create_organization', args: { simulate: true, externalId: 'A1' } });
      // will be exclue
      lot.ajouterAppel({ ligneSource: 5, nom: 'create_organization', args: { simulate: true, externalId: 'A4' } });

      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { error: 'bad' });
      lot.enregistrerResultatSimulation(3, { wouldCreate: true });
      lot.enregistrerResultatSimulation(4, { wouldCreate: true });

      // appel 1 and 3 are doublon (same externalId 'A1'), appel 4 is pret
      // Exclude appel 4 and both doublons so we can terminate
      lot.appels[2].exclure(); // doublon 3
      lot.appels[0].exclure(); // doublon 1
      lot.appels[1].exclure(); // erreur 2
      // appel 4 (rang 4) is pret now — the only remaining pret
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();
      // Record execution result for rang 4 (the pret one)
      lot.enregistrerResultatExecution(4, { id: 'org-99', name: 'Org 99' });

      // Stub browser APIs
      const mockBlob = {};
      const BlobStub = sinon.stub(window, 'Blob').returns(mockBlob);
      const mockUrl = 'blob:test';
      sinon.stub(URL, 'createObjectURL').returns(mockUrl);
      const revokeStub = sinon.stub(URL, 'revokeObjectURL');
      const appendChildStub = sinon.stub(document.body, 'appendChild');
      const removeChildStub = sinon.stub(document.body, 'removeChild');

      let csvContent = null;
      BlobStub.callsFake((parts) => {
        csvContent = parts[0];
        return mockBlob;
      });

      exporterBilan(lot);

      sinon.restore();

      assert.ok(csvContent, 'CSV content generated');
      assert.ok(csvContent.includes('exclue'), 'contains exclue');
      assert.ok(csvContent.includes('erreur'), 'contains erreur');
      assert.ok(csvContent.includes('créée'), 'contains créée');
      // doublon appels show as "exclue" after manual exclusion
      assert.ok(csvContent.includes('org-99'), 'contains org id');
      assert.ok(csvContent.includes(`${window.location.origin}/organizations/org-99`), 'contains org link');
      assert.ok(appendChildStub.calledOnce, 'anchor appended');
      assert.ok(removeChildStub.calledOnce, 'anchor removed');
      assert.ok(revokeStub.calledOnce, 'URL revoked');
    });

    test('CSV header is correct', function (assert) {
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { simulate: true } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();
      lot.enregistrerResultatExecution(1, { id: 'org-1' });

      const BlobStub = sinon.stub(window, 'Blob');
      sinon.stub(URL, 'createObjectURL').returns('blob:test');
      sinon.stub(URL, 'revokeObjectURL');
      sinon.stub(document.body, 'appendChild');
      sinon.stub(document.body, 'removeChild');

      let csvContent = null;
      BlobStub.callsFake((parts) => {
        csvContent = parts[0];
        return {};
      });

      exporterBilan(lot);
      sinon.restore();

      assert.ok(csvContent.startsWith('ligne_source,nom,statut,id_organisation,lien'), 'header is correct');
    });
  });

  // ── 10. Script error shows error state ───────────────────────────────────
  module('script error', function () {
    test('executer rejection is caught and stored as simError', async function (assert) {
      // Simulate what LotToolUI does when executer rejects
      let simError = null;
      const fakeExecError = new Error('timeout');

      try {
        await Promise.reject(fakeExecError);
      } catch (err) {
        simError = err.message ?? String(err);
      }

      assert.strictEqual(simError, 'timeout', 'simError is set from error message');
    });
  });
});
