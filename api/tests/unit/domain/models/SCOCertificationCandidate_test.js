import { expect, catchErr } from '../../../test-helper';
import SCOCertificationCandidate from '../../../../lib/domain/models/SCOCertificationCandidate';
import { InvalidCertificationCandidate } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | SCO Certification Candidate', function () {
  describe('validate', function () {
    const buildSCOCertificationCandidate = (attributes) => new SCOCertificationCandidate(attributes);
    const validAttributes = {
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2010-01-01',
      sex: 'F',
      birthINSEECode: '75101',
      sessionId: 123,
      organizationLearnerId: 456,
    };

    context('when all required fields are presents', function () {
      it('should be ok when object is valid', function () {
        try {
          buildSCOCertificationCandidate(validAttributes);
        } catch (e) {
          expect.fail('scoCertificationCandidate is valid when all required fields are present');
        }
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['firstName', 'lastName'].forEach((field) => {
      it(`should throw an error when field ${field} is not a string`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: 123 });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });

      it(`should throw an error when field ${field} is not present`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: undefined });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });

      it(`should throw an error when field ${field} is not present because null`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: null });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['sex', 'birthINSEECode'].forEach((field) => {
      it(`should throw an error when field ${field} is not a string`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: 123 });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['sessionId', 'organizationLearnerId'].forEach((field) => {
      it(`should throw an error when field ${field} is not a number`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: 'salut' });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_number');
      });

      it(`should throw an error when field ${field} is not present`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: undefined });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });

      it(`should throw an error when field ${field} is not present because null`, async function () {
        const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, [field]: null });

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    it('should validate when birthCity is an empty string', async function () {
      try {
        buildSCOCertificationCandidate({
          ...validAttributes,
          birthCity: '',
        });
      } catch (e) {
        expect.fail('scoCertificationCandidate is valid when all required fields are present');
      }
    });

    it('should throw an error when birthdate is not a date', async function () {
      const error = await catchErr(buildSCOCertificationCandidate)({
        ...validAttributes,
        birthdate: 'je mange des fruits',
      });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is not a valid format', async function () {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: '2020/02/02' });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is null', async function () {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: null });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when birthdate is not present', async function () {
      const error = await catchErr(buildSCOCertificationCandidate)({ ...validAttributes, birthdate: undefined });

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });
  });
});
