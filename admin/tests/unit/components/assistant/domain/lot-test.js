import Lot from 'pix-admin/components/assistant/domain/lot';
import { module, test } from 'qunit';

module('Unit | Component | assistant/domain/lot', function () {
  module('#ajouterAppel()', function () {
    test('creates Appel with correct rang (1-based, increments)', function (assert) {
      // given
      const lot = new Lot();

      // when
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'A1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'A2' } });

      // then
      assert.strictEqual(lot.appels.length, 2);
      assert.strictEqual(lot.appels[0].rang, 1, 'first appel has rang 1');
      assert.strictEqual(lot.appels[1].rang, 2, 'second appel has rang 2');
    });

    test('throws when lot is not in a_simuler state', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'A1' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();

      // when / then
      assert.throws(
        () => lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'A2' } }),
        /ajouterAppel interdit/,
        'throws when etat is not a_simuler',
      );
    });
  });

  module('#enregistrerResultatSimulation()', function () {
    test('sets verdict to "pret" when result has wouldCreate', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });

      // when
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });

      // then
      assert.strictEqual(lot.appels[0].verdict, 'pret');
      assert.deepEqual(lot.appels[0].resultat, { wouldCreate: true });
    });

    test('sets verdict to "erreur" when result has error', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });

      // when
      lot.enregistrerResultatSimulation(1, { error: 'invalid data' });

      // then
      assert.strictEqual(lot.appels[0].verdict, 'erreur');
      assert.deepEqual(lot.appels[0].resultat, { error: 'invalid data' });
    });

    test('marks both appels as doublon when they share the same externalId', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'SAME' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'SAME' } });

      // when — simulate both
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });

      // then
      assert.strictEqual(lot.appels[0].verdict, 'doublon', 'first appel marked doublon');
      assert.strictEqual(lot.appels[1].verdict, 'doublon', 'second appel marked doublon');
    });

    test('does not mark doublon when externalId is null', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: null } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: null } });

      // when
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });

      // then
      assert.strictEqual(lot.appels[0].verdict, 'pret', 'null externalId does not trigger doublon');
      assert.strictEqual(lot.appels[1].verdict, 'pret');
    });
  });

  module('#terminerSimulation()', function () {
    test('sets etat to "simule" when all appels have a verdict', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });

      // when
      lot.terminerSimulation();

      // then
      assert.strictEqual(lot.etat, 'simule');
    });

    test('throws when some appels do not have a verdict yet', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'X2' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      // appel 2 not yet simulated

      // when / then
      assert.throws(() => lot.terminerSimulation(), /simulation-incomplete/, 'throws when not all verdicts set');
    });
  });

  module('#approuver()', function () {
    test('throws "lot-a-des-erreurs-non-exclues" when an erreur appel exists', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.enregistrerResultatSimulation(1, { error: 'bad data' });
      lot.terminerSimulation();

      // when / then
      assert.throws(() => lot.approuver(), /lot-a-des-erreurs-non-exclues/);
    });

    test('throws "lot-a-des-erreurs-non-exclues" when a doublon appel exists', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'SAME' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'SAME' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });
      lot.terminerSimulation();

      // when / then
      assert.throws(() => lot.approuver(), /lot-a-des-erreurs-non-exclues/);
    });

    test('succeeds after excluding all errors', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'X2' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { error: 'bad' });
      lot.terminerSimulation();
      lot.appels[1].exclure();

      // when
      lot.approuver();

      // then
      assert.strictEqual(lot.etat, 'approuve');
    });
  });

  module('#appelsAExecuter()', function () {
    test('returns only appels with verdict "pret" (not "exclue")', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'X2' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });
      lot.terminerSimulation();
      lot.appels[1].exclure();
      lot.approuver();

      // when
      const result = lot.appelsAExecuter();

      // then
      assert.strictEqual(result.length, 1, 'only one pret appel returned');
      assert.strictEqual(result[0].rang, 1, 'the pret appel is rang 1');
    });
  });

  module('#enregistrerResultatExecution()', function () {
    test('does not re-execute appels that already have an id result', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.ajouterAppel({ ligneSource: 3, nom: 'create_organization', args: { externalId: 'X2' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.enregistrerResultatSimulation(2, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      // execute appel 1 first
      lot.enregistrerResultatExecution(1, { id: 'org-1', name: 'Org 1' });
      const resultatApres = lot.appels[0].resultat;

      // attempt to re-execute appel 1
      lot.enregistrerResultatExecution(1, { id: 'org-OVERWRITE', name: 'Should not overwrite' });

      // then — resultat should not have changed
      assert.deepEqual(lot.appels[0].resultat, resultatApres, 'resultat was not overwritten');
    });

    test('sets etat to "termine" when all pret appels have been executed', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      // when
      lot.enregistrerResultatExecution(1, { id: 'org-1', name: 'Org 1' });

      // then
      assert.strictEqual(lot.etat, 'termine');
    });
  });

  module('#arreter()', function () {
    test('sets etat to "termine" for partial completion', function (assert) {
      // given
      const lot = new Lot();
      lot.ajouterAppel({ ligneSource: 2, nom: 'create_organization', args: { externalId: 'X1' } });
      lot.enregistrerResultatSimulation(1, { wouldCreate: true });
      lot.terminerSimulation();
      lot.approuver();
      lot.demarrerExecution();

      // when
      lot.arreter();

      // then
      assert.strictEqual(lot.etat, 'termine');
    });
  });
});
