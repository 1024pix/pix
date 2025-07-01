import { config } from '../../../../src/shared/config.js';
import { lcmsClient } from '../../../../src/shared/infrastructure/lcms-client.js';
import { catchErr, expect, mockLearningContent, nock } from '../../../test-helper.js';

describe('Integration | Infrastructure | LCMS Client', function () {
  describe('#getRelease', function () {
    let originalEnvValue;
    context('when no release id is specified', function () {
      beforeEach(function () {
        originalEnvValue = config.lcms.releaseId;
        config.lcms.releaseId = null;
      });

      afterEach(function () {
        config.lcms.releaseId = originalEnvValue;
      });

      it('calls LCMS API to get learning content latest release', async function () {
        // given
        const learningContent = { models: [{ id: 'fromLatestRelease' }] };
        const lcmsCall = await mockLearningContent(learningContent);

        // when
        const response = await lcmsClient.getRelease();

        // then
        expect(response).to.deep.equal(learningContent);
        expect(lcmsCall.isDone()).to.be.true;
      });

      it('rejects when learning content release failed to get', async function () {
        // given
        const lcmsCall = nock('https://lcms-test.pix.fr/api')
          .get('/releases/latest')
          .matchHeader('Authorization', 'Bearer test-api-key')
          .reply(500);

        // when
        const error = await catchErr(lcmsClient.getRelease)();

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(`An error occurred while fetching https://lcms-test.pix.fr/api`);
        expect(lcmsCall.isDone()).to.be.true;
      });
    });

    context('when a release id is specified', function () {
      beforeEach(function () {
        originalEnvValue = config.lcms.releaseId;
        config.lcms.releaseId = '123';
      });

      afterEach(function () {
        config.lcms.releaseId = originalEnvValue;
      });

      it('calls LCMS API to get learning content release of specified ID', async function () {
        // given
        const learningContent = { models: [{ id: 'fromRelease123' }] };
        const lcmsCall = nock('https://lcms-test.pix.fr/api')
          .get('/releases/123')
          .matchHeader('Authorization', 'Bearer test-api-key')
          .reply(200, { content: learningContent });

        // when
        const response = await lcmsClient.getRelease();

        // then
        expect(response).to.deep.equal(learningContent);
        expect(lcmsCall.isDone()).to.be.true;
      });

      it('rejects when learning content release failed to get', async function () {
        // given
        const lcmsCall = nock('https://lcms-test.pix.fr/api')
          .get('/releases/123')
          .matchHeader('Authorization', 'Bearer test-api-key')
          .reply(500);

        // when
        const error = await catchErr(lcmsClient.getRelease)();

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(`An error occurred while fetching https://lcms-test.pix.fr/api`);
        expect(lcmsCall.isDone()).to.be.true;
      });
    });
  });

  describe('#createRelease', function () {
    it('calls LCMS API endpoint', async function () {
      // given
      const lcmsCall = nock('https://lcms-test.pix.fr/api')
        .post('/releases')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(201);

      // when
      await lcmsClient.createRelease();

      // then
      expect(lcmsCall.isDone()).to.equal(true);
    });

    it('returns created release', async function () {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      nock('https://lcms-test.pix.fr/api')
        .post('/releases')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(201, { content: learningContent });

      // when
      const response = await lcmsClient.createRelease();

      // then
      expect(response).to.deep.equal(learningContent);
    });

    it('throws when LCMS Api response is not successful', async function () {
      // given
      nock('https://lcms-test.pix.fr/api')
        .post('/releases')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(403);

      // when
      const error = await catchErr(lcmsClient.createRelease)();

      // then
      expect(error.message).to.deep.equal('An error occurred while creating a release on https://lcms-test.pix.fr/api');
    });
  });
});
