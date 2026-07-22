import sinon from 'sinon';

import * as eventAdapter from '../../../../../../src/certification/enrolment/infrastructure/adapters/event-adapter.js';
import { EVENT_NAMES } from '../../../../../../src/certification/shared/domain/constants/event-names.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Adapter | event', function () {
  let eventApi, candidateA, candidateB, dependencies;

  beforeEach(function () {
    eventApi = {
      pushEvents: sinon.stub(),
    };
    eventApi.pushEvents.resolves();
    candidateA = domainBuilder.certification.enrolment.buildCandidate({
      id: 123,
      firstName: 'firstName A',
      lastName: 'lastName A',
      birthCity: 'birthCity A',
      birthProvinceCode: 'birthProvinceCode A',
      birthCountry: 'birthCountry A',
      birthPostalCode: 'birthPostalCode A',
      birthINSEECode: 'birthINSEECode A',
      sex: 'sex A',
      email: 'email A',
      resultRecipientEmail: 'resultRecipientEmail A',
      externalId: 'externalId A',
      birthdate: 'birthdate A',
      extraTimePercentage: 1,
      createdAt: 'createdAt A',
      authorizedToStart: 'authorizedToStart A',
      sessionId: 'sessionId A',
      userId: 'userId A',
      organizationLearnerId: 'organizationLearnerId A',
      billingMode: 'billingMode A',
      prepaymentCode: 'prepaymentCode A',
      subscription: 'subscription A',
      accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded A',
      reconciledAt: 'reconciledAt A',
    });
    candidateB = domainBuilder.certification.enrolment.buildCandidate({
      id: 456,
      firstName: 'firstName B',
      lastName: 'lastName B',
      birthCity: 'birthCity B',
      birthProvinceCode: 'birthProvinceCode B',
      birthCountry: 'birthCountry B',
      birthPostalCode: 'birthPostalCode B',
      birthINSEECode: 'birthINSEECode B',
      sex: 'sex B',
      email: 'email B',
      resultRecipientEmail: 'resultRecipientEmail B',
      externalId: 'externalId B',
      birthdate: 'birthdate B',
      extraTimePercentage: 2,
      createdAt: 'createdAt B',
      authorizedToStart: 'authorizedToStart B',
      sessionId: 'sessionId B',
      userId: 'userId B',
      organizationLearnerId: 'organizationLearnerId B',
      billingMode: 'billingMode B',
      prepaymentCode: 'prepaymentCode B',
      subscription: 'subscription B',
      accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded B',
      reconciledAt: 'reconciledAt B',
    });
    dependencies = {
      eventApi,
    };
  });

  context('#onCandidateEnrolledIndividually', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidateEnrolledIndividually({ candidate: candidateA, dependencies });

      expect(eventApi.pushEvents).to.have.been.calledWithExactly([
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_INDIVIDUAL,
          candidateId: 123,
          createdAt: 'createdAt A',
          metadata: {
            id: 123,
            firstName: 'firstName A',
            lastName: 'lastName A',
            birthCity: 'birthCity A',
            birthProvinceCode: 'birthProvinceCode A',
            birthCountry: 'birthCountry A',
            birthPostalCode: 'birthPostalCode A',
            birthINSEECode: 'birthINSEECode A',
            sex: 'sex A',
            email: 'email A',
            resultRecipientEmail: 'resultRecipientEmail A',
            externalId: 'externalId A',
            birthdate: 'birthdate A',
            extraTimePercentage: 1,
            createdAt: 'createdAt A',
            authorizedToStart: 'authorizedToStart A',
            sessionId: 'sessionId A',
            userId: 'userId A',
            organizationLearnerId: 'organizationLearnerId A',
            billingMode: 'billingMode A',
            prepaymentCode: 'prepaymentCode A',
            subscription: 'subscription A',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded A',
            reconciledAt: 'reconciledAt A',
          },
        },
      ]);
    });
  });

  context('#onCandidatesEnrolledWithImportSheet', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidatesEnrolledWithImportSheet({ candidates: [candidateA, candidateB], dependencies });

      expect(eventApi.pushEvents).to.have.been.calledWithExactly([
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_ODS,
          candidateId: 123,
          createdAt: 'createdAt A',
          metadata: {
            id: 123,
            firstName: 'firstName A',
            lastName: 'lastName A',
            birthCity: 'birthCity A',
            birthProvinceCode: 'birthProvinceCode A',
            birthCountry: 'birthCountry A',
            birthPostalCode: 'birthPostalCode A',
            birthINSEECode: 'birthINSEECode A',
            sex: 'sex A',
            email: 'email A',
            resultRecipientEmail: 'resultRecipientEmail A',
            externalId: 'externalId A',
            birthdate: 'birthdate A',
            extraTimePercentage: 1,
            createdAt: 'createdAt A',
            authorizedToStart: 'authorizedToStart A',
            sessionId: 'sessionId A',
            userId: 'userId A',
            organizationLearnerId: 'organizationLearnerId A',
            billingMode: 'billingMode A',
            prepaymentCode: 'prepaymentCode A',
            subscription: 'subscription A',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded A',
            reconciledAt: 'reconciledAt A',
          },
        },
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_ODS,
          candidateId: 456,
          createdAt: 'createdAt B',
          metadata: {
            id: 456,
            firstName: 'firstName B',
            lastName: 'lastName B',
            birthCity: 'birthCity B',
            birthProvinceCode: 'birthProvinceCode B',
            birthCountry: 'birthCountry B',
            birthPostalCode: 'birthPostalCode B',
            birthINSEECode: 'birthINSEECode B',
            sex: 'sex B',
            email: 'email B',
            resultRecipientEmail: 'resultRecipientEmail B',
            externalId: 'externalId B',
            birthdate: 'birthdate B',
            extraTimePercentage: 2,
            createdAt: 'createdAt B',
            authorizedToStart: 'authorizedToStart B',
            sessionId: 'sessionId B',
            userId: 'userId B',
            organizationLearnerId: 'organizationLearnerId B',
            billingMode: 'billingMode B',
            prepaymentCode: 'prepaymentCode B',
            subscription: 'subscription B',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded B',
            reconciledAt: 'reconciledAt B',
          },
        },
      ]);
    });
  });

  context('#onCandidatesEnrolledWithMassSessionsImport', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidatesEnrolledWithMassSessionsImport({
        candidates: [candidateA, candidateB],
        dependencies,
      });

      expect(eventApi.pushEvents).to.have.been.calledWithExactly([
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_CSV,
          candidateId: 123,
          createdAt: 'createdAt A',
          metadata: {
            id: 123,
            firstName: 'firstName A',
            lastName: 'lastName A',
            birthCity: 'birthCity A',
            birthProvinceCode: 'birthProvinceCode A',
            birthCountry: 'birthCountry A',
            birthPostalCode: 'birthPostalCode A',
            birthINSEECode: 'birthINSEECode A',
            sex: 'sex A',
            email: 'email A',
            resultRecipientEmail: 'resultRecipientEmail A',
            externalId: 'externalId A',
            birthdate: 'birthdate A',
            extraTimePercentage: 1,
            createdAt: 'createdAt A',
            authorizedToStart: 'authorizedToStart A',
            sessionId: 'sessionId A',
            userId: 'userId A',
            organizationLearnerId: 'organizationLearnerId A',
            billingMode: 'billingMode A',
            prepaymentCode: 'prepaymentCode A',
            subscription: 'subscription A',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded A',
            reconciledAt: 'reconciledAt A',
          },
        },
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_CSV,
          candidateId: 456,
          createdAt: 'createdAt B',
          metadata: {
            id: 456,
            firstName: 'firstName B',
            lastName: 'lastName B',
            birthCity: 'birthCity B',
            birthProvinceCode: 'birthProvinceCode B',
            birthCountry: 'birthCountry B',
            birthPostalCode: 'birthPostalCode B',
            birthINSEECode: 'birthINSEECode B',
            sex: 'sex B',
            email: 'email B',
            resultRecipientEmail: 'resultRecipientEmail B',
            externalId: 'externalId B',
            birthdate: 'birthdate B',
            extraTimePercentage: 2,
            createdAt: 'createdAt B',
            authorizedToStart: 'authorizedToStart B',
            sessionId: 'sessionId B',
            userId: 'userId B',
            organizationLearnerId: 'organizationLearnerId B',
            billingMode: 'billingMode B',
            prepaymentCode: 'prepaymentCode B',
            subscription: 'subscription B',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded B',
            reconciledAt: 'reconciledAt B',
          },
        },
      ]);
    });
  });

  context('#onCandidatesEnrolledSco', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidatesEnrolledSco({ candidates: [candidateA, candidateB], dependencies });

      expect(eventApi.pushEvents).to.have.been.calledWithExactly([
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_SCO,
          candidateId: 123,
          createdAt: 'createdAt A',
          metadata: {
            id: 123,
            firstName: 'firstName A',
            lastName: 'lastName A',
            birthCity: 'birthCity A',
            birthProvinceCode: 'birthProvinceCode A',
            birthCountry: 'birthCountry A',
            birthPostalCode: 'birthPostalCode A',
            birthINSEECode: 'birthINSEECode A',
            sex: 'sex A',
            email: 'email A',
            resultRecipientEmail: 'resultRecipientEmail A',
            externalId: 'externalId A',
            birthdate: 'birthdate A',
            extraTimePercentage: 1,
            createdAt: 'createdAt A',
            authorizedToStart: 'authorizedToStart A',
            sessionId: 'sessionId A',
            userId: 'userId A',
            organizationLearnerId: 'organizationLearnerId A',
            billingMode: 'billingMode A',
            prepaymentCode: 'prepaymentCode A',
            subscription: 'subscription A',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded A',
            reconciledAt: 'reconciledAt A',
          },
        },
        {
          name: EVENT_NAMES.CANDIDATE_ENROLLED_SCO,
          candidateId: 456,
          createdAt: 'createdAt B',
          metadata: {
            id: 456,
            firstName: 'firstName B',
            lastName: 'lastName B',
            birthCity: 'birthCity B',
            birthProvinceCode: 'birthProvinceCode B',
            birthCountry: 'birthCountry B',
            birthPostalCode: 'birthPostalCode B',
            birthINSEECode: 'birthINSEECode B',
            sex: 'sex B',
            email: 'email B',
            resultRecipientEmail: 'resultRecipientEmail B',
            externalId: 'externalId B',
            birthdate: 'birthdate B',
            extraTimePercentage: 2,
            createdAt: 'createdAt B',
            authorizedToStart: 'authorizedToStart B',
            sessionId: 'sessionId B',
            userId: 'userId B',
            organizationLearnerId: 'organizationLearnerId B',
            billingMode: 'billingMode B',
            prepaymentCode: 'prepaymentCode B',
            subscription: 'subscription B',
            accessibilityAdjustmentNeeded: 'accessibilityAdjustmentNeeded B',
            reconciledAt: 'reconciledAt B',
          },
        },
      ]);
    });
  });

  context('#onCandidateReconciled', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidateReconciled({ candidate: candidateA, dependencies });

      expect(eventApi.pushEvents).to.have.been.calledWithExactly([
        {
          name: EVENT_NAMES.CANDIDATE_RECONCILED,
          candidateId: 123,
          createdAt: 'createdAt A',
          metadata: {
            reconciledAt: 'reconciledAt A',
            userId: 'userId A',
          },
        },
      ]);
    });
  });
});
