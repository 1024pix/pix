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
  });
});
