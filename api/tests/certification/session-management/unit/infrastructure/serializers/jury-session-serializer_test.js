import sinon from 'sinon';

import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/jury-session-serializer.js';
import { ImpactfulCategories } from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | jury-session-serializer', function () {
  describe('#serializeForPaginatedList()', function () {
    it('should call serialize method by destructuring passed parameter', function () {
      // given
      const serialize = sinon.stub().resolves();
      const jurySessions = Symbol('someJurySessions');
      const pagination = Symbol('somePagination');
      const parameter = { jurySessions, pagination, someUnusedField: 'unused' };

      // when
      serializer.serializeForPaginatedList(parameter, serialize);

      // then
      expect(serialize).to.have.been.calledWithExactly(jurySessions, pagination);
    });
  });

  describe('#serialize()', function () {
    context('when there is an assigned certification officer', function () {
      it('should convert a Session model object into JSON API data with included officer', function () {
        // given
        const assignedCertificationOfficer = domainBuilder.buildCertificationOfficer({
          id: 2,
          firstName: 'Jean',
          lastName: 'de la Flûte',
        });
        const session = domainBuilder.buildJurySession({
          id: 1,
          certificationCenterName: 'someCenterName',
          certificationCenterType: 'someCenterType',
          certificationCenterId: 'someCenterId',
          certificationCenterExternalId: 'someCenterExternalId',
          address: 'someAddress',
          room: 'someRoom',
          examiner: 'someExaminer',
          date: '2017-01-20',
          time: '14:30',
          accessCode: 'someAccessCode',
          description: 'someDescription',
          examinerGlobalComment: 'someComment',
          createdAt: new Date('2020-01-15T10:00:00Z'),
          finalizedAt: new Date('2020-02-17T14:23:56Z'),
          assignedCertificationOfficer,
          hasJoiningIssue: true,
          hasIncident: true,
          version: 2,
          counters: domainBuilder.certification.sessionManagement.buildJurySessionCounters({
            startedCertifications: 4,
            certificationsWithScoringError: 3,
            issueReports: [{ category: ImpactfulCategories[0] }],
          }),
        });

        // when
        const json = serializer.serialize(session);

        // then
        const expectedJsonAPI = {
          data: {
            type: 'sessions',
            id: '1',
            attributes: {
              'certification-center-name': 'someCenterName',
              'certification-center-type': 'someCenterType',
              'certification-center-id': 'someCenterId',
              'certification-center-external-id': 'someCenterExternalId',
              address: 'someAddress',
              room: 'someRoom',
              examiner: 'someExaminer',
              date: '2017-01-20',
              time: '14:30',
              'access-code': 'someAccessCode',
              status: 'in_process',
              description: 'someDescription',
              'examiner-global-comment': 'someComment',
              'created-at': new Date('2020-01-15T10:00:00Z'),
              'finalized-at': new Date('2020-02-17T14:23:56Z'),
              'published-at': null,
              'results-sent-to-prescriber-at': null,
              'jury-comment': null,
              'jury-commented-at': null,
              'has-incident': true,
              'has-joining-issue': true,
              version: 2,
              'total-number-of-issue-reports': 1,
              'number-of-impactfull-issue-reports': 1,
              'number-of-scoring-errors': 3,
              'number-of-started-certifications': 4,
            },
            relationships: {
              'jury-certification-summaries': {
                links: {
                  related: '/api/admin/sessions/1/jury-certification-summaries',
                },
              },
              'jury-comment-author': {
                data: null,
              },
              'assigned-certification-officer': {
                data: { id: '2', type: 'user' },
              },
            },
          },
          included: [
            {
              type: 'user',
              id: '2',
              attributes: { 'first-name': 'Jean', 'last-name': 'de la Flûte' },
            },
          ],
        };
        expect(json).to.deep.equal(expectedJsonAPI);
      });
    });

    context('when there is a jury comment', function () {
      it('should convert a Session model object into JSON API data with included comment', function () {
        // given
        const juryCommentAuthor = domainBuilder.buildCertificationOfficer({
          id: 3,
          firstName: 'Phil',
          lastName: 'Hippo',
        });
        const session = domainBuilder.buildJurySession({
          id: 1,
          certificationCenterName: 'someCenterName',
          certificationCenterType: 'someCenterType',
          certificationCenterId: 'someCenterId',
          certificationCenterExternalId: 'someCenterExternalId',
          address: 'someAddress',
          room: 'someRoom',
          examiner: 'someExaminer',
          date: '2017-01-20',
          time: '14:30',
          accessCode: 'someAccessCode',
          description: 'someDescription',
          examinerGlobalComment: 'someComment',
          createdAt: new Date('2020-01-15T10:00:00Z'),
          finalizedAt: new Date('2020-02-17T14:23:56Z'),
          juryComment: 'Si on n’avait pas perdu une heure et quart, on serait là depuis une heure et quart.',
          juryCommentedAt: new Date('2021-02-21T14:23:56Z'),
          juryCommentAuthor,
          version: 3,
        });

        // when
        const json = serializer.serialize(session);

        // then
        const expectedJsonAPI = {
          data: {
            type: 'sessions',
            id: '1',
            attributes: {
              'certification-center-name': 'someCenterName',
              'certification-center-type': 'someCenterType',
              'certification-center-id': 'someCenterId',
              'certification-center-external-id': 'someCenterExternalId',
              address: 'someAddress',
              room: 'someRoom',
              examiner: 'someExaminer',
              date: '2017-01-20',
              time: '14:30',
              'access-code': 'someAccessCode',
              status: 'finalized',
              description: 'someDescription',
              'examiner-global-comment': 'someComment',
              'created-at': new Date('2020-01-15T10:00:00Z'),
              'finalized-at': new Date('2020-02-17T14:23:56Z'),
              'results-sent-to-prescriber-at': null,
              'published-at': null,
              'jury-comment': 'Si on n’avait pas perdu une heure et quart, on serait là depuis une heure et quart.',
              'jury-commented-at': new Date('2021-02-21T14:23:56Z'),
              'has-incident': false,
              'has-joining-issue': false,
              version: 3,
              'total-number-of-issue-reports': 0,
              'number-of-impactfull-issue-reports': 0,
              'number-of-scoring-errors': 0,
              'number-of-started-certifications': 0,
            },
            relationships: {
              'jury-certification-summaries': {
                links: {
                  related: '/api/admin/sessions/1/jury-certification-summaries',
                },
              },
              'assigned-certification-officer': {
                data: null,
              },
              'jury-comment-author': {
                data: { id: '3', type: 'user' },
              },
            },
          },
          included: [
            {
              type: 'user',
              id: '3',
              attributes: { 'first-name': 'Phil', 'last-name': 'Hippo' },
            },
          ],
        };
        expect(json).to.deep.equal(expectedJsonAPI);
      });
    });

    context('when there is neither assigned certification officer nor jury comment', function () {
      it('should convert a Session model object into JSON API data', function () {
        // given
        const session = domainBuilder.buildJurySession({
          id: 1,
          certificationCenterName: 'someCenterName',
          certificationCenterType: 'someCenterType',
          certificationCenterId: 'someCenterId',
          certificationCenterExternalId: 'someCenterExternalId',
          address: 'someAddress',
          room: 'someRoom',
          examiner: 'someExaminer',
          date: '2017-01-20',
          time: '14:30',
          accessCode: 'someAccessCode',
          description: 'someDescription',
          examinerGlobalComment: 'someComment',
          createdAt: new Date('2020-01-15T10:00:00Z'),
          finalizedAt: new Date('2020-02-17T14:23:56Z'),
          resultsSentToPrescriberAt: new Date('2020-02-20T14:23:56Z'),
          publishedAt: new Date('2020-02-21T14:23:56Z'),
          version: 3,
        });

        // when
        const json = serializer.serialize(session);

        // then
        const expectedJsonAPI = {
          data: {
            type: 'sessions',
            id: '1',
            attributes: {
              'certification-center-name': 'someCenterName',
              'certification-center-type': 'someCenterType',
              'certification-center-id': 'someCenterId',
              'certification-center-external-id': 'someCenterExternalId',
              address: 'someAddress',
              room: 'someRoom',
              examiner: 'someExaminer',
              date: '2017-01-20',
              time: '14:30',
              'access-code': 'someAccessCode',
              status: 'processed',
              description: 'someDescription',
              'examiner-global-comment': 'someComment',
              'created-at': new Date('2020-01-15T10:00:00Z'),
              'finalized-at': new Date('2020-02-17T14:23:56Z'),
              'results-sent-to-prescriber-at': new Date('2020-02-20T14:23:56Z'),
              'published-at': new Date('2020-02-21T14:23:56Z'),
              'jury-comment': null,
              'jury-commented-at': null,
              'has-incident': false,
              'has-joining-issue': false,
              version: 3,
              'total-number-of-issue-reports': 0,
              'number-of-impactfull-issue-reports': 0,
              'number-of-scoring-errors': 0,
              'number-of-started-certifications': 0,
            },
            relationships: {
              'jury-certification-summaries': {
                links: {
                  related: '/api/admin/sessions/1/jury-certification-summaries',
                },
              },
              'assigned-certification-officer': {
                data: null,
              },
              'jury-comment-author': {
                data: null,
              },
            },
          },
        };
        expect(json).to.deep.equal(expectedJsonAPI);
      });
    });
  });
});
