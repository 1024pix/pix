const { expect, domainBuilder } = require('../../../test-helper');
const PixEdu1erDegreBadgeAcquisitionOrderer = require('../../../../lib/domain/models/PixEdu1erDegreBadgeAcquisitionOrderer');

describe('Unit | Domain | Models | PixEdu1erDegreBadgeAcquisitionOrderer', function () {
  context('#getHighestBadge', function () {
    context('when there is no Pix+ Édu 1er degre badge acquisition', function () {
      it('should return undefined', function () {
        // given
        const badgesAcquisitions = [
          domainBuilder.buildBadgeAcquisition({ badge: domainBuilder.buildBadge({ key: 'NOT_PIX_EDU' }) }),
          domainBuilder.buildBadgeAcquisition({ badge: domainBuilder.buildBadge({ key: 'NOT_PIX_EDU' }) }),
        ];
        const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({ badgesAcquisitions });

        // when
        const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

        // then
        expect(highestBadge).to.be.undefined;
      });
    });

    context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
      it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
        // given
        const badgesAcquisitions = [
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert(),
        ];
        const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({ badgesAcquisitions });

        // when
        const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

        // then
        expect(highestBadge).to.deep.equal(
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreExpert()
        );
      });
    });

    context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT badge acquisition', function () {
      context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE badge acquisition', function () {
        it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE badge acquisition', function () {
          // given
          const badgesAcquisitions = [
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance(),
          ];
          const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({
            badgesAcquisitions,
          });

          // when
          const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

          // then
          expect(highestBadge).to.deep.equal(
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreAvance()
          );
        });
      });

      context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE badge acquisition', function () {
        context('when there is a PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME badge acquisition', function () {
          it('should return the PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME badge acquisition', function () {
            // given
            const badgesAcquisitions = [
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme(),
            ];
            const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({
              badgesAcquisitions,
            });

            // when
            const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

            // then
            expect(highestBadge).to.deep.equal(
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue1erDegreConfirme()
            );
          });
        });

        context('when there is no PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME badge acquisition', function () {
          context('when there is a PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME badge acquisition', function () {
            it('should return the PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_AVANCE badge acquisition', function () {
              // given
              const badgesAcquisitions = [
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme(),
              ];
              const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({
                badgesAcquisitions,
              });

              // when
              const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

              // then
              expect(highestBadge).to.deep.equal(
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreConfirme()
              );
            });
          });
          context('when there is no PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME badge acquisition', function () {
            context('when there is a PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE badge acquisition', function () {
              it('should return the PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE badge acquisition', function () {
                // given
                const badgesAcquisitions = [
                  domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie(),
                ];
                const pixEdu1erDegreBadgeAcquisitionOrderer = new PixEdu1erDegreBadgeAcquisitionOrderer({
                  badgesAcquisitions,
                });

                // when
                const highestBadge = pixEdu1erDegreBadgeAcquisitionOrderer.getHighestBadge();

                // then
                expect(highestBadge).to.deep.equal(
                  domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale1erDegreInitie()
                );
              });
            });
          });
        });
      });
    });
  });
});
