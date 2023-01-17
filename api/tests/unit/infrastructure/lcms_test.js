const { expect, nock, catchErr } = require('../../test-helper');

const lcms = require('../../../lib/infrastructure/lcms');

describe('Unit | Infrastructure | LCMS', function () {
  describe('#getLatestRelease', function () {
    it('calls LCMS API to get learning content latest release', async function () {
      // given
      const lcmsCall = nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(200);

      // when
      await lcms.getLatestRelease();

      // then
      expect(lcmsCall.isDone()).to.equal(true);
    });

    it('returns learning content release', async function () {
      // given
      const learningContent = { models: [{ id: 'recId' }] };
      nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(200, { content: learningContent });

      // when
      const response = await lcms.getLatestRelease();

      // then
      expect(response).to.deep.equal(learningContent);
    });

    it('rejects when learning content release failed to get', async function () {
      // given
      nock('https://lcms-test.pix.fr/api')
        .get('/releases/latest')
        .matchHeader('Authorization', 'Bearer test-api-key')
        .reply(500);

      // when
      const error = await catchErr(lcms.getLatestRelease)();

      // then
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.equal(`An error occurred while fetching https://lcms-test.pix.fr/api`);
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
      await lcms.createRelease();

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
      const response = await lcms.createRelease();

      // then
      expect(response).to.deep.equal(learningContent);
    });
  });
});
