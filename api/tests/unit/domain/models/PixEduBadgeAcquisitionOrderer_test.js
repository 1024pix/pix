const { expect, domainBuilder } = require('../../../test-helper');
const PixEduBadgeAcquisitionOrderer = require('../../../../lib/domain/models/PixEduBadgeAcquisitionOrderer');

describe('Unit | Domain | Models | PixEduBadgeAcquisitionOrderer', function () {
  context('#getHighestBadge', function () {
    context('when there is no Pix+ Édu badge acquisition', function () {
      it('should return undefined', function () {
        // given
        const badgesAcquisitions = [
          domainBuilder.buildBadgeAcquisition({ badge: domainBuilder.buildBadge({ key: 'NOT_PIX_EDU' }) }),
          domainBuilder.buildBadgeAcquisition({ badge: domainBuilder.buildBadge({ key: 'NOT_PIX_EDU' }) }),
        ];
        const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

        // when
        const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

        // then
        expect(highestBadge).to.be.undefined;
      });
    });

    context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
      it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
        // given
        const badgesAcquisitions = [
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreInitie(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreMaitre(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert(),
        ];
        const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

        // when
        const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

        // then
        expect(highestBadge).to.deep.equal(
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert()
        );
      });
    });

    context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
      context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE badge acquisition', function () {
        it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
          // given
          const badgesAcquisitions = [
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreInitie(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreMaitre(),
          ];
          const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

          // when
          const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

          // then
          expect(highestBadge).to.deep.equal(
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreMaitre()
          );
        });
      });

      context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_MAITRE badge acquisition', function () {
        context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE badge acquisition', function () {
          it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE badge acquisition', function () {
            // given
            const badgesAcquisitions = [
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreInitie(),
            ];
            const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

            // when
            const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

            // then
            expect(highestBadge).to.deep.equal(
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreInitie()
            );
          });
        });

        context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_INITIE badge acquisition', function () {
          context('when there is a PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE badge acquisition', function () {
            it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
              // given
              const badgesAcquisitions = [
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier(),
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
              ];
              const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

              // when
              const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

              // then
              expect(highestBadge).to.deep.equal(
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie()
              );
            });
          });
          context('when there is no PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE badge acquisition', function () {
            context(
              'when there is a PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER badge acquisition',
              function () {
                it('should return the PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_ENTREE_METIER badge acquisition', function () {
                  // given
                  const badgesAcquisitions = [
                    domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier(),
                  ];
                  const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

                  // when
                  const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

                  // then
                  expect(highestBadge).to.deep.equal(
                    domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreEntreeMetier()
                  );
                });
              }
            );
          });
        });
      });
    });
  });
});
