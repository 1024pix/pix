import { databaseBuilder, expect, domainBuilder } from '../../../../../../tests/test-helper.js';
import * as certificationCandidateRepository from '../../../../infrastructure/repositories/certification-candidate-repository.js';

describe('Integration | Repository | CertificationCandidate', function () {
  describe('#findBySessionIdAndPersonalInfo', function () {
    let sessionId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given info in the session', function () {
      it('should fetch the candidate ignoring case', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          organizationLearnerId: null,
          complementaryCertification: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const personalInfoAndId = {
          lastName: 'Bideau',
          firstName: 'CHARLIE',
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(
          personalInfoAndId
        );

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });

      it('should fetch the candidate ignoring special characters, non canonical characters and zero-width spaces', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          organizationLearnerId: null,
          complementaryCertification: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const zeroWidthSpaceChar = '​';
        const personalInfoAndId = {
          lastName: 'Bïdéà u',
          firstName: `c' ha-rli${zeroWidthSpaceChar}e`,
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(
          personalInfoAndId
        );

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });
    });

    context('when there is no certification candidates with the given info in the session', function () {
      let onlyCandidateInBDD;
      let notMatchingCandidateInfo;

      beforeEach(function () {
        onlyCandidateInBDD = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };
        databaseBuilder.factory.buildCertificationCandidate(onlyCandidateInBDD);

        notMatchingCandidateInfo = {
          lastName: 'Jean',
          firstName: 'Michel',
          birthdate: '2018-01-01',
          sessionId,
        };

        return databaseBuilder.commit();
      });

      it('should not find any candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(
          notMatchingCandidateInfo
        );

        // then
        expect(actualCandidates).to.be.empty;
      });
    });

    context('when there are more than one certification candidate with the given info in the session', function () {
      it('should find two candidates', async function () {
        //given
        const commonCandidateInfo = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };

        databaseBuilder.factory.buildOrganizationLearner({ id: 666 });
        databaseBuilder.factory.buildOrganizationLearner({ id: 777 });

        const certificationCandidates1 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 777,
        });
        const certificationCandidates2 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 666,
        });

        await databaseBuilder.commit();

        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionIdAndPersonalInfo(
          commonCandidateInfo
        );

        // then
        expect(actualCandidates).to.have.lengthOf(2);
        expect(actualCandidates[0].lastName).to.equal(commonCandidateInfo.lastName);
        expect(actualCandidates[1].lastName).to.equal(commonCandidateInfo.lastName);
        expect([actualCandidates[0].organizationLearnerId, actualCandidates[1].organizationLearnerId]).to.have.members([
          certificationCandidates1.organizationLearnerId,
          certificationCandidates2.organizationLearnerId,
        ]);
        expect(actualCandidates[0].id).to.not.equal(actualCandidates[1].id);
      });
    });
  });
});
