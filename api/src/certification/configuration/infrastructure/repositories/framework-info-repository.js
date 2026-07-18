import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { BadgeSummary } from '../../domain/read-models/BadgeSummary.js';
import { FrameworkInfo } from '../../domain/read-models/FrameworkInfo.js';
import { TargetProfileSummary } from '../../domain/read-models/TargetProfileSummary.js';
import { VersionSummary } from '../../domain/read-models/VersionSummary.js';

export async function findAll() {
  const allCertificationsData = await baseQuery().orderBy('certifications.scope');
  return allCertificationsData.map(toDomain);
}

export async function find(frameworkName) {
  const certificationData = await baseQuery().where('certifications.scope', frameworkName).first();
  if (!certificationData) {
    return null;
  }
  return toDomain(certificationData);
}

function toDomain(certificationData) {
  const versionSummaries = certificationData.versionsData.map(
    (versionData) =>
      new VersionSummary({
        ...versionData,
        startDate: versionData.startDate ? new Date(versionData.startDate) : null,
        expirationDate: versionData.expirationDate ? new Date(versionData.expirationDate) : null,
      }),
  );
  const targetProfileSummaries = certificationData.targetProfilesData.map(
    (targetProfileData) =>
      new TargetProfileSummary({
        ...targetProfileData,
        badgeSummaries: targetProfileData.badgesData.map(
          (badgeData) =>
            new BadgeSummary({
              ...badgeData,
              createdAt: badgeData.createdAt ? new Date(badgeData.createdAt) : null,
              detachedAt: badgeData.detachedAt ? new Date(badgeData.detachedAt) : null,
            }),
        ),
      }),
  );
  return new FrameworkInfo({
    id: certificationData.scope,
    scope: certificationData.scope,
    versionSummaries,
    targetProfileSummaries,
  });
}

function baseQuery() {
  const knexConn = DomainTransaction.getConnection();

  const certifications = knexConn('complementary-certifications')
    .select({
      complementaryCertificationId: 'id',
      scope: 'key',
    })
    .unionAll([
      knexConn.select({
        complementaryCertificationId: knexConn.raw('NULL'),
        scope: knexConn.raw('?', Frameworks.CORE),
      }),
    ])
    .as('certifications');

  const versions = knexConn('certification_versions')
    .select({
      scope: 'certification_versions.scope',
      versionsData: knexConn.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', id,
              'startDate', "startDate",
              'expirationDate', "expirationDate",
              'status', status,
              'assessmentDuration', "assessmentDuration",
              'maximumAssessmentLength', "challengesConfiguration"->'maximumAssessmentLength'
            )
            ORDER BY id
          ),
          '[]'::json
        )
      `),
    })
    .groupBy('scope')
    .as('versions');

  const allTargetProfiles = knexConn('complementary-certification-badges')
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId')
    .join('target-profiles', 'target-profiles.id', 'badges.targetProfileId')
    .select({
      complementaryCertificationId: 'complementary-certification-badges.complementaryCertificationId',
      id: 'target-profiles.id',
      name: 'target-profiles.name',
      badgesData: knexConn.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', badges.id,
              'label', "complementary-certification-badges".label,
              'level', "complementary-certification-badges".level,
              'imageUrl', "complementary-certification-badges"."imageUrl",
              'minimumEarnedPix', "complementary-certification-badges"."minimumEarnedPix",
              'createdAt', "complementary-certification-badges"."createdAt",
              'detachedAt', "complementary-certification-badges"."detachedAt"
            )
            ORDER BY badges.id
          ),
          '[]'::json
        )`),
    })
    .groupBy(
      'complementary-certification-badges.complementaryCertificationId',
      'target-profiles.id',
      'target-profiles.name',
    )
    .as('all_target_profiles');

  const targetProfiles = knexConn(allTargetProfiles)
    .select({
      complementaryCertificationId: 'all_target_profiles.complementaryCertificationId',
      targetProfilesData: knexConn.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'id', id,
              'name', name,
              'badgesData', "badgesData"
            )
            ORDER BY id
          ),
          '[]'::json
        )`),
    })
    .groupBy('complementaryCertificationId')
    .as('target_profiles_per_certification');

  return knexConn(certifications)
    .leftJoin(versions, 'versions.scope', 'certifications.scope')
    .leftJoin(
      targetProfiles,
      'target_profiles_per_certification.complementaryCertificationId',
      'certifications.complementaryCertificationId',
    )
    .select({
      scope: 'certifications.scope',
    })
    .select(
      knexConn.raw(`COALESCE("versions"."versionsData", '[]'::json) AS "versionsData"`),
      knexConn.raw(
        `COALESCE("target_profiles_per_certification"."targetProfilesData", '[]'::json) AS "targetProfilesData"`,
      ),
    )
    .orderBy('certifications.scope');
}
