const { expect, databaseBuilder, sinon } = require('../../../test-helper');
const {
  isEndTestScreenRemovalEnabledBySessionId,
  isEndTestScreenRemovalEnabledByCandidateId,
  isEndTestScreenRemovalEnabledByCertificationCenterId,
  isEndTestScreenRemovalEnabledForSomeCertificationCenter,
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
  describe('#isEndTestScreenRemovalEnabledByCandidatesId', function () {
    context('isEndTestScreenRemovalEnabledCertificationCenterIds is empty', function () {
      context('the given candidates does not exist', function () {
        it('returns false if feature toggle end screen certification center ids is empty', async function () {
          // given
          const candidateId = 0;
          sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.false;
        });
      });
      context('the given candidate does exist', function () {
        it('returns false', async function () {
          // given
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
          const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
          const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
          await databaseBuilder.commit();
          sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.false;
        });
      });
    });

    context('allowedCertificationCenterIdsForEndTestScreenRemoval is not empty', function () {
      context(
        'the feature is not enabled for the certification center associated with the given candidate id',
        function () {
          it('returns false', async function () {
            // given
            const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
            const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
            const sessionId = databaseBuilder.factory.buildSession({
              certificationCenterId: otherCertificationCenterId,
            }).id;
            const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;

            await databaseBuilder.commit();
            sinon
              .stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval')
              .value([certificationCenterId]);

            // when
            const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

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
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        await databaseBuilder.commit();
        sinon
          .stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval')
          .value([certificationCenterId]);

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });
  });

  describe('#isEndTestScreenRemovalEnabledByCertificationCenterId', function () {
    context('when allowedCertificationCenterIdsForEndTestScreenRemoval contains the given id', function () {
      it('returns true', function () {
        //given
        sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([9, 99, 999]);

        //when
        const isEndTestScreenRemovalEnabled = isEndTestScreenRemovalEnabledByCertificationCenterId(99);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });

    context('when allowedCertificationCenterIdsForEndTestScreenRemoval does not contains the given id', function () {
      it('returns true', function () {
        //given
        sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

        //when
        const isEndTestScreenRemovalEnabled = isEndTestScreenRemovalEnabledByCertificationCenterId(99);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
  });

  describe('#isEndTestScreenRemovalEnabledForSomeCertificationCenter', function () {
    context('when allowedCertificationCenterIdsForEndTestScreenRemoval is not empty', function () {
      it('returns true', function () {
        //given
        sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([9, 99, 999]);

        //when
        const isEndTestScreenRemovalEnabled = isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });

    context('when allowedCertificationCenterIdsForEndTestScreenRemoval is empty', function () {
      it('returns false', function () {
        // given
        sinon.stub(featureToggles, 'allowedCertificationCenterIdsForEndTestScreenRemoval').value([]);

        // when
        const isEndTestScreenRemovalEnabled = isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
  });
});
