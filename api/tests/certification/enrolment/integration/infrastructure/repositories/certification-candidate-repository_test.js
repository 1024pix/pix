import * as certificationCandidateRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-candidate-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Shared | Integration | Repository | CertificationCandidate', function () {
  let sessionId;

  beforeEach(async function () {
    sessionId = databaseBuilder.factory.buildSession().id;

    await databaseBuilder.commit();
  });

  describe('#findBySessionId', function () {
    beforeEach(async function () {
      // given
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      [
        { lastName: 'Rine', firstName: 'Lena', sessionId },
        { lastName: 'Pafromage', firstName: 'Lara', sessionId },
        { lastName: 'Mate', firstName: 'Otto', sessionId },
        { lastName: 'Attrak', firstName: 'Pat', sessionId: anotherSessionId },
        {
          lastName: 'Registre',
          firstName: 'Jean',
          sessionId: anotherSessionId,
        },
        { lastName: 'Damant', firstName: 'Evy', sessionId },
      ].forEach((candidate) => {
        const aCandidate = databaseBuilder.factory.buildCertificationCandidate(candidate);
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: aCandidate.id,
        });
      });

      await databaseBuilder.commit();
    });

    context('when there are some certification candidates with the given session id', function () {
      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('Evy');
        expect(actualCandidates[1].firstName).to.equal('Otto');
        expect(actualCandidates[2].firstName).to.equal('Lara');
        expect(actualCandidates[3].firstName).to.equal('Lena');
        expect(actualCandidates).to.have.lengthOf(4);
      });
    });

    context('when there is no certification candidates with the given session ID', function () {
      it('should return an empty array', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });
    });
  });

  describe('#update', function () {
    describe('when certification candidate exists', function () {
      it('should update authorizedToStart certification candidate attribute', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        databaseBuilder.factory.buildUser({ id: 1234 });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: true,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: certificationCandidate.id,
        });
        await databaseBuilder.commit();

        // when
        await certificationCandidateRepository.update(
          domainBuilder.buildCertificationCandidate({
            id: certificationCandidate.id,
            authorizedToStart: false,
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          }),
        );

        // then
        const updatedCertificationCandidate = await knex
          .select('authorizedToStart')
          .from('certification-candidates')
          .where({ id: certificationCandidate.id })
          .first();

        expect(updatedCertificationCandidate.authorizedToStart).to.be.false;
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        const candidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        databaseBuilder.factory.buildCoreSubscription({
          certificationCandidateId: candidate.id,
        });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const error = await catchErr(certificationCandidateRepository.update)(
          domainBuilder.buildCertificationCandidate({
            id: wrongCandidateId,
            authorizedToStart: false,
            subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
          }),
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
