const { expect, sinon, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const Organization  = require('../../../../lib/domain/models/Organization');
const { OrganizationNotFoundError, OrganizationWithoutEmailError, ManyOrganizationsFoundError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-organizations', () => {

  const organizationRepository = {
    findScoOrganizationByUai: sinon.stub(),
    get: sinon.stub(),
  };

  it('should throw an NotFoundOrganization when UAI did not match', async () => {
    // given
    const  uai = '1234567A' ;
    const message = 'L\'UAI/RNE 1234567A de l\'établissement n’est pas reconnu.';

    organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([]);

    const requestErr = await catchErr(usecases.sendScoInvitation)({
      uai,
      organizationRepository
    });

    expect(requestErr).to.be.instanceOf(OrganizationNotFoundError);
    expect(requestErr.message).to.be.equal(message);
  });

  it('should throw an OrganizationWithoutEmailError when email is not present', async () => {
    // given
    const  uai = '1234567A' ;
    const organization = new Organization({ id: 2, type: 'SCO', name: 'organization 2', externalId: '1234568' , email: null });
    const message = 'Nous n’avons pas d’adresse e-mail de contact associée à l\'établissement concernant l\'UAI/RNE 1234567A.';
    organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([organization]);

    const requestErr = await catchErr(usecases.sendScoInvitation)({
      uai,
      organizationRepository
    });

    expect(requestErr).to.be.instanceOf(OrganizationWithoutEmailError);
    expect(requestErr.message).to.be.equal(message);
  });

  it('should throw a ManyOrganizationsFoundError when many organizations found', async () => {
    // given
    const  uai = '1234567A' ;
    const organization1 = new Organization({ id: 2, type: 'SCO', name: 'organization 2', externalId: '1234568' , email: 'sco.generic.account@example.net' });
    const organization2 = new Organization({ id: 2, type: 'SCO', name: 'organization 2', externalId: '1234568' , email: 'sco.generic.account@example.net' });
    const message = 'Plusieurs établissements de type SCO ont été retrouvés pour L\'UAI/RNE 1234567A.';

    organizationRepository.findScoOrganizationByUai.withArgs(uai).resolves([organization1, organization2]);

    // when
    const requestErr = await catchErr(usecases.sendScoInvitation)({
      uai,
      organizationRepository
    });

    // then
    expect(requestErr).to.be.instanceOf(ManyOrganizationsFoundError);
    expect(requestErr.message).to.be.equal(message);
  });
});
