const { expect, catchErr } = require('../../../test-helper');
const SCOCertificationCandidate = require('../../../../lib/domain/models/SCOCertificationCandidate');
const {
  InvalidCertificationCandidate,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | SCO Certification Candidate', () => {

  describe('validate', () => {
    const buildSCOCertificationCandidate = (attributes) => new SCOCertificationCandidate(attributes);
    const validAttributes = {
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2010-01-01',
      sessionId: 123,
      schoolingRegistrationId: 456,
    };

    context('when all required fields are presents', () => {

      it('should be ok when object is valid', () => {
        try {
          buildSCOCertificationCandidate(validAttributes);
        } catch (e) {
          expect.fail('scoCertificationCandidate is valid when all required fields are present');
        }
      });
    });

    [
      'firstName',
      'lastName',
    ].forEach((field) => {
      it(`should throw an error when field ${field} is not a string`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: 123 });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });

      it(`should throw an error when field ${field} is not present`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: undefined });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });

      it(`should throw an error when field ${field} is not present because null`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: null });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    [
      'sessionId',
      'schoolingRegistrationId',
    ].forEach((field) => {
      it(`should throw an error when field ${field} is not a number`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: 'salut' });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_number');
      });

      it(`should throw an error when field ${field} is not present`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: undefined });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });

      it(`should throw an error when field ${field} is not present because null`, async () => {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: null });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    it('should throw an error when birthdate is not a date', async () => {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: 'je mange des fruits' });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is not a valid format', async () => {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: '2020/02/02' });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is null', async () => {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: null });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when birthdate is not present', async () => {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: undefined });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });
  });
});
