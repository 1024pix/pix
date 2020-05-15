const _ = require('lodash');
const { databaseBuilder, expect, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const JurySession = require('../../../../lib/domain/models/JurySession');
const { statuses } = require('../../../../lib/domain/models/JurySession');
const CertificationOfficer = require('../../../../lib/domain/models/CertificationOfficer');
const jurySessionRepository = require('../../../../lib/infrastructure/repositories/jury-session-repository');

describe('Integration | Repository | JurySession', function() {

  describe('#get', () => {

    context('when id of session exists', () => {
      let sessionId;

      beforeEach(() => {
        const assignedCertificationOfficerId = databaseBuilder.factory.buildUser({
          firstName: 'Pix',
          lastName: 'Doe'
        }).id;
        sessionId = databaseBuilder.factory.buildSession({ assignedCertificationOfficerId }).id;

        return databaseBuilder.commit();
      });

      it('should return the session', async () => {
        // when
        const expectedJurySession = await jurySessionRepository.get(sessionId);

        // then
        expect(expectedJurySession).to.be.an.instanceOf(JurySession);
        expect(expectedJurySession.assignedCertificationOfficer).be.an.instanceOf(CertificationOfficer);
      });

    });

    context('when id of session does not exist', () => {

      it('should throw a NotFoundError', async () => {
        // when
        const error = await catchErr(jurySessionRepository.get)(12345);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findPaginatedFiltered', () => {

    context('when there are Sessions in the database', () => {
      let sessionWithCertificationOfficerId;
      let sessionWithoutCertificationCenterId;

      beforeEach(() => {
        const assignedCertificationOfficerId = databaseBuilder.factory.buildUser({
          firstName: 'Pix',
          lastName: 'Doe'
        }).id;
        sessionWithCertificationOfficerId = databaseBuilder.factory.buildSession({ assignedCertificationOfficerId }).id;
        sessionWithoutCertificationCenterId = databaseBuilder.factory.buildSession({ certificationCenterId: null }).id;

        return databaseBuilder.commit();
      });

      it('should return an Array of Sessions', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { jurySessions: matchingJurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({
          filters,
          page
        });

        // then
        expect(matchingJurySessions).to.exist;
        expect(matchingJurySessions).to.have.lengthOf(2);
        expect(matchingJurySessions[0]).to.be.an.instanceOf(JurySession);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      it('should retrieve the assigned certification officer if there is one', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 3 };

        // when
        const { jurySessions: matchingJurySessions } = await jurySessionRepository.findPaginatedFiltered({
          filters,
          page
        });

        // then
        const sessionWithOfficer = _.find(matchingJurySessions, { id: sessionWithCertificationOfficerId });
        const anotherSession = _.find(matchingJurySessions, { id: sessionWithoutCertificationCenterId });
        expect(sessionWithOfficer.assignedCertificationOfficer).be.an.instanceOf(CertificationOfficer);
        expect(anotherSession.assignedCertificationOfficer).not.be.an.instanceOf(CertificationOfficer);
      });

    });

    context('when there are lots of Sessions (> 10) in the database', () => {

      beforeEach(() => {
        _.times(12, databaseBuilder.factory.buildSession);
        return databaseBuilder.commit();
      });

      it('should return paginated matching Sessions', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { jurySessions: matchingJurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({
          filters,
          page
        });

        // then
        expect(matchingJurySessions).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('orders', () => {
      let firstSessionId;
      let secondSessionId;
      let thirdSessionId;
      let fourthSessionId;

      beforeEach(() => {
        firstSessionId = databaseBuilder.factory.buildSession({
          finalizedAt: new Date('2020-01-01T00:00:00Z'),
          resultsSentToPrescriberAt: null
        }).id;
        secondSessionId = databaseBuilder.factory.buildSession({
          finalizedAt: new Date('2020-01-02T00:00:00Z'),
          resultsSentToPrescriberAt: null
        }).id;
        thirdSessionId = databaseBuilder.factory.buildSession({
          finalizedAt: new Date('2020-01-02T00:00:00Z'),
          resultsSentToPrescriberAt: new Date('2020-01-03T00:00:00Z')
        }).id;
        fourthSessionId = databaseBuilder.factory.buildSession({
          finalizedAt: null,
          resultsSentToPrescriberAt: null
        }).id;

        return databaseBuilder.commit();
      });

      it('should order sessions by returning first finalized but not published, then neither of those, and finally the processed ones', async () => {
        // given
        const filters = {};
        const page = { number: 1, size: 10 };

        // when
        const { jurySessions: matchingJurySessions } = await jurySessionRepository.findPaginatedFiltered({
          filters,
          page
        });

        // then
        expect(matchingJurySessions[0].id).to.equal(firstSessionId);
        expect(matchingJurySessions[1].id).to.equal(secondSessionId);
        expect(matchingJurySessions[2].id).to.equal(thirdSessionId);
        expect(matchingJurySessions[3].id).to.equal(fourthSessionId);
      });
    });

    context('filters', () => {

      context('when there are ignored filters', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildSession();
          databaseBuilder.factory.buildSession();

          return databaseBuilder.commit();
        });

        it('should ignore the filters and retrieve all certificationCenters', async () => {
          // given
          const filters = { foo: 1 };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

          // when
          const { jurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(jurySessions).to.have.length(2);
        });
      });

      context('when there is a filter on the ID', () => {
        let expectedSession;

        beforeEach(() => {
          expectedSession = databaseBuilder.factory.buildSession({ id: 121 });
          databaseBuilder.factory.buildSession({ id: 333 });

          return databaseBuilder.commit();
        });

        it('should apply the strict filter and return the appropriate results', async () => {
          // given
          const filters = { id: expectedSession.id };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

          // when
          const { jurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(jurySessions[0].id).to.equal(expectedSession.id);
        });
      });

      context('when there is a filter on the certificationCenterName', () => {
        let expectedSession;

        beforeEach(() => {
          const certificationCenter = databaseBuilder.factory.buildCertificationCenter({ name: 'Université des Laura en Folie !' });
          expectedSession = databaseBuilder.factory.buildSession({
            certificationCenter: certificationCenter.name,
            certificationCenterId: certificationCenter.id
          });
          databaseBuilder.factory.buildSession();

          return databaseBuilder.commit();
        });

        it('it should find sessions by part of their certification center name, in a case-insensitive way', async () => {
          // given
          const filters = { certificationCenterName: ' Des laURa' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

          // when
          const { jurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(jurySessions[0].id).to.equal(expectedSession.id);
          expect(jurySessions).to.have.length(1);
        });
      });

      context('when there is a filter regarding session status', () => {

        context('when there is a filter on created sessions', () => {
          let expectedSessionId;

          beforeEach(() => {
            expectedSessionId = databaseBuilder.factory.buildSession({ finalizedAt: null, publishedAt: null }).id;
            databaseBuilder.factory.buildSession({ finalizedAt: new Date('2020-01-01T00:00:00Z') });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { status: statuses.CREATED };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });

        context('when there is a filter on finalized sessions', () => {
          let expectedSessionId;

          beforeEach(() => {
            const someDate = new Date('2020-01-01T00:00:00Z');
            expectedSessionId = databaseBuilder.factory.buildSession({
              finalizedAt: someDate,
              publishedAt: null,
              assignedCertificationOfficerId: null
            }).id;
            databaseBuilder.factory.buildSession({
              finalizedAt: someDate,
              publishedAt: someDate,
              assignedCertificationOfficerId: null
            });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { status: statuses.FINALIZED };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });

        context('when there is a filter on in process sessions', () => {
          let expectedSessionId;

          beforeEach(() => {
            const someDate = new Date('2020-01-01T00:00:00Z');
            const assignedCertificationOfficerId = databaseBuilder.factory.buildUser().id;
            expectedSessionId = databaseBuilder.factory.buildSession({
              finalizedAt: someDate,
              publishedAt: null,
              assignedCertificationOfficerId
            }).id;
            databaseBuilder.factory.buildSession({ publishedAt: someDate, assignedCertificationOfficerId });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { status: statuses.IN_PROCESS };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });

        context('when there is a filter on published sessions', () => {
          let expectedSessionId;

          beforeEach(() => {
            const someDate = new Date('2020-01-01T00:00:00Z');
            expectedSessionId = databaseBuilder.factory.buildSession({ publishedAt: someDate }).id;
            databaseBuilder.factory.buildSession({ publishedAt: null });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { status: statuses.PROCESSED };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });
      });

      context('when there is a filter regarding resultsSentToPrescriberAt state', () => {

        context('when there is a filter on sessions which results have been sent to prescriber', () => {
          let expectedSessionId;

          beforeEach(() => {
            expectedSessionId = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: new Date('2020-01-01T00:00:00Z') }).id;
            databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { resultsSentToPrescriberAt: true };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });

        context('when there is a filter on sessions which results have not been sent to prescriber', () => {
          let expectedSessionId;

          beforeEach(() => {
            databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: new Date('2020-01-01T00:00:00Z') });
            expectedSessionId = databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null }).id;

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = { resultsSentToPrescriberAt: false };
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(1);
            expect(jurySessions[0].id).to.equal(expectedSessionId);
          });
        });

        context('when there is no filter on whether session results has been sent to prescriber or not', () => {

          beforeEach(() => {
            databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: new Date('2020-01-01T00:00:00Z') });
            databaseBuilder.factory.buildSession({ resultsSentToPrescriberAt: null });

            return databaseBuilder.commit();
          });

          it('should apply the strict filter and return the appropriate results', async () => {
            // given
            const filters = {};
            const page = { number: 1, size: 10 };

            // when
            const { jurySessions } = await jurySessionRepository.findPaginatedFiltered({ filters, page });

            // then
            expect(jurySessions).to.have.length(2);
          });
        });
      });

      context('when there is a filter on the assigned certification officer', () => {
        let certificationOfficerToMatchId;
        let expectedSession;

        beforeEach(() => {
          certificationOfficerToMatchId = databaseBuilder.factory.buildUser().id;
          const anotherCertificationOfficerId = databaseBuilder.factory.buildUser().id;

          expectedSession = databaseBuilder.factory.buildSession({ assignedCertificationOfficerId: certificationOfficerToMatchId });
          databaseBuilder.factory.buildSession({ assignedCertificationOfficerId: anotherCertificationOfficerId });
          databaseBuilder.factory.buildSession();

          return databaseBuilder.commit();
        });

        it('should only return the session assigned to the given certification officer ', async () => {
          // given
          const currentUserId = certificationOfficerToMatchId;
          const filters = { assignedToSelfOnly: true };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 1 };

          // when
          const { jurySessions, pagination } = await jurySessionRepository.findPaginatedFiltered({ filters, page, currentUserId });

          // then
          expect(pagination).to.deep.equal(expectedPagination);
          expect(jurySessions[0].id).to.equal(expectedSession.id);
          expect(jurySessions).to.have.length(1);
        });
      });
    });
  });

  describe('#assignCertificationOfficer', () => {
    let sessionId;
    let assignedCertificationOfficerId;

    beforeEach(() => {
      sessionId = databaseBuilder.factory.buildSession({ assignedCertificationOfficerId: null }).id;
      assignedCertificationOfficerId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    it('should return an updated Session domain object', async () => {
      // when
      const updatedSession = await jurySessionRepository.assignCertificationOfficer({
        id: sessionId,
        assignedCertificationOfficerId
      });

      // then
      expect(updatedSession).to.be.an.instanceof(JurySession);
      expect(updatedSession.id).to.deep.equal(sessionId);
      expect(updatedSession.assignedCertificationOfficer.id).to.deep.equal(assignedCertificationOfficerId);
      expect(updatedSession.status).to.deep.equal(statuses.IN_PROCESS);
    });

    context('when assignedCertificationOfficerId provided does not exist', () => {

      it('should return a Not found error', async () => {
        // given
        const unknownUserId = assignedCertificationOfficerId + 1;

        // when
        const error = await catchErr(jurySessionRepository.assignCertificationOfficer)({
          id: sessionId,
          assignedCertificationOfficerId: unknownUserId
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when sessionId does not exist', () => {

      it('should return a Not found error', async () => {
        // given
        const unknownSessionId = sessionId + 1;

        // when
        const error = await catchErr(jurySessionRepository.assignCertificationOfficer)({
          id: unknownSessionId,
          assignedCertificationOfficerId
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
