import { expect, domainBuilder } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/session-for-supervising-serializer.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { CertificationCandidateForSupervising } from '../../../../../lib/domain/models/index.js';
import { CertificationCandidateForSupervisingV3 } from '../../../../../src/certification/supervision/domain/models/CertificationCandidateForSupervisingV3.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    describe('when session is v2', function () {
      it('should convert a SessionForSupervising model object into JSON API data', function () {
        // given
        const expectedPayload = {
          data: {
            attributes: {
              'certification-center-name': 'Toto',
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
              },
              id: '1234',
              type: 'certification-candidate-for-supervising',
            },
          ],
        };

        const modelSession = domainBuilder.buildSessionForSupervising({
          id: 12,
          address: 'Nice',
          room: '28D',
          examiner: 'Antoine Toutvenant',
          accessCode: 'CODE12',
          date: '2017-01-20',
          time: '14:30',
          certificationCenterName: 'Toto',
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
              'certification-center-name': 'Toto',
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
          address: 'Nice',
          room: '28D',
          examiner: 'Antoine Toutvenant',
          accessCode: 'CODE12',
          date: '2017-01-20',
          time: '14:30',
          certificationCenterName: 'Toto',
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
