const { domainBuilder, expect, sinon, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/tags');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const tagController = require('../../../../lib/application/tags/tag-controller');

describe('Unit | Application | Router | tag-router', function () {
  it('return a response with an http status code OK', async function () {
    // given
    const tags = [
      domainBuilder.buildTag({ name: 'TAG1' }),
      domainBuilder.buildTag({ name: 'TAG2' }),
      domainBuilder.buildTag({ name: 'TAG3' }),
    ];

    const method = 'GET';
    const url = '/api/admin/tags';

    sinon.stub(tagController, 'findAllTags').returns(tags);
    sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request(method, url);

    // then
    expect(response.statusCode).to.equal(200);
    sinon.assert.calledOnce(tagController.findAllTags);
  });
});
