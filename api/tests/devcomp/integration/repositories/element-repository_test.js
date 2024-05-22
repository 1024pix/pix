import { QCUForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import * as elementRepository from '../../../../src/devcomp/infrastructure/repositories/element-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect } from '../../../test-helper.js';

describe('Integration | DevComp | Repositories | ElementRepository', function () {
  describe('#getByIdForAnswerVerification', function () {
    it('should return the element', async function () {
      // given
      const moduleId = 'didacticiel-modulix';
      const elementId = '71de6394-ff88-4de3-8834-a40057a50ff4';
      const element = new QCUForAnswerVerification({
        id: elementId,
        type: 'qcu',
        instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
        proposals: [
          {
            id: '1',
            content: 'Vrai',
          },
          {
            id: '2',
            content: 'Faux',
          },
        ],
        feedbacks: {
          valid: '<p>Correct&#8239;! Ces 16 compétences sont rangées dans 5 domaines.</p>',
          invalid: '<p>Incorrect. Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
        },
        solution: '1',
      });

      // when
      const foundElement = await elementRepository.getByIdForAnswerVerification({
        moduleId,
        elementId,
        moduleDatasource,
      });

      // then
      expect(foundElement).to.be.instanceof(QCUForAnswerVerification);
      expect(foundElement).to.deep.equal(element);
    });

    describe('errors', function () {
      describe('when module id is not found', function () {
        it('should throw a NotFoundError', async function () {
          // given
          const nonExistingModuleId = 'dresser-des-pokemons';
          const elementId = '67b68f2a-349d-4df7-90a5-c9f5dc930a1a';

          // when
          const error = await catchErr(elementRepository.getByIdForAnswerVerification)({
            moduleId: nonExistingModuleId,
            elementId,
            moduleDatasource,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
        });
      });

      describe('when element id is not found', function () {
        it('should throw a NotFoundError', async function () {
          // given
          const moduleId = 'adresse-ip-publique-et-vous';
          const nonExistingElementId = '12';

          // when
          const error = await catchErr(elementRepository.getByIdForAnswerVerification)({
            moduleId,
            elementId: nonExistingElementId,
            moduleDatasource,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
        });
      });
    });
  });
});
