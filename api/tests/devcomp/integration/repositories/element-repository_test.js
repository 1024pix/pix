import { QCUForAnswerVerification } from '../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import moduleDatasource from '../../../../src/devcomp/infrastructure/datasources/learning-content/module-datasource.js';
import * as elementRepository from '../../../../src/devcomp/infrastructure/repositories/element-repository.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

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
          valid:
            '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
          invalid:
            '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
        },
        solution: '1',
      });
      const moduleDatasourceStub = {
        getBySlug: sinon.stub(),
      };
      moduleDatasourceStub.getBySlug.withArgs(moduleId).resolves({
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        slug: 'didacticiel-modulix',
        title: 'Didacticiel Modulix',
        details: {
          image: 'https://images.pix.fr/modulix/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'Débutant',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        grains: [
          {
            id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
            type: 'lesson',
            title: 'Voici une leçon',
            components: [
              {
                type: 'element',
                element: {
                  id: '71de6394-ff88-4de3-8834-a40057a50ff4',
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
                    valid:
                      '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                    invalid:
                      '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
                  },
                  solution: '1',
                },
              },
            ],
          },
        ],
      });

      // when
      const foundElement = await elementRepository.getByIdForAnswerVerification({
        moduleId,
        elementId,
        moduleDatasource: moduleDatasourceStub,
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
