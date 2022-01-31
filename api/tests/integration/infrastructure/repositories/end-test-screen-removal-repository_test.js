const { expect, databaseBuilder } = require('../../../test-helper');
const {
  isEndTestScreenRemovalEnabledBySessionId,
  isEndTestScreenRemovalEnabledByCandidateId,
  isEndTestScreenRemovalEnabledByCertificationCenterId,
  isEndTestScreenRemovalEnabledForSomeCertificationCenter,
} = require('../../../../lib/infrastructure/repositories/end-test-screen-removal-repository');

describe('Integration | Repository | EndTestScreenRemovalRepository', function () {
  describe('#isEndTestScreenRemovalEnabledBySessionId', function () {
    context('the given session does not exist', function () {
      it('returns false', async function () {
        // given
        const sessionId = 0;

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
    context('the given session does exist', function () {
      context('when the certification center has not the supervisor access enabled', function () {
        it('returns false', async function () {
          // given
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
            isSupervisorAccessEnabled: false,
          }).id;
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId,
          }).id;
          await databaseBuilder.commit();

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.false;
        });
      });

      context('when the certification center has the supervisor access enabled', function () {
        it('returns true', async function () {
          // given
          const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
            isSupervisorAccessEnabled: true,
          }).id;
          const sessionId = databaseBuilder.factory.buildSession({
            certificationCenterId,
          }).id;
          await databaseBuilder.commit();

          // when
          const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledBySessionId(sessionId);

          // then
          expect(isEndTestScreenRemovalEnabled).to.be.true;
        });
      });
    });
  });

  describe('#isEndTestScreenRemovalEnabledByCandidatesId', function () {
    context('the given candidates does not exist', function () {
      it('returns false', async function () {
        // given
        const candidateId = 0;

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
  });

  context('the given candidate does exist', function () {
    context('when the certification center has not the supervisor access enabled', function () {
      it('returns false', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: false,
        }).id;
        const sessionId = databaseBuilder.factory.buildSession({
          certificationCenterId,
        }).id;
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;

        await databaseBuilder.commit();

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });

    context('when the certification center has the supervisor access enabled', function () {
      it('returns true', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: true,
        }).id;
        const sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        const candidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
        await databaseBuilder.commit();

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCandidateId(candidateId);

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });
  });

  describe('#isEndTestScreenRemovalEnabledByCertificationCenterId', function () {
    context('when the certification center has the supervisor access enabled', function () {
      it('returns true', async function () {
        //given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: true,
        }).id;
        await databaseBuilder.commit();

        //when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCertificationCenterId(
          certificationCenterId
        );

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });

    context('when the certification center has not the supervisor access enabled', function () {
      it('returns false', async function () {
        //given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: false,
        }).id;
        await databaseBuilder.commit();

        //when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledByCertificationCenterId(
          certificationCenterId
        );

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
  });

  describe('#isEndTestScreenRemovalEnabledForSomeCertificationCenter', function () {
    context('when all the certification center are enabled', function () {
      it('returns true', async function () {
        //given
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: true,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: true,
        }).id;
        await databaseBuilder.commit();

        //when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });

    context('when some certification center are enabled', function () {
      it('returns true', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: true,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.true;
      });
    });

    context('when no certification center is enabled', function () {
      it('returns false', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: false,
        }).id;
        databaseBuilder.factory.buildCertificationCenter({
          isSupervisorAccessEnabled: false,
        }).id;
        await databaseBuilder.commit();

        // when
        const isEndTestScreenRemovalEnabled = await isEndTestScreenRemovalEnabledForSomeCertificationCenter();

        // then
        expect(isEndTestScreenRemovalEnabled).to.be.false;
      });
    });
  });
});
