import { CertificationCandidateForSupervising } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidateForSupervising.js';
import { CertificationCandidateForSupervisingV3 } from '../../../../../../src/certification/session-management/domain/models/CertificationCandidateForSupervisingV3.js';
import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/session-for-supervising-serializer.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    describe('when session is v2', function () {
      it('should convert a SessionForSupervising model object into JSON API data', function () {
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
                'start-date-time': new Date('2022-10-01T13:37:00Z'),
                'theorical-end-date-time': new Date('2022-10-01T16:01:00Z'),
                'enrolled-complementary-certification-label': 'Super Certification Complémentaire',
                'is-still-eligible-to-complementary-certification': true,
                'user-id': 6789,
                'live-alert': null,
                'is-companion-active': true,
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
              startDateTime: new Date('2022-10-01T13:37:00Z'),
              theoricalEndDateTime: new Date('2022-10-01T16:01:00Z'),
              isCompanionActive: true,
              enrolledComplementaryCertification: domainBuilder.buildComplementaryCertificationForSupervising({
                key: 'aKey',
                label: 'Super Certification Complémentaire',
              }),
              stillValidBadgeAcquisitions: [
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationKey: 'aKey',
                  complementaryCertificationBadgeLabel: 'Super Certification Complémentaire',
                }),
              ],
            }),
          ],
        });

        // when
        const actualPayload = serializer.serialize(modelSession);

        // then
        expect(actualPayload).to.deep.equal(expectedPayload);
      });
    });

    describe('when session is v3', function () {
      it('should convert a SessionForSupervising model object into JSON API data', function () {
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
                'start-date-time': new Date('2022-10-01T13:37:00Z'),
                'theorical-end-date-time': new Date('2022-10-01T16:01:00Z'),
                'enrolled-complementary-certification-label': 'Super Certification Complémentaire',
                'is-still-eligible-to-complementary-certification': true,
                'is-companion-active': true,
                'user-id': 6789,
                'live-alert': {
                  status: 'ongoing',
                  hasAttachment: false,
                  hasImage: false,
                  hasEmbed: false,
                  isFocus: false,
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
            new CertificationCandidateForSupervisingV3({
              id: 1234,
              userId: 6789,
              firstName: 'toto',
              lastName: 'tata',
              birthdate: '28/05/1984',
              extraTimePercentage: 33,
              authorizedToStart: true,
              assessmentStatus: Assessment.states.STARTED,
              startDateTime: new Date('2022-10-01T13:37:00Z'),
              theoricalEndDateTime: new Date('2022-10-01T16:01:00Z'),
              enrolledComplementaryCertification: domainBuilder.buildComplementaryCertificationForSupervising({
                key: 'aKey',
                label: 'Super Certification Complémentaire',
              }),
              stillValidBadgeAcquisitions: [
                domainBuilder.buildCertifiableBadgeAcquisition({
                  complementaryCertificationKey: 'aKey',
                  complementaryCertificationBadgeLabel: 'Super Certification Complémentaire',
                }),
              ],
              liveAlert: {
                status: CertificationChallengeLiveAlertStatus.ONGOING,
                hasImage: false,
                hasAttachment: false,
                hasEmbed: false,
                isFocus: false,
              },
              isCompanionActive: true,
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
});
