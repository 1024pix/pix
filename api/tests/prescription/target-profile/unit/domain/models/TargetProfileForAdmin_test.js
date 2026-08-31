import { expect } from 'chai';

import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Domain | Models | TargetProfileForAdmin', function () {
  describe('#update', function () {
    context('when has a linked campaign and has tubes to update', function () {
      it('should throw an error', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });

        // when
        const error = await catchErr(
          targetProfileForAdmin.update,
          targetProfileForAdmin,
        )({
          tubes: [Symbol('tube')],
        });

        // then
        expect(error).to.be.an.instanceof(DomainError);
      });
    });

    context('when removing a tube with a badge linked to it', function () {
      it('should throw an error', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
          badges: [
            domainBuilder.buildBadgeDetails({
              criteria: [
                domainBuilder.buildBadgeCriterion({
                  cappedTubes: [{ tubeId: 'tube1', name: '@tube1', level: 3 }],
                }),
                domainBuilder.buildBadgeCriterion({
                  cappedTubes: [{ tubeId: 'tube3', name: '@tube3', level: 3 }],
                }),
              ],
            }),
          ],
          tubesWithLevelThematicMobileAndTablet: [
            domainBuilder.buildTube({
              id: 'tube1',
              thematicId: 'recThematic',
              level: 3,
            }),
            domainBuilder.buildTube({
              id: 'tube2',
              thematicId: 'recThematic',
              level: 2,
            }),
            domainBuilder.buildTube({
              id: 'tube3',
              thematicId: 'recThematic',
              level: 3,
            }),
          ],
        });

        // when
        const error = await catchErr(
          targetProfileForAdmin.update,
          targetProfileForAdmin,
        )({
          category: 'OTHER',
          tubes: [{ id: 'tube2', level: 2 }],
        });

        // then
        expect(error).to.be.an.instanceof(DomainError);
        expect(error.message).to.equal(
          'Un badge est associé à ce profil cible pour le(s) sujet(s): @tube1 (niveau 3), @tube3 (niveau 3)',
        );
      });
    });

    context('when lowering a tube level', function () {
      context('when tubes level is below the badge level', function () {
        it('should throw an error', async function () {
          // given
          const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
            badges: [
              domainBuilder.buildBadgeDetails({
                criteria: [
                  domainBuilder.buildBadgeCriterion({
                    cappedTubes: [{ tubeId: 'tube1', name: '@tube1', level: 3 }],
                  }),
                  domainBuilder.buildBadgeCriterion({
                    cappedTubes: [{ tubeId: 'tube3', name: '@tube3', level: 3 }],
                  }),
                ],
              }),
            ],
            tubesWithLevelThematicMobileAndTablet: [
              domainBuilder.buildTube({
                id: 'tube1',
                thematicId: 'recThematic',
                level: 3,
              }),
              domainBuilder.buildTube({
                id: 'tube2',
                thematicId: 'recThematic',
                level: 2,
              }),
              domainBuilder.buildTube({
                id: 'tube3',
                thematicId: 'recThematic',
                level: 3,
              }),
            ],
          });

          // when
          const error = await catchErr(
            targetProfileForAdmin.update,
            targetProfileForAdmin,
          )({
            category: 'OTHER',
            tubes: [
              { id: 'tube1', level: 2 },
              { id: 'tube2', level: 2 },
              { id: 'tube3', level: 3 },
            ],
          });

          // then
          expect(error).to.be.an.instanceof(DomainError);
          expect(error.message).to.equal(
            'Un badge est associé à ce profil cible pour le(s) sujet(s): @tube1 (niveau 3)',
          );
        });
      });

      context('when tubes level is above or equal to the badge level', function () {
        it('should update the target profile', async function () {
          // given
          const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
            badges: [
              domainBuilder.buildBadgeDetails({
                criteria: [
                  domainBuilder.buildBadgeCriterion({
                    cappedTubes: [
                      { tubeId: 'tube1', level: 2 },
                      { tubeId: 'tube3', level: 2 },
                    ],
                  }),
                ],
              }),
            ],
            tubesWithLevelThematicMobileAndTablet: [
              domainBuilder.buildTube({
                id: 'tube1',
                thematicId: 'recThematic',
                level: 3,
              }),
              domainBuilder.buildTube({
                id: 'tube2',
                thematicId: 'recThematic',
                level: 2,
              }),
              domainBuilder.buildTube({
                id: 'tube3',
                thematicId: 'recThematic',
                level: 3,
              }),
            ],
          });

          // when
          targetProfileForAdmin.update({
            category: 'OTHER',
            tubes: [
              { id: 'tube1', level: 2 },
              { id: 'tube3', level: 3 },
            ],
          });

          // then
          expect(targetProfileForAdmin.tubes).to.deep.equal([
            { id: 'tube1', level: 2 },
            { id: 'tube3', level: 3 },
          ]);
        });
      });
    });

    context('when the new category is not valid', function () {
      it('should throw an error', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ category: 'NOT VALID' });

        // when
        const error = await catchErr(
          targetProfileForAdmin.update,
          targetProfileForAdmin,
        )({
          tubes: [Symbol('tube')],
        });

        // then
        expect(error).to.be.an.instanceof(DomainError);
      });
    });

    context('happy path', function () {
      it('it should update the model', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
          areKnowledgeElementsResettable: false,
          category: 'CUSTOM',
          comment: '',
          description: '',
          imageUrl: 'old url',
          name: 'old name',
          tubes: [],
        });

        // when
        targetProfileForAdmin.update({
          areKnowledgeElementsResettable: true,
          category: 'OTHER',
          comment: 'new comment',
          description: 'new description',
          imageUrl: 'new url',
          name: 'new name',
          tubes: ['tube'],
        });

        // then
        expect(targetProfileForAdmin.areKnowledgeElementsResettable).to.be.true;
        expect(targetProfileForAdmin.category).to.equal('OTHER');
        expect(targetProfileForAdmin.comment).to.equal('new comment');
        expect(targetProfileForAdmin.description).to.equal('new description');
        expect(targetProfileForAdmin.imageUrl).to.equal('new url');
        expect(targetProfileForAdmin.name).to.equal('new name');
        expect(targetProfileForAdmin.tubes).to.deep.equal(['tube']);
      });
    });
  });
});
