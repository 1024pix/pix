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

    context('when there is a PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR badge acquisition', function () {
      it('should return the PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR badge acquisition', function () {
        // given
        const badgesAcquisitions = [
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert(),
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreFormateur(),
        ];
        const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

        // when
        const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

        // then
        expect(highestBadge).to.deep.equal(
          domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreFormateur()
        );
      });
    });

    context('when there is no PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_FORMATEUR badge acquisition', function () {
      context('when there is a PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT badge acquisition', function () {
        it('should return the PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT badge acquisition', function () {
          // given
          const badgesAcquisitions = [
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance(),
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert(),
          ];
          const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

          // when
          const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

          // then
          expect(highestBadge).to.deep.equal(
            domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreExpert()
          );
        });
      });

      context('when there is no PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT badge acquisition', function () {
        context('when there is a PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE badge acquisition', function () {
          it('should return the PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE badge acquisition', function () {
            // given
            const badgesAcquisitions = [
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance(),
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance(),
            ];
            const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

            // when
            const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

            // then
            expect(highestBadge).to.deep.equal(
              domainBuilder.buildBadgeAcquisition.forPixEduFormationContinue2ndDegreAvance()
            );
          });
        });

        context('when there is no PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE badge acquisition', function () {
          context('when there is a PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE badge acquisition', function () {
            it('should return the PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_FORMATEUR badge acquisition', function () {
              // given
              const badgesAcquisitions = [
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome(),
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance(),
              ];
              const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

              // when
              const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

              // then
              expect(highestBadge).to.deep.equal(
                domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAvance()
              );
            });
          });
          context('when there is no PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_AVANCE badge acquisition', function () {
            context('when there is a PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE badge acquisition', function () {
              it('should return the PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE badge acquisition', function () {
                // given
                const badgesAcquisitions = [
                  domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome(),
                ];
                const pixEduBadgeAcquisitionOrderer = new PixEduBadgeAcquisitionOrderer({ badgesAcquisitions });

                // when
                const highestBadge = pixEduBadgeAcquisitionOrderer.getHighestBadge();

                // then
                expect(highestBadge).to.deep.equal(
                  domainBuilder.buildBadgeAcquisition.forPixEduFormationInitiale2ndDegreAutonome()
                );
              });
            });
          });
        });
      });
    });
  });
});
