import DocumentDepose from 'pix-admin/components/assistant/domain/document-depose';
import { module, test } from 'qunit';

module('Unit | Component | assistant/domain/document-depose', function () {
  module('#sommaire()', function () {
    test('shows title row, empty row 2, and "Total" row visible in last 3 lines for a small sheet', function (assert) {
      // given — 5 rows total (≤ 8, so all rows shown)
      const feuilles = {
        Clients: [['Nom', 'Ville', 'CA'], [], ['Alice', 'Paris', 1000], ['Bob', 'Lyon', 2000], ['Total', '', 3000]],
      };
      const doc = new DocumentDepose({ id: '1', nom: 'test.xlsx', feuilles });

      // when
      const result = doc.sommaire();

      // then
      assert.true(result.includes('Clients'), 'sheet name is present');
      assert.true(result.includes('5 × 3'), 'dimensions are present');
      assert.true(result.includes('Nom'), 'first row is present');
      assert.true(result.includes('Total'), 'Total row is visible');
      assert.false(result.includes('lignes omises'), 'no omission for ≤ 8 rows');
    });

    test('shows first 5 + last 3 rows with omission line for sheets > 8 rows', function (assert) {
      // given — 12 rows total
      const rows = [
        ['Titre A', 'Titre B'],
        ['r2a', 'r2b'],
        ['r3a', 'r3b'],
        ['r4a', 'r4b'],
        ['r5a', 'r5b'],
        ['r6a', 'r6b'],
        ['r7a', 'r7b'],
        ['r8a', 'r8b'],
        ['r9a', 'r9b'],
        ['r10a', 'r10b'],
        ['r11a', 'r11b'],
        ['Total', '9999'],
      ];
      const doc = new DocumentDepose({ id: '2', nom: 'big.xlsx', feuilles: { Feuille1: rows } });

      // when
      const result = doc.sommaire();

      // then
      assert.true(result.includes('Titre A'), 'first row visible');
      assert.true(result.includes('r5a'), 'fifth row visible');
      assert.false(result.includes('r6a'), 'sixth row omitted');
      assert.true(result.includes('lignes omises'), 'omission line present');
      assert.true(result.includes('r10a'), 'tenth row visible (last-3 start)');
      assert.true(result.includes('Total'), 'last row visible');
    });
  });

  module('#plage()', function () {
    test('returns correct rows with | separator', function (assert) {
      // given
      const feuilles = {
        Data: [
          ['H1', 'H2', 'H3'],
          ['A', 'B', 'C'],
          ['D', 'E', 'F'],
          ['G', 'H', 'I'],
        ],
      };
      const doc = new DocumentDepose({ id: '3', nom: 'data.xlsx', feuilles });

      // when — rows 2 to 3 (1-indexed)
      const result = doc.plage('Data', 2, 3);

      // then
      assert.true(result.includes('A|B|C'), 'row 2 formatted with | separator');
      assert.true(result.includes('D|E|F'), 'row 3 formatted with | separator');
      assert.false(result.includes('H1'), 'row 1 not included');
      assert.false(result.includes('G'), 'row 4 not included');
    });

    test('adds an entry to plagesVues after each call', function (assert) {
      // given
      const feuilles = {
        Sheet1: [
          ['a', 'b'],
          ['c', 'd'],
          ['e', 'f'],
        ],
      };
      const doc = new DocumentDepose({ id: '4', nom: 'file.xlsx', feuilles });
      assert.strictEqual(doc.plagesVues.length, 0, 'starts empty');

      // when
      doc.plage('Sheet1', 1, 2);
      doc.plage('Sheet1', 2, 3);

      // then
      assert.strictEqual(doc.plagesVues.length, 2, 'two entries recorded');
      assert.deepEqual(doc.plagesVues[0], { feuille: 'Sheet1', from: 1, to: 2 });
      assert.deepEqual(doc.plagesVues[1], { feuille: 'Sheet1', from: 2, to: 3 });
    });

    test('throws when range exceeds 50 rows', function (assert) {
      // given
      const rows = Array.from({ length: 60 }, (_, i) => [`row${i}`]);
      const doc = new DocumentDepose({ id: '5', nom: 'large.xlsx', feuilles: { Big: rows } });

      // when / then
      assert.throws(() => doc.plage('Big', 1, 51), /50 lignes max par appel/, 'throws with expected message');
    });

    test('does not throw when range is exactly 50 rows (to - from === 49)', function (assert) {
      // given
      const rows = Array.from({ length: 60 }, (_, i) => [`row${i}`]);
      const doc = new DocumentDepose({ id: '6', nom: 'large.xlsx', feuilles: { Big: rows } });

      // when / then — should not throw
      assert.notStrictEqual(doc.plage('Big', 1, 50), undefined, 'returns a value without throwing');
    });
  });
});
