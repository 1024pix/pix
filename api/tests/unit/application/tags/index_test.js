const {
  domainBuilder,
  expect,
  sinon,
  HttpTestServer,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/tags');

const tagController = require('../../../../lib/application/tags/tag-controller');

describe('Unit | Application | Router | tag-router', () => {

  it('return a response with an http status code OK', async () => {
    // given
    const tag1 = domainBuilder.buildTag({ name: 'TAG1' });
    const tag2 = domainBuilder.buildTag({ name: 'TAG2' });
    const tag3 = domainBuilder.buildTag({ name: 'TAG3' });
    const allOrganizationsTags = [tag1, tag2, tag3];

    const method = 'GET';
    const url = '/api/tags';

    sinon.stub(tagController, 'findAllOrganizationsTags').returns(allOrganizationsTags);
    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);

    // when
    const response = await httpTestServer.request(method, url);

    // then
    expect(response.statusCode).to.equal(200);
    sinon.assert.calledOnce(tagController.findAllOrganizationsTags);
  });

});
