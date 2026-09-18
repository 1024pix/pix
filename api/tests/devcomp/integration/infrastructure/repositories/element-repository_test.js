import { expect } from 'chai';
import sinon from 'sinon';

import { QCUForAnswerVerification } from '../../../../../src/devcomp/domain/models/element/QCU-for-answer-verification.js';
import { Module } from '../../../../../src/devcomp/domain/models/module/Module.js';
import * as elementRepository from '../../../../../src/devcomp/infrastructure/repositories/element-repository.js';
import { repositories } from '../../../../../src/devcomp/infrastructure/repositories/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';
import { waitFor } from '../../../../tooling/test-utils/wait.js';

describe('Integration | DevComp | Repositories | ElementRepository', function () {
  describe('#getByIdForAnswerVerification', function () {
    beforeEach(async function () {
      await featureToggles.set('isFetchingModulesFromLearningContentEnabled', false);
      await waitFor(() => featureToggles.use('isFetchingModulesFromLearningContentEnabled')?.value === false);
    });

    it('should return an element from a component element', async function () {
      // given
      const moduleId = '6282925d-4775-4bca-b513-4c3009ec5886';
      const elementId = '71de6394-ff88-4de3-8834-a40057a50ff4';
      const element = new QCUForAnswerVerification({
        id: elementId,
        instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
        proposals: [
          {
            id: '1',
            content: 'Vrai',
            feedback:
              '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
          },
          {
            id: '2',
            content: 'Faux',
            feedback:
              '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
          },
        ],
        solution: '1',
      });
      const moduleRepositoryStub = {
        getById: sinon.stub(),
      };
      moduleRepositoryStub.getById.withArgs({ id: moduleId }).resolves({
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: 'gbsri73s',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        sections: [
          {
            id: '748c71fe-acdb-4533-a550-6f2fbae90587',
            type: 'blank',
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
                          feedback:
                            '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                        },
                        {
                          id: '2',
                          content: 'Faux',
                          feedback:
                            '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
                        },
                      ],
                      solution: '1',
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      // when
      const foundElement = await elementRepository.getByIdForAnswerVerification({
        moduleId,
        elementId,
        moduleRepository: moduleRepositoryStub,
      });

      // then
      expect(foundElement).to.be.instanceof(QCUForAnswerVerification);
      expect(foundElement).to.deep.equal(element);
    });

    it('should return an element from a component stepper', async function () {
      // given
      const moduleId = 'bac-a-sable';
      const elementId = '71de6394-ff88-4de3-8834-a40057a50ff4';
      const element = new QCUForAnswerVerification({
        id: elementId,
        instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
        proposals: [
          {
            id: '1',
            content: 'Vrai',
            feedback:
              '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
          },
          {
            id: '2',
            content: 'Faux',
            feedback:
              '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
          },
        ],
        solution: '1',
      });
      const moduleRepositoryStub = {
        getById: sinon.stub(),
      };
      moduleRepositoryStub.getById.withArgs({ id: moduleId }).resolves({
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: 'gbsri73s',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        sections: [
          {
            id: '748c71fe-acdb-4533-a550-6f2fbae90587',
            type: 'blank',
            grains: [
              {
                id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                type: 'lesson',
                title: 'Voici une leçon',
                components: [
                  {
                    type: 'stepper',
                    steps: [
                      {
                        elements: [
                          {
                            id: '71de6394-ff88-4de3-8834-a40057a50ff4',
                            type: 'qcu',
                            instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
                            proposals: [
                              {
                                id: '1',
                                content: 'Vrai',
                                feedback:
                                  '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                              },
                              {
                                id: '2',
                                content: 'Faux',
                                feedback:
                                  '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
                              },
                            ],
                            solution: '1',
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: 'element',
                    element: {
                      id: '126939bd-a2ed-4a4b-ad44-f37e9d09440a',
                      type: 'qcu',
                      instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
                      proposals: [
                        {
                          id: '1',
                          content: 'Vrai',
                          feedback:
                            '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                        },
                        {
                          id: '2',
                          content: 'Faux',
                          feedback:
                            '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>️!</p>',
                        },
                      ],
                      solution: '1',
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      // when
      const foundElement = await elementRepository.getByIdForAnswerVerification({
        moduleId,
        elementId,
        moduleRepository: moduleRepositoryStub,
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
            moduleRepository: repositories.moduleRepository,
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
            moduleRepository: repositories.moduleRepository,
          });

          // then
          expect(error).to.be.instanceOf(NotFoundError);
        });
      });
    });

    describe('when the module is only available through the learning content database (not the static JSON files)', function () {
      beforeEach(async function () {
        await featureToggles.set('isFetchingModulesFromLearningContentEnabled', true);
        await waitFor(() => featureToggles.use('isFetchingModulesFromLearningContentEnabled')?.value === true);
      });

      it('should still find the element by reading the module through the module repository', async function () {
        // given
        const moduleId = '2f6b6b0a-df0a-4dc6-9b8d-df6e6f9d6a10';
        const elementId = '9d2f6b0a-df0a-4dc6-9b8d-df6e6f9d6a11';
        databaseBuilder.factory.learningContent.buildModule({
          id: moduleId,
          sections: [
            {
              id: '748c71fe-acdb-4533-a550-6f2fbae90587',
              type: 'blank',
              grains: [
                {
                  id: 'f312c33d-e7c9-4a69-9ba0-913957b8f7dd',
                  type: 'lesson',
                  title: 'Voici une leçon',
                  components: [
                    {
                      type: 'element',
                      element: {
                        id: elementId,
                        type: 'qcu',
                        instruction: '<p>Une question</p>',
                        proposals: [
                          { id: '1', content: 'Vrai', feedback: 'Bien joué' },
                          { id: '2', content: 'Faux', feedback: 'Dommage' },
                        ],
                        solution: '1',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
        await databaseBuilder.commit();

        // when
        const foundElement = await elementRepository.getByIdForAnswerVerification({
          moduleId,
          elementId,
          moduleRepository: repositories.moduleRepository,
        });

        // then
        expect(foundElement).to.be.instanceof(QCUForAnswerVerification);
        expect(foundElement.id).to.equal(elementId);
      });
    });
  });

  describe('#flattenModuleElements', function () {
    it('should return a flat array of elements from a module', function () {
      // given
      const moduleData = {
        id: '6282925d-4775-4bca-b513-4c3009ec5886',
        shortId: 'gbsri73s',
        slug: 'bac-a-sable',
        title: 'Bac à sable',
        isBeta: true,
        visibility: 'public',
        details: {
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          description: 'Découvrez avec ce didacticiel comment fonctionne Modulix !',
          duration: 5,
          level: 'novice',
          tabletSupport: 'comfortable',
          objectives: ['Naviguer dans Modulix', 'Découvrir les leçons et les activités'],
        },
        sections: [
          {
            id: '748c71fe-acdb-4533-a550-6f2fbae90587',
            type: 'blank',
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
                          feedback:
                            '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
                        },
                        {
                          id: '2',
                          content: 'Faux',
                          feedback:
                            '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
                        },
                      ],
                      solution: '1',
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      // when
      expect(elementRepository.flattenModuleElements(new Module(moduleData))).to.deep.equal([
        {
          id: '71de6394-ff88-4de3-8834-a40057a50ff4',
          type: 'qcu',
          instruction: '<p>Pix évalue 16 compétences numériques différentes.</p>',
          proposals: [
            {
              id: '1',
              content: 'Vrai',
              feedback:
                '<span class="feedback__state">Correct&#8239;!</span><p> Ces 16 compétences sont rangées dans 5 domaines.</p>',
            },
            {
              id: '2',
              content: 'Faux',
              feedback:
                '<span class="feedback__state">Incorrect.</span><p> Retourner voir la vidéo si besoin&nbsp;<span aria-hidden="true">👆</span>!</p>',
            },
          ],
          solution: '1',
        },
      ]);
    });
  });
});
