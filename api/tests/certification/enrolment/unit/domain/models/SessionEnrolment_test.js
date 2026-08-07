import { expect } from 'chai';
import sinon from 'sinon';

import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Certification | Enrolment | Domain | Models | SessionEnrolment', function () {
  context('#get isSco', function () {
    it('should return true when session is SCO', function () {
      // given
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          certificationCenterType: CERTIFICATION_CENTER_TYPES.SCO,
        })
        .build();

      // when
      const isSco = session.isSco;

      // then
      expect(isSco).to.be.true;
    });

    it('should return true when session is not SCO', function () {
      // given
      const proSession = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          certificationCenterType: CERTIFICATION_CENTER_TYPES.PRO,
        })
        .build();
      const supSession = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .createdBy({
          certificationCenterType: CERTIFICATION_CENTER_TYPES.SUP,
        })
        .build();

      expect(proSession.isSco).to.be.false;
      expect(supSession.isSco).to.be.false;
    });
  });

  context('#isSessionScheduledInThePast', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when session is scheduled in the past', function () {
      it('should return true', async function () {
        // given
        const session = domainBuilder.certification.enrolment
          .sessionEnrolmentBuilder()
          .withParameters({ date: '2022-01-01' })
          .build();

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.true;
      });
    });

    context('when session is not scheduled in the past', function () {
      it('should return false', async function () {
        // given
        const session = domainBuilder.certification.enrolment
          .sessionEnrolmentBuilder()
          .withParameters({ date: '2024-01-01' })
          .build();

        // when
        const isSessionScheduledInThePast = session.isSessionScheduledInThePast();

        // then
        expect(isSessionScheduledInThePast).to.be.false;
      });
    });
  });

  context('#isCandidateAlreadyEnrolled', function () {
    it('should return true when all personal info matches (case / diacritics insensitive) with an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'un prénom très proche de frederic',
            lastName: `un nom tres proche de debussy`,
            birthdate: '1990-01-04',
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub();
      normalizeStringFnc.withArgs('De bussy').returns('De bussy');
      normalizeStringFnc.withArgs('Frédéric').returns('Frédéric');
      normalizeStringFnc.withArgs('Related').returns('Related');
      normalizeStringFnc.withArgs('Un').returns('Un');
      normalizeStringFnc.withArgs(`un nom tres proche de debussy`).returns('De bussy');
      normalizeStringFnc.withArgs('un prénom très proche de frederic').returns('Frédéric');

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.true;
    });

    it('should return false when first name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Richard',
            lastName: candidatePersonalInfo.lastName,
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });

    it('should return false when last name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: 'Chopin',
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });

    it('should return false when birthdate is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: candidatePersonalInfo.lastName,
            birthdate: '1990-01-05',
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const isCandidateEnrolled = session.isCandidateAlreadyEnrolled({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(isCandidateEnrolled).to.be.false;
    });
  });

  context('#hasReconciledCandidateTo', function () {
    it('should return true when at least one candidate is reconciled to given user', function () {
      // given
      const candidateBuilderA = domainBuilder.certification.enrolment.candidateBuilder().asReconciled({
        userId: 456,
        reconciledAt: new Date('2024-09-25'),
      });
      const candidateBuilderB = domainBuilder.certification.enrolment.candidateBuilder().asReconciled({
        userId: 123,
        reconciledAt: new Date('2024-09-25'),
      });
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders([candidateBuilderA, candidateBuilderB])
        .build();

      // when
      const hasReconciledCandidateTo = session.hasReconciledCandidateTo({
        userId: 123,
      });

      // then
      expect(hasReconciledCandidateTo).to.be.true;
    });

    it('should return false when no candidate is reconciled to user', function () {
      // given
      const candidateBuilderA = domainBuilder.certification.enrolment.candidateBuilder().asReconciled({
        userId: 456,
        reconciledAt: new Date('2024-09-25'),
      });
      const candidateBuilderB = domainBuilder.certification.enrolment.candidateBuilder().asReconciled({
        userId: 123,
        reconciledAt: new Date('2024-09-25'),
      });
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders([candidateBuilderA, candidateBuilderB])
        .build();

      // when
      const hasReconciledCandidateTo = session.hasReconciledCandidateTo({
        userId: 999,
      });

      // then
      expect(hasReconciledCandidateTo).to.be.false;
    });
  });

  context('#findCandidatesByPersonalInfo', function () {
    it('should return the candidate on which all personal info matches (case / diacritics insensitive)', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'un prénom très proche de frederic',
            lastName: `un nom tres proche de debussy`,
            birthdate: '1990-01-04',
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub();
      normalizeStringFnc.withArgs(candidatePersonalInfo.lastName).returns(candidatePersonalInfo.lastName);
      normalizeStringFnc.withArgs(candidatePersonalInfo.firstName).returns(candidatePersonalInfo.firstName);
      normalizeStringFnc.withArgs('Related').returns('Related');
      normalizeStringFnc.withArgs('Un').returns('Un');
      normalizeStringFnc.withArgs('un nom tres proche de debussy').returns('De bussy');
      normalizeStringFnc.withArgs('un prénom très proche de frederic').returns('Frédéric');

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates.map(({ id }) => id)).to.deep.equal([456]);
    });

    it('should return null when first name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };

      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Richard',
            lastName: candidatePersonalInfo.lastName,
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return false when last name is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: 'Chopin',
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return false when birthdate is not matching an already enrolled candidate', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: 'Un',
            lastName: 'Related',
            birthdate: '1995-04-04',
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: candidatePersonalInfo.lastName,
            birthdate: '1990-01-05',
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates).to.deep.equal([]);
    });

    it('should return all candidates matching personal info', function () {
      // given
      const candidatePersonalInfo = {
        firstName: 'Frédéric',
        lastName: 'De bussy',
        birthdate: '1990-01-04',
      };
      const candidatesBuilders = [
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: candidatePersonalInfo.lastName,
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 123,
          }),
        domainBuilder.certification.enrolment
          .candidateBuilder()
          .withIdentity({
            firstName: candidatePersonalInfo.firstName,
            lastName: candidatePersonalInfo.lastName,
            birthdate: candidatePersonalInfo.birthdate,
          })
          .withParameters({
            id: 456,
          }),
      ];
      const session = domainBuilder.certification.enrolment
        .sessionEnrolmentBuilder()
        .addCandidatesBuilders(candidatesBuilders)
        .build();
      const normalizeStringFnc = sinon.stub((str) => str);

      // when
      const matchingCandidates = session.findCandidatesByPersonalInfo({
        candidatePersonalInfo,
        normalizeStringFnc,
      });

      // then
      expect(matchingCandidates.map(({ id }) => id)).to.deep.equal([123, 456]);
    });
  });
});
