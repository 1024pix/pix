import { Version } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Configuration | Domain | Models | Version', function () {
  it('should build a Version with all fields', function () {
    // given
    const challengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
      maximumAssessmentLength: 10,
      defaultCandidateCapacity: -8,
    });
    const versionData = {
      id: 123,
      scope: SCOPES.CORE,
      startDate: new Date('2025-01-01'),
      expirationDate: new Date('2025-12-31'),
      assessmentDuration: 120,
      globalScoringConfiguration: [{ capacity: 2.5 }],
      competencesScoringConfiguration: [{ competence1: 'config' }],
      challengesConfiguration,
    };

    // when
    const version = new Version(versionData);

    // then
    expect(version).to.be.instanceOf(Version);
    expect(version).to.deep.equal(versionData);
  });

  it('should build a Version with optional fields as null', function () {
    // given
    const challengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration();
    const versionData = {
      id: 456,
      scope: SCOPES.PIX_PLUS_DROIT,
      startDate: new Date('2025-06-01'),
      expirationDate: null,
      assessmentDuration: 90,
      globalScoringConfiguration: null,
      competencesScoringConfiguration: null,
      challengesConfiguration,
    };

    // when
    const version = new Version(versionData);

    // then
    expect(version).to.be.instanceOf(Version);
    expect(version.id).to.equal(456);
    expect(version.scope).to.equal(SCOPES.PIX_PLUS_DROIT);
    expect(version.expirationDate).to.be.null;
    expect(version.globalScoringConfiguration).to.be.null;
    expect(version.competencesScoringConfiguration).to.be.null;
  });

  it('should throw an EntityValidationError when trying to construct an invalid Version', function () {
    // given
    const challengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration();
    const invalidData = {
      id: 123,
      scope: SCOPES.CORE,
      startDate: 'not-a-date',
      assessmentDuration: 120,
      challengesConfiguration,
    };

    // when
    const error = catchErrSync(() => new Version(invalidData))();

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });

  it('should throw an EntityValidationError when trying to construct an invalid Challenges Configuration', function () {
    // given
    const invalidData = {
      id: 123,
      scope: SCOPES.CORE,
      startDate: new Date('2025-01-01'),
      assessmentDuration: 120,
      challengesConfiguration: { config: 'test' },
    };

    // when
    const error = catchErrSync(() => new Version(invalidData))();

    // then
    expect(error).to.be.instanceOf(EntityValidationError);
  });
});
