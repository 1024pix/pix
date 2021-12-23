const { expect, databaseBuilder, sinon } = require('../../../test-helper');
const {
  isEndTestScreenRemovalEnabledBySessionId,
} = require('../../../../lib/infrastructure/repositories/end-test-screen-removal-repository');
const { featureToggles } = require('../../../../lib/config');

describe('Integration | Repository | EndTestScreenRemovalRepository', function () {
  describe('#isEndTestScreenRemovalEnabledBySessionId', function () {
    context('allowedCertificationCenterIdsForEndTestScreenRemoval is empty', function () {
      context('the given session does not exist', function () {
        it('returns false if feature toggle end screen certification center ids is empty', async function () {
          // given
          const sessionId = 0;
          sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.false;
        });
      });
      context('the given session does exist', function () {
        it('returns false', async function () {
          // given
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
          const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
          await databaseBuilder.commit();
          sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.false;
        });
      });
    });

    context('allowedCertificationCenterIdsForEndTestScreenRemoval is not empty', function () {
      context(
        'the feature is not enabled for the certification center associated with the given session id',
        function () {
          it('returns false', async function () {
            // given
            const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
            const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
            const sessionId = databaseBuilder.factory.buildSession({
              certificationCenterId: otherCertificationCenterId,
            }).id;
            await databaseBuilder.commit();
            sinon
              .stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval')
              .value([certificationCenterId]);

            // when
            const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

            // then
            expect(isEndTestScreenRemovalEnabled).to.be.false;
          });
        }
      );
    });

    context('the feature is enabled for the certification center associated with the given session id', function () {
      it('returns true if allowedCertificationCenterIdsForEndTestScreenRemoval contains the id associated with given session id', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        await databaseBuilder.commit();
        sinon
          .stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval')
          .value([certificationCenterId]);

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });
  });
});
