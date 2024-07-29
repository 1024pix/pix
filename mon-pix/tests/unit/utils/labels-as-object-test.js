import labelsAsObject from 'mon-pix/utils/labels-as-object';
import { module, test } from 'qunit';

module('Unit | Utility | labels as object', function () {
  module('#labelsAsObject', function () {
    test('should return an object with labels and key on the input 1', function (assert) {
      // given
      const challenge = {
        proposals:
          'Clé USB : ${num1}\n\n' +
          'Carte mémoire (SD) : ${num2}\n\n' +
          'Disque dur externe : ${num3}\n\n' +
          'CD-R / DVD-R : ${num4}',
      };

      const expectedResult = {
        num1: 'Clé USB : ',
        num2: 'Carte mémoire (SD) : ',
        num3: 'Disque dur externe : ',
        num4: 'CD-R / DVD-R : ',
      };
      //when
      const result = labelsAsObject(challenge.proposals);

      //then
      assert.deepEqual(result, expectedResult);
    });

    test('should return an object with labels and key on the input 2', function (assert) {
      // given
      const challenge = {
        proposals:
          '- Combien le dossier “projet PIX” contient-il de dossiers ? ${Num1}\n\n' +
          '- Combien le dossier “images” contient-il de fichiers ? ${Num2}',
      };

      const expectedResult = {
        Num1: '- Combien le dossier “projet PIX” contient-il de dossiers ? ',
        Num2: '- Combien le dossier “images” contient-il de fichiers ? ',
      };
      //when
      const result = labelsAsObject(challenge.proposals);

      //then
      assert.deepEqual(result, expectedResult);
    });

    test('should return an object with labels and key on the input 3', function (assert) {
      // given
      const challenge = {
        proposals:
          '- alain@pix.fr : ${num1}\n' +
          '- leonie@pix.fr : ${num2}\n' +
          '- Programme_Pix.pdf : ${num3}\n' +
          '- lucie@pix.fr : ${num4}\n' +
          '- Programme du festival Pix : ${num5}\n' +
          '- jeremy@pix.fr : ${num6}',
      };

      const expectedResult = {
        num1: '- alain@pix.fr : ',
        num2: '- leonie@pix.fr : ',
        num3: '- Programme_Pix.pdf : ',
        num4: '- lucie@pix.fr : ',
        num5: '- Programme du festival Pix : ',
        num6: '- jeremy@pix.fr : ',
      };
      //when
      const result = labelsAsObject(challenge.proposals);

      //then
      assert.deepEqual(result, expectedResult);
    });

    test('should return object with labels and if the key of the input has a placeholder (after #), it does not keep the placeholder', function (assert) {
      // given
      const challenge = {
        proposals:
          'Nom du fichier : ${nomfichier}\nTaille (en ko) : ${taille}\nType : ${type}\nDate de modification : ${datemodif#JJ/MM/AAAA}',
      };
      const expectedResult = {
        nomfichier: 'Nom du fichier : ',
        taille: 'Taille (en ko) : ',
        type: 'Type : ',
        datemodif: 'Date de modification : ',
      };
      //when
      const result = labelsAsObject(challenge.proposals);

      //then
      assert.deepEqual(result, expectedResult);
    });
  });
});
