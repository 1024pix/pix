const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { expect } = require('../../../test-helper');
const _ = require('lodash');

const CERTIFICATION_CANDIDATE_PROPS = [
  'id',
  'firstName',
  'lastName',
  'birthCountry',
  'birthProvince',
  'birthCity',
  'externalId',
  'birthdate',
  'createdAt',
  'extraTimePercentage',
  'sessionId',
];

describe('Unit | Domain | Models | CertificationCandidates', () => {
  let certificationCandidate;

  beforeEach(() => {
    certificationCandidate = new CertificationCandidate({
      id: 'id',
      firstName: '',
      lastName: '',
      birthCountry: '',
      birthProvince: '',
      birthCity: '',
      externalId: '',
      birthdate: '',
      createdAt: '',
      extraTimePercentage: '',
      // references
      sessionId: '',
    });
  });

  it('should create an object of the CertificationCandidate type', () => {
    expect(certificationCandidate).to.be.instanceOf(CertificationCandidate);
  });

  it('should create a certification candidate with all the requires properties', () => {
    expect(_.keys(certificationCandidate)).to.have.deep.members(CERTIFICATION_CANDIDATE_PROPS);
  });

});
