import { expect } from 'chai';
import sinon from 'sinon';

import { sessionForSupervisingController } from '../../../../../src/certification/session-management/application/session-for-supervising-controller.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Session For Supervising', function () {
  describe('#get', function () {
    it('should return a session for supervising', async function () {
      // given
      const request = {
        params: {
          sessionId: 123,
        },
        auth: {
          credentials: {
            userId: 274939274,
          },
        },
      };
      const dependencies = {
        sessionForSupervisingRepository: {
          get: sinon.stub(),
        },
      };
      const foundSession = domainBuilder.certification.sessionManagement
        .sessionForSupervisingBuilder()
        .withParameters({
          id: 12,
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
          extraTimePercentage: 3,
          authorizedToStart: true,
          assessmentStatus: Assessment.states.STARTED,
          startDateTime: new Date('2022-10-01T13:30:00Z'),
          theoricalEndDateTime: new Date('2022-10-01T14:30:00Z'),
          subscription: Frameworks.CLEA,
          isStillEligibleToDoubleCertification: true,
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
        .build();
      dependencies.sessionForSupervisingRepository.get.withArgs({ id: 123 }).resolves(foundSession);

      // when
      const response = await sessionForSupervisingController.get(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal({
        data: {
          attributes: {
            address: 'centre de certification 1',
            'access-code': 'CODE12',
            date: '2017-01-20',
            examiner: 'Antoine Toutvenant',
            room: '28D',
            time: '14:30:00',
          },
          id: '12',
          relationships: {
            'certification-candidates': {
              data: [
                {
                  id: '1234',
                  type: 'certification-candidate-for-supervising',
                },
              ],
            },
          },
          type: 'sessionForSupervising',
        },
        included: [
          {
            attributes: {
              birthdate: '1984-05-28',
              'extra-time-percentage': 3,
              'first-name': 'toto',
              id: 1234,
              'last-name': 'tata',
              'authorized-to-start': true,
              'assessment-status': Assessment.states.STARTED,
              'start-date-time': new Date('2022-10-01T13:30:00Z'),
              'theorical-end-date-time': new Date('2022-10-01T14:30:00Z'),
              subscription: 'CLEA',
              'is-still-eligible-to-double-certification': true,
              'user-id': 6789,
              'challenge-live-alert': {
                type: 'challenge',
                status: CertificationChallengeLiveAlertStatus.ONGOING,
                hasAttachment: false,
                hasImage: false,
                hasEmbed: false,
                isFocus: false,
              },
              'companion-live-alert': {
                type: 'companion',
                status: CertificationCompanionLiveAlertStatus.ONGOING,
              },
            },
            id: '1234',
            type: 'certification-candidate-for-supervising',
          },
        ],
      });
    });
  });
});
