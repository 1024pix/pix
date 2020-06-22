const { catchErr, expect, domainBuilder } = require('../../../test-helper');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const { ObjectValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Competence Mark', () => {

  describe('constructor', () => {

    it('should build a Competence Mark from raw JSON', () => {
      // given
      const rawData = {
        level: 2,
        score: 13,
        area_code: '1',
        competence_code: '1.1',
      };

      // when
      const competenceMark = new CompetenceMark(rawData);

      // then
      expect(competenceMark.level).to.equal(2);
      expect(competenceMark.score).to.equal(13);
      expect(competenceMark.area_code).to.equal('1');
      expect(competenceMark.competence_code).to.equal('1.1');
    });
  });

  describe('validate', () => {

    it('should return a resolved promise when the object is valid', () => {
      // given
      const competenceMark = domainBuilder.buildCompetenceMark();

      // when
      const valid = competenceMark.validate();

      // then
      expect(valid).not.to.true;
    });

    it('should return an error if level is > 8', async () => {
      // given
      const competenceMark = domainBuilder.buildCompetenceMark({ level: 10 });

      // when
      const error = await catchErr(competenceMark.validate.bind(competenceMark))();
      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
      expect(error.message).to.be.equal('ValidationError: "level" must be less than or equal to 8');
    });

    it('should return an error if level is < -1', async () => {
      // given
      const competenceMark = domainBuilder.buildCompetenceMark({ level: -2 });

      // when
      const error = await catchErr(competenceMark.validate.bind(competenceMark))();

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
      expect(error.message).to.be.equal('ValidationError: "level" must be larger than or equal to -1');
    });

    it('should return an error if score > 64', async () => {
      // when
      const competenceMark = domainBuilder.buildCompetenceMark({ score: 65 });

      // when
      const error = await catchErr(competenceMark.validate.bind(competenceMark))();

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
      expect(error.message).to.be.equal('ValidationError: "score" must be less than or equal to 64');
    });
  });
});
