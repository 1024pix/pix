import { expect } from 'chai';

import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/session-for-supervising-serializer.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    it('converts a SessionForSupervising model object into JSON API data', function () {
      // given
      const expectedPayload = {
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
              'extra-time-percentage': 2,
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
              'has-exceeded-certification-duration': true,
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
      };

      const sessionForSupervising = domainBuilder.certification.sessionManagement
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
          extraTimePercentage: 2,
          authorizedToStartAt: new Date(),
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

      // when
      const actualPayload = serializer.serialize(sessionForSupervising);

      // then
      expect(actualPayload).to.deep.equal(expectedPayload);
    });
  });
});
