import sinon from 'sinon';

import * as sessionForSupervisingRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/session-for-supervising-repository.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | SessionForSupervising', function () {
  describe('#get', function () {
    let certificationBadgesService, dependencies;

    beforeEach(function () {
      certificationBadgesService = {
        findStillValidBadgeAcquisitions: sinon.stub(),
      };
      dependencies = { certificationBadgesService };
    });

    context('when session is not found', function () {
      it('throws a Not found error', async function () {
        domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .withParameters({ id: 123 })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        const error = await catchErr(sessionForSupervisingRepository.get)({ id: 123123, dependencies });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when session is found', function () {
      it('return the SessionForSupervising read model', async function () {
        // given
        const expectedSessionForSupervising = domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .withParameters({
            id: 123,
            address: 'centre de certification 1',
            room: '28D',
            examiner: 'Antoine Toutvenant',
            accessCode: 'CODE12',
            date: '2017-01-20',
            time: '14:30:00',
          })
          .addCandidate({
            id: 1234,
            userId: 6789,
            firstName: 'toto',
            lastName: 'tata',
            birthdate: '1984-05-28',
            extraTimePercentage: 1,
            authorizedToStartAt: new Date(),
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: new Date('2022-10-01T13:30:00Z'),
            theoricalEndDateTime: new Date('2022-10-01T14:30:00Z'),
            subscription: Frameworks.CORE,
            isStillEligibleToDoubleCertification: false,
            challengeLiveAlert: {
              type: 'challenge',
              status: CertificationChallengeLiveAlertStatus.ONGOING,
              hasImage: false,
              hasAttachment: false,
              hasEmbed: false,
              isFocus: false,
            },
            companionLiveAlert: {
              type: 'companion',
              status: CertificationCompanionLiveAlertStatus.ONGOING,
            },
          })
          .addCandidate({
            id: 456,
            userId: 789,
            firstName: 'fifou',
            lastName: 'zouzou',
            birthdate: '1994-03-18',
            extraTimePercentage: null,
            authorizedToStartAt: null,
            assessmentStatus: null,
            startDateTime: null,
            theoricalEndDateTime: null,
            subscription: Frameworks.DROIT,
            isStillEligibleToDoubleCertification: false,
            challengeLiveAlert: null,
            companionLiveAlert: null,
          })
          .insertToDB({ databaseBuilder });
        domainBuilder.certification.sessionManagement
          .sessionForSupervisingBuilder()
          .withParameters({
            id: 99,
          })
          .addCandidate({
            subscription: Frameworks.CLEA,
          })
          .insertToDB({ databaseBuilder });
        await databaseBuilder.commit();

        // when
        const sessionForSupervising = await sessionForSupervisingRepository.get({ id: 123, dependencies });

        // then
        expect(sessionForSupervising).to.deepEqualInstance(expectedSessionForSupervising);
      });

      context('when session has CLEA candidates', function () {
        it('returns the read model and computes badge acquisitions', async function () {
          const expectedSessionForSupervising = domainBuilder.certification.sessionManagement
            .sessionForSupervisingBuilder()
            .withParameters({
              id: 123,
              address: 'centre de certification 1',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              accessCode: 'CODE12',
              date: '2017-01-20',
              time: '14:30:00',
            })
            .addCandidate({
              id: 4567,
              userId: 789,
              firstName: 'fifou',
              lastName: 'zouzou',
              birthdate: '1994-03-18',
              extraTimePercentage: null,
              authorizedToStartAt: null,
              assessmentStatus: Assessment.states.COMPLETED,
              startDateTime: new Date('2022-10-01T11:10:00Z'),
              theoricalEndDateTime: new Date('2022-10-01T12:10:00Z'),
              subscription: Frameworks.CLEA,
              isStillEligibleToDoubleCertification: true,
              challengeLiveAlert: null,
              companionLiveAlert: {
                type: 'companion',
                status: CertificationCompanionLiveAlertStatus.ONGOING,
              },
            })
            .addCandidate({
              id: 1234,
              userId: 6789,
              firstName: 'toto',
              lastName: 'tata',
              birthdate: '1984-05-28',
              extraTimePercentage: 1,
              authorizedToStartAt: new Date(),
              assessmentStatus: Assessment.states.STARTED,
              startDateTime: new Date('2022-10-01T13:30:00Z'),
              theoricalEndDateTime: new Date('2022-10-01T14:30:00Z'),
              subscription: Frameworks.CLEA,
              isStillEligibleToDoubleCertification: false,
              challengeLiveAlert: null,
              companionLiveAlert: null,
            })
            .insertToDB({ databaseBuilder });
          await databaseBuilder.commit();
          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId: 6789 })
            .resolves([{ complementaryCertificationKey: Frameworks.DROIT }]);
          certificationBadgesService.findStillValidBadgeAcquisitions
            .withArgs({ userId: 789 })
            .resolves([{ complementaryCertificationKey: Frameworks.CLEA }]);

          // when
          const sessionForSupervising = await sessionForSupervisingRepository.get({ id: 123, dependencies });

          // then
          expect(sessionForSupervising).to.deepEqualInstance(expectedSessionForSupervising);
        });
      });
    });
  });
});
