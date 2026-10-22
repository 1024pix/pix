import { expect } from 'chai';

import {
  SESSION_STATUSES,
  SessionStatus,
} from '../../../../../../src/certification/shared/domain/value-objects/SessionStatus.ts';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
describe('Certification | SessionManagement | Unit | Domain | ValueObjects | SessionStatus', function () {
  describe('#constructor', function () {
    Object.values(SESSION_STATUSES).forEach((validSessionStatus) => {
      it(`builds successfully a SessionStatus with status ${validSessionStatus}`, function () {
        expect(() => new SessionStatus({ status: validSessionStatus })).not.to.throw();
      });
    });

    it('throws when illegal value for status is given', function () {
      expect(() => new SessionStatus({ status: 'CACALOL' })).to.throw();
    });
  });

  describe('#isAtMostStarted', function () {
    [SESSION_STATUSES.CREATED, SESSION_STATUSES.STARTED].forEach((status) => {
      it(`returns true when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isAtMostStarted();

        // then
        expect(result).to.be.true;
      });
    });

    [
      SESSION_STATUSES.TO_FINALIZE,
      SESSION_STATUSES.FINALIZED,
      SESSION_STATUSES.IN_PROCESS,
      SESSION_STATUSES.PROCESSED,
    ].forEach((status) => {
      it(`returns false when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isAtMostStarted();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isAtMostInProcess', function () {
    [
      SESSION_STATUSES.CREATED,
      SESSION_STATUSES.STARTED,
      SESSION_STATUSES.TO_FINALIZE,
      SESSION_STATUSES.FINALIZED,
      SESSION_STATUSES.IN_PROCESS,
    ].forEach((status) => {
      it(`returns true when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isAtMostInProcess();

        // then
        expect(result).to.be.true;
      });
    });

    [SESSION_STATUSES.PROCESSED].forEach((status) => {
      it(`returns false when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isAtMostInProcess();

        // then
        expect(result).to.be.false;
      });
    });
  });

  describe('#isCreated', function () {
    it('returns true when status is created', function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().created().build();

      // when
      const result = sessionStatus.isCreated();

      // then
      expect(result).to.equal(true);
    });

    [
      SESSION_STATUSES.STARTED,
      SESSION_STATUSES.TO_FINALIZE,
      SESSION_STATUSES.FINALIZED,
      SESSION_STATUSES.IN_PROCESS,
      SESSION_STATUSES.PROCESSED,
    ].forEach((status) => {
      it(`returns false when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isCreated();

        // then
        expect(result).to.equal(false);
      });
    });
  });

  describe('#isToFinalize', function () {
    it('returns true when status is to_finalize', function () {
      // given
      const sessionStatus = domainBuilder.certification.shared.sessionStatusBuilder().toFinalize().build();

      // when
      const result = sessionStatus.isToFinalize();

      // then
      expect(result).to.equal(true);
    });

    [
      SESSION_STATUSES.CREATED,
      SESSION_STATUSES.STARTED,
      SESSION_STATUSES.FINALIZED,
      SESSION_STATUSES.IN_PROCESS,
      SESSION_STATUSES.PROCESSED,
    ].forEach((status) => {
      it(`returns false when status is ${status}`, function () {
        // given
        const sessionStatus = domainBuilder.certification.shared
          .sessionStatusBuilder()
          .withParameters({ status })
          .build();

        // when
        const result = sessionStatus.isToFinalize();

        // then
        expect(result).to.equal(false);
      });
    });
  });

  describe('#build', function () {
    it('should build `created` session status', function () {
      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: null,
        publishedAt: null,
        assignedCertificationOfficerId: null,
        firstCertificationStartedAt: null,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.CREATED);
    });

    it('should build `started` session status', function () {
      // given
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 23);

      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: null,
        publishedAt: null,
        assignedCertificationOfficerId: null,
        firstCertificationStartedAt: startDateTime,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.STARTED);
    });

    it('should build `to finalize` session status when session has expired', function () {
      // given
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 25);

      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: null,
        publishedAt: null,
        assignedCertificationOfficerId: null,
        firstCertificationStartedAt: startDateTime,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.TO_FINALIZE);
    });

    it('should build `finalized` session status', function () {
      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: new Date(),
        publishedAt: null,
        assignedCertificationOfficerId: null,
        firstCertificationStartedAt: null,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.FINALIZED);
    });

    it('should build `in process` session status', function () {
      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: null,
        publishedAt: null,
        assignedCertificationOfficerId: 1,
        firstCertificationStartedAt: null,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.IN_PROCESS);
    });

    it('should build `published` session status', function () {
      // when
      const sessionStatus = SessionStatus.build({
        finalizedAt: null,
        publishedAt: new Date(),
        assignedCertificationOfficerId: null,
        firstCertificationStartedAt: null,
      });

      // then
      expect(sessionStatus.status).to.equal(SESSION_STATUSES.PROCESSED);
    });
  });
});
