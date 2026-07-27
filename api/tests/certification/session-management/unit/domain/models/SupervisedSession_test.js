import { expect } from 'chai';
import sinon from 'sinon';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | SessionManagement | Unit | Domain | Models | SupervisedSession', function () {
  describe('setStartDate', function () {
    let clock;
    const now = new Date('2022-11-28T01:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    context('when session has no started certifications yet', function () {
      context('when a timezone is provided', function () {
        it('does nothing', function () {
          const supervisedSession = domainBuilder.certification.sessionManagement
            .supervisedSessionBuilder()
            .withStartedCertifications({ count: 0 })
            .withParameters({
              date: '2026-01-01',
            })
            .build();

          const hasUpdatedDate = supervisedSession.setStartDate({
            certificationId: 123,
            timezone: 'America/Catamarca',
          });

          expect(supervisedSession.date).to.equal('2026-01-01');
          expect(hasUpdatedDate).to.be.false;
        });
      });

      context('when no timezone is provided', function () {
        it('does nothing', function () {
          const supervisedSession = domainBuilder.certification.sessionManagement
            .supervisedSessionBuilder()
            .withStartedCertifications({ count: 0 })
            .withParameters({
              date: '2026-01-01',
            })
            .build();

          const hasUpdatedDate = supervisedSession.setStartDate({
            certificationId: 123,
            timezone: null,
          });

          expect(supervisedSession.date).to.equal('2026-01-01');
          expect(hasUpdatedDate).to.be.false;
        });
      });

      context('when invalid timezone is provided', function () {
        it('does nothing', function () {
          const supervisedSession = domainBuilder.certification.sessionManagement
            .supervisedSessionBuilder()
            .withStartedCertifications({ count: 0 })
            .withParameters({
              date: '2026-01-01',
            })
            .build();

          const hasUpdatedDate = supervisedSession.setStartDate({
            certificationId: 123,
            timezone: 'chouchou/beignet',
          });

          expect(supervisedSession.date).to.equal('2026-01-01');
          expect(hasUpdatedDate).to.be.false;
        });
      });
    });

    context('when session has a started certification', function () {
      context('when the started certification is not the same as provided', function () {
        context('when a timezone is provided', function () {
          it('does nothing', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 456 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: 'America/Catamarca',
            });

            expect(supervisedSession.date).to.equal('2026-01-01');
            expect(hasUpdatedDate).to.be.false;
          });
        });

        context('when no timezone is provided', function () {
          it('does nothing', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 456 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: null,
            });

            expect(supervisedSession.date).to.equal('2026-01-01');
            expect(hasUpdatedDate).to.be.false;
          });
        });

        context('when invalid timezone is provided', function () {
          it('does nothing', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 456 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: 'chouchou/beignet',
            });

            expect(supervisedSession.date).to.equal('2026-01-01');
            expect(hasUpdatedDate).to.be.false;
          });
        });
      });

      context('when the started certification is the same as provided', function () {
        context('when a timezone is provided', function () {
          it('updates the date to respect provided timezone', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 123 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: 'America/Catamarca',
            });

            expect(supervisedSession.date).to.equal('2022-11-27');
            expect(hasUpdatedDate).to.be.true;
          });
        });

        context('when no timezone is provided', function () {
          it('does nothing', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 123 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: null,
            });

            expect(supervisedSession.date).to.equal('2026-01-01');
            expect(hasUpdatedDate).to.be.false;
          });
        });

        context('when invalid timezone is provided', function () {
          it('does nothing', function () {
            const supervisedSession = domainBuilder.certification.sessionManagement
              .supervisedSessionBuilder()
              .withStartedCertifications({ count: 1, firstStartedCertificationId: 123 })
              .withParameters({
                date: '2026-01-01',
              })
              .build();

            const hasUpdatedDate = supervisedSession.setStartDate({
              certificationId: 123,
              timezone: 'chouchou/beignet',
            });

            expect(supervisedSession.date).to.equal('2026-01-01');
            expect(hasUpdatedDate).to.be.false;
          });
        });
      });
    });
  });
});
