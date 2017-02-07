const { describe, it } = require('mocha');
const { expect } = require('chai');
const service = require('../../../../lib/domain/services/solution-service-qrocm-ind');

describe('Unit | Service | SolutionServiceQrocmInd', function () {

  describe('#match', function () {

    describe('when expected solutions are strings', function () {

      const solution = `9lettres:\n- courgette\n6lettres:\n- tomate\n- etamot\n4lettres:\n- noix\n- coco\n- maïs`;

      [
        `9lettres:\n- courgette\n6lettres:\n- tomate\n4lettres:\n- noix`,
        `9lettres:\n- courgette\n6lettres:\n- etamot\n4lettres:\n- maïs`,
        `9lettres:\n- Courgette\n6lettres:\n- Etamot\n4lettres:\n- mAïs`, //+ flexible à la casse
        `9lettres:\n- courgette   \n6lettres:\n- etamot   \n4lettres:\n-    maïs`, // espaces en trop
        `9lettres:\n- 'courgette   '\n6lettres:\n- 'etamot   '\n4lettres:\n- '   maïs'`, // espaces en trop
        ].forEach(function (answer) {
        it('should return ok', function () {
          const result = service.match(answer, solution);
          expect(result).to.equal('ok');
        });
      });

      [
        `9lettres:\n- courgette\n6lettres:\n- tomate\n4lettres:\n- concombre`, //mauvaise reponse
        `9lettres:\n- courgette\n6lettres:\n- ''\n4lettres:\n- noix`,          //champs vide
        `9lettres:\n- courgette\n6lettres:\n- courgette\n4lettres:\n- noix`,   //2 fois la meme bonne reponse
        `9lettres:\n- tomate\n6lettres:\n- maïs\n4lettres:\n- courgette`       //mauvais ordre
        ].forEach(function (answer) {
        it('should return ko', function () {
          const result = service.match(answer, solution);
          expect(result).to.equal('ko');
        });
      });


    });

    describe('when expected solutions are number', function () {

      const solution = `num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- 3`;

      it('should return ok when user gives the good answer ', function () {
        const answer = `num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- 3`;
        const result = service.match(answer, solution);
        expect(result).to.equal('ok');
      });

      [
        `num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- 5`,    //mauvaise reponse
        `num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- ''`,   //reponse vide
        `num1:\n- 4\nnum2:\n- 2\nnum3:\n- 1\nnum4:\n- '4'`,  //2 fois la meme reponse
        `num1:\n- 1\nnum2:\n- 2\nnum3:\n- 3\nnum4:\n- '4'`,  //mauvais ordre
        `num1:\n- '1'\nnum2:\n- '2'\nnum3:\n- '3'\nnum4:\n- '4'`,  //mauvais ordre et avec des strings
      ].forEach(function (answer){
        it('should return ko', function () {
          const result = service.match(answer, solution);
          expect(result).to.equal('ko');
        });
      });
    });
  });


});
