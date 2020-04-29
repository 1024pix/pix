const createServer = require('../../../server');
const { expect, sinon } = require('../../test-helper');
const DomainErrors = require('../../../lib/domain/errors');

describe('Integration | API | Controller Error', () => {

  let server;
  const routeHandler = sinon.stub();
  const options = { method: 'GET', url: '/test_route' };

  function responseDetail(response)  {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].detail;
  }

  beforeEach(async () => {
    server = await createServer();
    server.route({ method: 'GET', path: '/test_route', handler: routeHandler, config:  { auth: false } });

  });

  context('412 Precondition Failed', () => {
    const PRECONDITION_FAILED = 412;

    it('responds Precondition Failed when a AlreadyRatedAssessmentError error occurs', async () => {
      routeHandler.throws(new DomainErrors.AlreadyRatedAssessmentError());
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Assessment is already rated.');
    });

    it('responds Precondition Failed when a CompetenceResetError error occurs', async () => {
      routeHandler.throws(new DomainErrors.CompetenceResetError(2));
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Il reste 2 jours avant de pouvoir réinitiliser la compétence.');
    });

    it('responds Precondition Failed when a AlreadyExistingMembershipError error occurs', async () => {
      routeHandler.throws(new DomainErrors.AlreadyExistingMembershipError('Le membership existe déjà.'));
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Le membership existe déjà.');
    });

    it('responds Precondition Failed when a AlreadyExistingOrganizationInvitationError error occurs', async () => {
      routeHandler.throws(new DomainErrors.AlreadyExistingOrganizationInvitationError('L\'invitation de l\'organisation existe déjà.'));
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('L\'invitation de l\'organisation existe déjà.');
    });

    it('responds Precondition Failed when a AlreadySharedCampaignParticipationError error occurs', async () => {
      routeHandler.throws(new DomainErrors.AlreadySharedCampaignParticipationError('Ces résultats de campagne ont déjà été partagés.'));
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Ces résultats de campagne ont déjà été partagés.');
    });

    it('responds Precondition Failed when a AlreadyExistingCampaignParticipationError error occurs', async () => {
      routeHandler.throws(new DomainErrors.AlreadyExistingCampaignParticipationError());
      const response = await server.inject(options);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });
  });
});
