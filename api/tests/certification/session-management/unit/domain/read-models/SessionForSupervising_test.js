import { expect } from 'chai';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session-management | Unit | Domain | Read-models | SessionForSupervising', function () {
  describe('CandidateForSupervising', function () {
    describe('#get authorizedToStart', function () {
      it('returns true when candidate has been authorized to start within the last 15 minutes', function () {
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            authorizedToStartAt: new Date(),
          })
          .build();

        expect(sessionForSupervising.candidates[0].authorizedToStart).to.be.true;
      });

      it('returns false when candidate is not authorized to start', function () {
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            authorizedToStartAt: null,
          })
          .build();

        expect(sessionForSupervising.candidates[0].authorizedToStart).to.be.false;
      });

      it('returns false when candidate was authorized beyond 15 minutes ago', function () {
        const authorizedToStartAt = new Date();
        authorizedToStartAt.setMinutes(authorizedToStartAt.getMinutes() - 16);
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            authorizedToStartAt,
          })
          .build();

        expect(sessionForSupervising.candidates[0].authorizedToStart).to.be.false;
      });
    });

    describe('#get hasExceededCertificationDuration', function () {
      it('returns false when candidate has no started certification', function () {
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            startDateTime: null,
          })
          .build();

        expect(sessionForSupervising.candidates[0].hasExceededCertificationDuration).to.be.false;
      });

      it('returns false when candidate has a started certification that is still below 24 hours long', function () {
        const startDateTime = new Date();
        startDateTime.setHours(startDateTime.getHours() - 23);
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            startDateTime,
          })
          .build();

        expect(sessionForSupervising.candidates[0].hasExceededCertificationDuration).to.be.false;
      });

      it('returns true when candidate has a started certification that is beyond 24 hours long', function () {
        const startDateTime = new Date();
        startDateTime.setHours(startDateTime.getHours() - 25);
        const sessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .addCandidate({
            startDateTime,
          })
          .build();

        expect(sessionForSupervising.candidates[0].hasExceededCertificationDuration).to.be.true;
      });
    });
  });

  describe('#get hasExpired', function () {
    it('returns false when session has no started certification', function () {
      const sessionForSupervising = domainBuilder.certification.sessionManagement
        .sessionForSupervisingBuilder()
        .addCandidate({
          startDateTime: null,
        })
        .build();

      expect(sessionForSupervising.hasExpired).to.be.false;
    });

    it('returns false when session has a started certification since below 24 hours', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 23);
      const sessionForSupervising = domainBuilder.certification.sessionManagement
        .sessionForSupervisingBuilder()
        .addCandidate({
          startDateTime,
        })
        .build();

      expect(sessionForSupervising.hasExpired).to.be.false;
    });

    it('returns true when session has a started certification for more than 24 hours', function () {
      const startDateTime = new Date();
      startDateTime.setHours(startDateTime.getHours() - 25);
      const sessionForSupervising = domainBuilder.certification.sessionManagement
        .sessionForSupervisingBuilder()
        .addCandidate({
          startDateTime,
        })
        .build();

      expect(sessionForSupervising.hasExpired).to.be.true;
    });
  });
});
