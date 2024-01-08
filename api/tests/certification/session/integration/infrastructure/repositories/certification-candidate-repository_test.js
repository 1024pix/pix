import { databaseBuilder, expect, knex, domainBuilder, catchErr } from '../../../../../test-helper.js';
import { BookshelfCertificationCandidate } from '../../../../../../lib/infrastructure/orm-models/CertificationCandidate.js';
import * as certificationCandidateRepository from '../../../../../../src/certification/shared/infrastructure/repositories/certification-candidate-repository.js';
import {
  NotFoundError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
} from '../../../../../../lib/domain/errors.js';
import { ComplementaryCertification } from '../../../../../../src/certification/session/domain/models/ComplementaryCertification.js';
import _ from 'lodash';

describe('Integration | Repository | CertificationCandidate', function () {
  describe('#saveInSession', function () {
    context('when a proper candidate is being saved', function () {
      it('should save the Certification candidate in session', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        await databaseBuilder.commit();
        const certificationCandidate = domainBuilder.buildCertificationCandidate.notPersisted({
          firstName: 'Pix',
          lastName: 'Lover',
          sex: 'F',
          birthPostalCode: '75000',
          birthINSEECode: '75000',
          birthCity: 'HaussmanPolis',
          externalId: 'ABCDEF123',
          birthdate: '1990-07-12',
          extraTimePercentage: '0.05',
          sessionId,
          complementaryCertification: null,
        });

        // when
        const firstCertificationCandidatesInSession = await certificationCandidateRepository.saveInSession({
          certificationCandidate,
          sessionId,
        });

        // then
        const attributesToOmit = ['id', 'createdAt', 'complementaryCertification', 'userId'];
        expect(_.omit(firstCertificationCandidatesInSession, attributesToOmit)).to.deepEqualInstance(
          _.omit(certificationCandidate, attributesToOmit),
        );
      });

      context('when adding a new candidate', function () {
        it('should add a single row in the table', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          await databaseBuilder.commit();
          const certificationCandidate = domainBuilder.buildCertificationCandidate.notPersisted({
            firstName: 'Pix',
            lastName: 'Lover',
            sex: 'F',
            birthPostalCode: '75000',
            birthINSEECode: '75000',
            birthCity: 'HaussmanPolis',
            externalId: 'ABCDEF123',
            birthdate: '1990-07-12',
            extraTimePercentage: '0.05',
            sessionId,
            complementaryCertification: null,
          });

          const nbCertifCandidatesBeforeSave = await BookshelfCertificationCandidate.count();

          // when
          await certificationCandidateRepository.saveInSession({
            certificationCandidate,
            sessionId,
          });

          // then
          const nbCertifCandidatesAfterSave = await BookshelfCertificationCandidate.count();

          expect(nbCertifCandidatesAfterSave).to.equal(nbCertifCandidatesBeforeSave + 1);
        });
      });

      context('when there is complementary certifications to save', function () {
        afterEach(function () {
          return knex('complementary-certification-subscriptions').del();
        });

        it('should save the complementary certification subscription', async function () {
          // given
          const sessionId = databaseBuilder.factory.buildSession().id;
          const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
          await databaseBuilder.commit();

          const certificationCandidate = domainBuilder.buildCertificationCandidate.notPersisted({
            sessionId,
            complementaryCertification:
              domainBuilder.certification.session.buildCertificationSessionComplementaryCertification({
                id: complementaryCertificationId,
              }),
          });

          // when
          const savedCertificationCandidate = await certificationCandidateRepository.saveInSession({
            certificationCandidate,
            sessionId,
          });

          // then
          const [{ complementaryCertificationId: complementaryCertificationSubscriptionIdInDB }] = await knex(
            'complementary-certification-subscriptions',
          )
            .select('complementaryCertificationId')
            .where({
              certificationCandidateId: savedCertificationCandidate.id,
            });
          expect(complementaryCertificationSubscriptionIdInDB).to.equal(complementaryCertificationId);
        });
      });
    });
  });

  describe('linkToUser', function () {
    let certificationCandidate;
    let userId;

    beforeEach(function () {
      // given
      certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ userId: null });
      userId = databaseBuilder.factory.buildUser().id;

      return databaseBuilder.commit();
    });

    context('when the user is not linked to any candidate in the same session', function () {
      it('should successfully link the candidate to the user', async function () {
        // when
        await certificationCandidateRepository.linkToUser({ id: certificationCandidate.id, userId });

        // then
        const linkedCertificationCandidate = await knex('certification-candidates')
          .where({ id: certificationCandidate.id })
          .select('userId');
        expect(linkedCertificationCandidate[0].userId).to.equal(userId);
      });
    });

    context('when the user is already linked to a candidate in the same session', function () {
      beforeEach(function () {
        databaseBuilder.factory.buildCertificationCandidate({ userId, sessionId: certificationCandidate.sessionId });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCandidateMultipleUserLinksWithinSessionError', async function () {
        // when
        const result = await catchErr(certificationCandidateRepository.linkToUser)({
          id: certificationCandidate.id,
          userId,
        });

        // then
        expect(result).to.be.instanceOf(CertificationCandidateMultipleUserLinksWithinSessionError);
      });
    });
  });

  describe('#delete', function () {
    context('when the record to delete is in the table', function () {
      let certificationCandidateToDeleteId;

      beforeEach(function () {
        // given
        certificationCandidateToDeleteId = databaseBuilder.factory.buildCertificationCandidate().id;
        _.times(5, databaseBuilder.factory.buildCertificationCandidate);
        return databaseBuilder.commit();
      });

      it('should return true when deletion goes well', async function () {
        // when
        const isDeleted = await certificationCandidateRepository.remove(certificationCandidateToDeleteId);

        // then
        expect(isDeleted).to.be.true;
      });

      it('should delete a single row in the table', async function () {
        const nbCertifCandidatesBeforeDeletion = await BookshelfCertificationCandidate.count();
        // when
        await certificationCandidateRepository.remove(certificationCandidateToDeleteId);
        const nbCertifCandidatesAfterDeletion = await BookshelfCertificationCandidate.count();

        // then
        expect(nbCertifCandidatesAfterDeletion).to.equal(nbCertifCandidatesBeforeDeletion - 1);
      });
    });

    context('when the candidate has complementary certification subscriptions', function () {
      it('should delete both candidate and subscription', async function () {
        // given
        const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId,
          certificationCandidateId,
        });
        await databaseBuilder.commit();

        // when
        const isDeleted = await certificationCandidateRepository.remove(certificationCandidateId);

        // then
        const complementaryCertificationSubscriptions = await knex
          .select()
          .from('complementary-certification-subscriptions')
          .first();
        expect(complementaryCertificationSubscriptions).to.be.undefined;
        expect(isDeleted).to.be.true;
      });
    });
  });

  describe('#isNotLinked', function () {
    context('when the candidate is linked', function () {
      let certificationCandidateId;

      beforeEach(function () {
        // given
        certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate().id;
        return databaseBuilder.commit();
      });

      it('should return false', async function () {
        // when
        const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateId);

        // then
        expect(isNotLinked).to.be.false;
      });
    });

    context('when the candidate is not linked', function () {
      let certificationCandidateToDeleteId;

      beforeEach(function () {
        // given
        certificationCandidateToDeleteId = databaseBuilder.factory.buildCertificationCandidate({ userId: null }).id;
        return databaseBuilder.commit();
      });

      it('should return true', async function () {
        // when
        const isNotLinked = await certificationCandidateRepository.isNotLinked(certificationCandidateToDeleteId);

        // then
        expect(isNotLinked).to.be.true;
      });
    });
  });

  describe('#findBySessionId', function () {
    let sessionId;

    beforeEach(async function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      _.each(
        [
          { lastName: 'Jackson', firstName: 'Michael', sessionId },
          { lastName: 'Jackson', firstName: 'Janet', sessionId },
          { lastName: 'Mercury', firstName: 'Freddy', sessionId },
          { lastName: 'Gallagher', firstName: 'Noel', sessionId: anotherSessionId },
          { lastName: 'Gallagher', firstName: 'Liam', sessionId: anotherSessionId },
          { lastName: 'Brown', firstName: 'James', sessionId },
        ],
        (candidate) => {
          databaseBuilder.factory.buildCertificationCandidate(candidate);
        },
      );

      await databaseBuilder.commit();
    });

    context('when there are some certification candidates with the given session id', function () {
      it('should fetch, alphabetically sorted, the certification candidates with a specific session ID', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        expect(actualCandidates[0].firstName).to.equal('James');
        expect(actualCandidates[1].firstName).to.equal('Janet');
        expect(actualCandidates[2].firstName).to.equal('Michael');
        expect(actualCandidates[3].firstName).to.equal('Freddy');
        expect(actualCandidates).to.have.lengthOf(4);
      });
    });

    context('when some returned candidates have complementary certification subscription', function () {
      it('return ordered candidates with associated subscription', async function () {
        // given
        const sessionId = databaseBuilder.factory.buildSession().id;
        const rockCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Pix+Rock',
          key: 'ROCK',
        });
        const matthieuChedid = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Chedid',
          firstName: 'Matthieu',
          sessionId,
        });
        const louisChedid = databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Chedid',
          firstName: 'Louis',
          sessionId,
        });
        databaseBuilder.factory.buildCertificationCandidate({
          lastName: 'Herbie',
          firstName: 'Hancock',
          sessionId,
        });

        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: matthieuChedid.id,
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: rockCertification.id,
          certificationCandidateId: louisChedid.id,
        });

        await databaseBuilder.commit();

        // when
        const candidates = await certificationCandidateRepository.findBySessionId(sessionId);

        // then
        const firstCandidate = candidates[0];
        const secondCandidate = candidates[1];
        const thirdCandidate = candidates[2];

        //        expect(firstCandidate);
        expect(firstCandidate.firstName).to.equal('Louis');
        expect(firstCandidate.lastName).to.equal('Chedid');
        expect(firstCandidate.complementaryCertification).to.deepEqualInstance(
          new ComplementaryCertification({ id: rockCertification.id, label: 'Pix+Rock', key: 'ROCK' }),
        );
        expect(secondCandidate.firstName).to.equal('Matthieu');
        expect(secondCandidate.lastName).to.equal('Chedid');
        expect(secondCandidate.complementaryCertification).to.deepEqualInstance(
          new ComplementaryCertification({ id: rockCertification.id, label: 'Pix+Rock', key: 'ROCK' }),
        );

        expect(thirdCandidate.firstName).to.equal('Hancock');
        expect(thirdCandidate.lastName).to.equal('Herbie');
        expect(thirdCandidate.complementaryCertification).to.equal(null);
      });
    });

    context('when there is no certification candidates with the given session ID', function () {
      it('should return an empty array', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findBySessionId(-1);

        // then
        expect(actualCandidates).to.deep.equal([]);
      });
    });
  });

  describe('#findBySessionIdAndPersonalInfo', function () {
    let sessionId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given info in the session', function () {
      it('should fetch the candidate ignoring case', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          organizationLearnerId: null,
          complementaryCertification: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const personalInfoAndId = {
          lastName: 'Bideau',
          firstName: 'CHARLIE',
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });

      it('should fetch the candidate ignoring special characters, non canonical characters and zero-width spaces', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          id: 123,
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sex: 'M',
          birthPostalCode: null,
          birthINSEECode: '66212',
          birthCity: 'Torreilles',
          birthProvinceCode: '66',
          birthCountry: 'France',
          email: 'charlie@example.net',
          resultRecipientEmail: null,
          sessionId,
          externalId: null,
          createdAt: new Date('2020-01-01'),
          extraTimePercentage: null,
          userId: null,
          organizationLearnerId: null,
          complementaryCertification: null,
        });
        databaseBuilder.factory.buildCertificationCandidate(certificationCandidate);
        await databaseBuilder.commit();
        const zeroWidthSpaceChar = '​';
        const personalInfoAndId = {
          lastName: 'Bïdéà u',
          firstName: `c' ha-rli${zeroWidthSpaceChar}e`,
          birthdate: '1999-10-17',
          sessionId,
        };

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(personalInfoAndId);

        // then
        expect(actualCandidates).to.have.lengthOf(1);
        expect(actualCandidates[0]).to.deep.equal(certificationCandidate);
      });
    });

    context('when there is no certification candidates with the given info in the session', function () {
      let onlyCandidateInBDD;
      let notMatchingCandidateInfo;

      beforeEach(function () {
        onlyCandidateInBDD = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };
        databaseBuilder.factory.buildCertificationCandidate(onlyCandidateInBDD);

        notMatchingCandidateInfo = {
          lastName: 'Jean',
          firstName: 'Michel',
          birthdate: '2018-01-01',
          sessionId,
        };

        return databaseBuilder.commit();
      });

      it('should not find any candidate', async function () {
        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(notMatchingCandidateInfo);

        // then
        expect(actualCandidates).to.be.empty;
      });
    });

    context('when there are more than one certification candidate with the given info in the session', function () {
      it('should find two candidates', async function () {
        //given
        const commonCandidateInfo = {
          lastName: 'Bideau',
          firstName: 'Charlie',
          birthdate: '1999-10-17',
          sessionId,
        };

        databaseBuilder.factory.buildOrganizationLearner({ id: 666 });
        databaseBuilder.factory.buildOrganizationLearner({ id: 777 });

        const certificationCandidates1 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 777,
        });
        const certificationCandidates2 = databaseBuilder.factory.buildCertificationCandidate({
          ...commonCandidateInfo,
          organizationLearnerId: 666,
        });

        await databaseBuilder.commit();

        // when
        const actualCandidates =
          await certificationCandidateRepository.findBySessionIdAndPersonalInfo(commonCandidateInfo);

        // then
        expect(actualCandidates).to.have.lengthOf(2);
        expect(actualCandidates[0].lastName).to.equal(commonCandidateInfo.lastName);
        expect(actualCandidates[1].lastName).to.equal(commonCandidateInfo.lastName);
        expect([actualCandidates[0].organizationLearnerId, actualCandidates[1].organizationLearnerId]).to.have.members([
          certificationCandidates1.organizationLearnerId,
          certificationCandidates2.organizationLearnerId,
        ]);
        expect(actualCandidates[0].id).to.not.equal(actualCandidates[1].id);
      });
    });
  });

  describe('#getBySessionIdAndUserId', function () {
    let sessionId;
    let userId;
    let complementaryCertificationId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const certificationCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId,
        certificationCandidateId,
      });

      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function () {
      it('should fetch the candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.getBySessionIdAndUserId({ sessionId, userId });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
        expect(actualCandidates.complementaryCertification).not.to.be.null;
        expect(actualCandidates.complementaryCertification.id).to.equal(complementaryCertificationId);
      });
    });

    context('when there is no certification candidate with the given session id', function () {
      it('should return undefined', async function () {
        // when
        const result = await certificationCandidateRepository.getBySessionIdAndUserId({
          sessionId: sessionId + 1,
          userId: userId,
        });

        // then
        expect(result).to.be.undefined;
      });
    });

    context('when there is no certification candidate with the given user id', function () {
      it('should return undefined', async function () {
        // when
        const result = await certificationCandidateRepository.getBySessionIdAndUserId({
          sessionId: sessionId,
          userId: userId + 1,
        });

        // then
        expect(result).to.be.undefined;
      });
    });
  });

  describe('#findOneBySessionIdAndUserId', function () {
    let sessionId;
    let userId;

    beforeEach(function () {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildCertificationCandidate({ sessionId: sessionId, userId: userId });
      return databaseBuilder.commit();
    });

    context('when there is one certification candidate with the given session id and user id', function () {
      it('should fetch the candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({
          sessionId,
          userId,
        });

        // then
        expect(actualCandidates.sessionId).to.equal(sessionId);
        expect(actualCandidates.userId).to.equal(userId);
      });
    });

    context('when there is no certification candidate with the given session id and user id', function () {
      it('should not find any candidate', async function () {
        // when
        const actualCandidates = await certificationCandidateRepository.findOneBySessionIdAndUserId({
          sessionId: sessionId + 1,
          userId: userId + 1,
        });

        // then
        expect(actualCandidates).to.be.undefined;
      });
    });
  });

  describe('#doesLinkedCertificationCandidateInSessionExist', function () {
    let sessionId;

    beforeEach(function () {
      sessionId = databaseBuilder.factory.buildSession().id;
      return databaseBuilder.commit();
    });

    context('when there are candidates in the session that are already linked to a user', function () {
      beforeEach(function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return true', async function () {
        // when
        const linkedCandidateExists =
          await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.true;
      });
    });

    context('when there are no candidate in the session that are linked to any user', function () {
      beforeEach(function () {
        // given
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId: null });
        return databaseBuilder.commit();
      });

      it('should return false', async function () {
        // when
        const linkedCandidateExists =
          await certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist({ sessionId });

        // then
        expect(linkedCandidateExists).to.be.false;
      });
    });
  });

  describe('#update', function () {
    describe('when certification candidate exists', function () {
      it('should update authorizedToStart certification candidate attribute', async function () {
        // given
        const session = databaseBuilder.factory.buildSession();
        databaseBuilder.factory.buildUser({ id: 1234 });
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: true,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });
        await databaseBuilder.commit();

        // when
        await certificationCandidateRepository.update(
          domainBuilder.buildCertificationCandidate({
            id: certificationCandidate.id,
            authorizedToStart: false,
          }),
        );

        // then
        const updatedCertificationCandidate = await knex
          .select('authorizedToStart')
          .from('certification-candidates')
          .where({ id: certificationCandidate.id })
          .first();

        expect(updatedCertificationCandidate.authorizedToStart).to.be.false;
      });
    });

    describe('when certification candidate is not found', function () {
      it('should throw', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({ id: 23049 });
        databaseBuilder.factory.buildUser({ id: 1234 });
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: session.id,
          userId: 1234,
          authorizedToStart: false,
          birthdate: '2000-01-04',
          extraTimePercentage: '0.30',
          firstName: 'first-name',
          id: 456,
          lastName: 'last-name',
        });

        await databaseBuilder.commit();
        const wrongCandidateId = 1298;

        // when
        const error = await catchErr(certificationCandidateRepository.update)(
          domainBuilder.buildCertificationCandidate({
            id: wrongCandidateId,
            authorizedToStart: false,
          }),
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#deleteBySessionId', function () {
    it('should remove the certification candidates and their subscriptions by a session id', async function () {
      // given
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const sessionId = databaseBuilder.factory.buildSession().id;
      const firstCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId,
        certificationCandidateId: firstCandidateId,
      });
      const secondCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId,
        certificationCandidateId: secondCandidateId,
      });
      const thirdCandidateId = databaseBuilder.factory.buildCertificationCandidate({ sessionId }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId,
        certificationCandidateId: thirdCandidateId,
      });
      await databaseBuilder.commit();

      // when
      await certificationCandidateRepository.deleteBySessionId({ sessionId });

      // then
      const subscriptionsInDB = await knex('complementary-certification-subscriptions').select();
      const certificationCandidateInDB = await knex('certification-candidates').select();
      expect(subscriptionsInDB).to.deep.equal([]);
      expect(certificationCandidateInDB).to.deep.equal([]);
    });
  });

  describe('#getWithComplementaryCertification', function () {
    context('when certification candidate is not found', function () {
      it('should throw NotFound error', async function () {
        // given
        databaseBuilder.factory.buildCertificationCandidate({ id: 1 });
        const wrongCandidateId = 99;
        await databaseBuilder.commit();

        // when
        const error = await catchErr(certificationCandidateRepository.getWithComplementaryCertification)(
          wrongCandidateId,
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });

    context('when the candidate has no complementary certification subscription', function () {
      it('should return the candidate with empty complementary certification', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        await databaseBuilder.commit();

        // when
        const certificationCandidateWithComplementaryCertifications =
          await certificationCandidateRepository.getWithComplementaryCertification(certificationCandidate.id);

        // then
        expect(certificationCandidateWithComplementaryCertifications).to.deep.equal(
          domainBuilder.buildCertificationCandidate({
            ...certificationCandidate,
            complementaryCertification: null,
          }),
        );
      });
    });

    context('when the candidate has complementary certification subscriptions', function () {
      it('should return the candidate with his complementary certification', async function () {
        // given
        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate();
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          label: 'Complementary certification 2',
        });
        databaseBuilder.factory.buildComplementaryCertificationSubscription({
          complementaryCertificationId: complementaryCertification.id,
          certificationCandidateId: certificationCandidate.id,
        });
        await databaseBuilder.commit();

        // when
        const certificationCandidateWithComplementaryCertification =
          await certificationCandidateRepository.getWithComplementaryCertification(certificationCandidate.id);

        // then
        expect(certificationCandidateWithComplementaryCertification).to.deep.equal(
          domainBuilder.buildCertificationCandidate({
            ...certificationCandidate,
            complementaryCertification:
              domainBuilder.certification.session.buildCertificationSessionComplementaryCertification(
                complementaryCertification,
              ),
          }),
        );
      });
    });
  });
});
