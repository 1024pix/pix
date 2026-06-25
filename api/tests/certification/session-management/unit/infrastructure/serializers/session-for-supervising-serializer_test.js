import { CertificationCandidateForSupervising } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidateForSupervising.js';
import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/session-for-supervising-serializer.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../../test-helper.js';
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
            time: '14:30',
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
              birthdate: '28/05/1984',
              'extra-time-percentage': 33,
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
      };

      const modelSession = domainBuilder.buildSessionForSupervising({
        id: 12,
        address: 'centre de certification 1',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        accessCode: 'CODE12',
        date: '2017-01-20',
        time: '14:30',
        certificationCandidates: [
          new CertificationCandidateForSupervising({
            id: 1234,
            userId: 6789,
            firstName: 'toto',
            lastName: 'tata',
            birthdate: '28/05/1984',
            extraTimePercentage: 33,
            authorizedToStart: true,
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: new Date('2022-10-01T13:30:00Z'),
            assessmentDuration: 60,
            subscription: 'CLEA',
            stillValidBadgeAcquisitions: [
              domainBuilder.buildCertifiableBadgeAcquisition({
                complementaryCertificationKey: 'CLEA',
              }),
            ],
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
          }),
        ],
      });

      // when
      const actualPayload = serializer.serialize(modelSession);

      // then
      expect(actualPayload).to.deep.equal(expectedPayload);
    });
  });
});
