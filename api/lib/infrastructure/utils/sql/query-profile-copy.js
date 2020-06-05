const SPLIT_MARKER = 'SPLIT_MARKER';
const QUERY = `
SET LOCAL copy_profile.dest_userid = %d;
SET LOCAL copy_profile.src_userid = %d;
SET LOCAL copy_profile.dest_organizationid = %d;
SET LOCAL copy_profile.dest_creatorid = %d;
SET LOCAL copy_profile.dest_certificationcenterid = %d;
SELECT setval(pg_get_serial_sequence('knowledge-elements', 'id'), max("id")) FROM "knowledge-elements";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('answers', 'id'), max("id")) FROM "answers";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('assessments', 'id'), max("id")) FROM "assessments";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('campaign-participations', 'id'), max("id")) FROM "campaign-participations";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('campaigns', 'id'), max("id")) FROM "campaigns";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('target-profiles', 'id'), max("id")) FROM "target-profiles";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('target-profiles_skills', 'id'), max("id")) FROM "target-profiles_skills";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('sessions', 'id'), max("id")) FROM "sessions";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('certification-courses', 'id'), max("id")) FROM "certification-courses";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('assessment-results', 'id'), max("id")) FROM "assessment-results";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('competence-marks', 'id'), max("id")) FROM "competence-marks";${SPLIT_MARKER}
SELECT setval(pg_get_serial_sequence('certification-challenges', 'id'), max("id")) FROM "certification-challenges";${SPLIT_MARKER}


WITH TEMP_TABLE_TARGET_PROFILE AS (
  SELECT 'CREATE TEMP TABLE target_profiles_by_campaign (
          dest_target_profile_id INTEGER,
          src_campaign_id INTEGER
        ) ON COMMIT DROP;' AS query
),
TEMP_TABLE_CERTIFICATION_ASSESSMENT AS (
  SELECT 'CREATE TEMP TABLE certification_assessment_link (
          src_assessment_id INTEGER,
          dest_assessment_id INTEGER
        ) ON COMMIT DROP;' AS query
),
TEMP_TABLE_CERTIFICATION_COURSE AS (
  SELECT 'CREATE TEMP TABLE certification_course_link (
          src_certification_course_id INTEGER,
          dest_certification_course_id INTEGER
        ) ON COMMIT DROP;' AS query
),


POSITIONNEMENT AS (


  WITH POSITIONNEMENT_ALL_DATA AS (
    SELECT

      'assessment_' || ass."id" || ' AS (
         INSERT INTO "assessments" ("courseId", "createdAt", "updatedAt", "userId", "type", "state", "competenceId", "campaignParticipationId", "isImproving", "certificationCourseId")
         VALUES (' ||
                   CASE WHEN ass."courseId" IS NULL THEN 'NULL' ELSE '''' || ass."courseId" || '''' END || ', ' ||
                   CASE WHEN ass."createdAt" IS NULL THEN 'NULL' ELSE '''' || ass."createdAt" || '''' END || ', ' ||
                   CASE WHEN ass."updatedAt" IS NULL THEN 'NULL' ELSE '''' || ass."updatedAt" || '''' END || ', ' ||
                   current_setting('copy_profile.dest_userid') || ', ' ||
                   CASE WHEN ass."type" IS NULL THEN 'NULL' ELSE '''' || ass."type" || '''' END || ', ' ||
                   CASE WHEN ass."state"  IS NULL THEN 'NULL' ELSE '''' || ass."state" || '''' END || ', ' ||
                   CASE WHEN ass."competenceId"  IS NULL THEN 'NULL' ELSE '''' || ass."competenceId" || '''' END || ', ' ||
                   CASE WHEN ass."campaignParticipationId" IS NULL THEN 'NULL' ELSE '''' || ass."campaignParticipationId" || '''' END || ', ' ||
                   CASE WHEN ass."isImproving" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
                   CASE WHEN ass."certificationCourseId" IS NULL THEN 'NULL' ELSE '''' || ass."certificationCourseId" || '''' END ||
          ')
          RETURNING "id"
      )' AS assessment_cte,

      'answer_' || ans."id" || ' AS (
         INSERT INTO "answers" ("value", "result", "assessmentId", "challengeId", "createdAt", "updatedAt", "timeout", "elapsedTime", "resultDetails")
         SELECT ' ||
                   CASE WHEN ans."value" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."value", '''', '''''', 'g' ) || '''' END || ', ' ||
                   CASE WHEN ans."result" IS NULL THEN 'NULL' ELSE '''' || ans."result" || '''' END || ', ' ||
                   'assessment_' || ass."id" || '.id, ' ||
                   CASE WHEN ans."challengeId" IS NULL THEN 'NULL' ELSE '''' || ans."challengeId" || '''' END || ', ' ||
                   CASE WHEN ans."createdAt"  IS NULL THEN 'NULL' ELSE '''' || ans."createdAt" || '''' END || ', ' ||
                   CASE WHEN ans."updatedAt"  IS NULL THEN 'NULL' ELSE '''' || ans."updatedAt" || '''' END || ', ' ||
                   CASE WHEN ans."timeout" IS NULL THEN 'NULL' ELSE '''' || ans."timeout" || '''' END || ', ' ||
                   CASE WHEN ans."elapsedTime" IS NULL THEN 'NULL' ELSE '''' || ans."elapsedTime" || '''' END || ', ' ||
                   CASE WHEN ans."resultDetails" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."resultDetails", '''', '''''', 'g' ) || '''' END ||
          ' FROM assessment_' || ass."id" || ' RETURNING "id"
      )' AS answer_cte,

      'knowledgeelement_' || ke."id" || ' AS (
         INSERT INTO "knowledge-elements" ("source", "status", "assessmentId", "answerId", "skillId", "createdAt", "earnedPix", "userId", "competenceId")
         SELECT ' ||
                   CASE WHEN ke."source" IS NULL THEN 'NULL' ELSE '''' || ke."source" || '''' END || ', ' ||
                   CASE WHEN ke."status" IS NULL THEN 'NULL' ELSE '''' || ke."status" || '''' END || ', ' ||
                   'assessment_' || ass."id" || '.id, ' ||
                   'answer_' || ans."id" || '.id, ' ||
                   CASE WHEN ke."skillId" IS NULL THEN 'NULL' ELSE '''' || ke."skillId" || '''' END || ', ' ||
                   CASE WHEN ke."createdAt"  IS NULL THEN 'NULL' ELSE '''' || ke."createdAt" || '''' END || ', ' ||
                   CASE WHEN ke."earnedPix"  IS NULL THEN 'NULL' ELSE '''' || ke."earnedPix" || '''' END || ', ' ||
                   current_setting('copy_profile.dest_userid') || ', ' ||
                   CASE WHEN ke."competenceId" IS NULL THEN 'NULL' ELSE '''' || ke."competenceId" || '''' END ||
          ' FROM answer_' || ans."id" || ', assessment_' || ass."id" || ' RETURNING "id"
      )' AS knowledgeelement_cte
    FROM "knowledge-elements" AS ke
    LEFT JOIN "answers" AS ans ON ans."id" = ke."answerId"
    LEFT JOIN "assessments" AS ass ON ass."id" = ans."assessmentId"
    WHERE ke."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
      AND ass."type" = 'COMPETENCE_EVALUATION'
  ), GROUPED_KNOWLEDGE_ELEMENTS AS (
    SELECT
      distinct "answer_cte",
      "assessment_cte",
      STRING_AGG("knowledgeelement_cte", ' , ') OVER (PARTITION BY "answer_cte") AS "ke_ctes"
    FROM POSITIONNEMENT_ALL_DATA
  ), CONCATENED_KNOWLEDGE_ELEMENTS AS (
    SELECT
      "answer_cte" || ', ' || "ke_ctes" AS "answer_with_ke_ctes",
      "assessment_cte"
    FROM GROUPED_KNOWLEDGE_ELEMENTS
  ), GROUPED_ANSWERS AS (
    SELECT
      distinct "assessment_cte",
      STRING_AGG("answer_with_ke_ctes", ' , ') OVER (PARTITION BY "assessment_cte") AS "answers_with_ke_ctes"
    FROM CONCATENED_KNOWLEDGE_ELEMENTS
  ), CONCATENED_ANSWERS AS (
    SELECT
      'WITH ' || "assessment_cte" || ', ' || "answers_with_ke_ctes"|| ' SELECT ''DATA OK'';' AS "full_assessment_cte"
    FROM GROUPED_ANSWERS
  )
  SELECT
    STRING_AGG(full_assessment_cte, '${SPLIT_MARKER}') AS data
  FROM CONCATENED_ANSWERS
),


PARCOURS AS (


  WITH TARGET_PROFILES_ALL_DATA AS (
    SELECT

      'targetprofile_' || cmp."id" || ' AS (
        INSERT INTO "target-profiles" ("name", "isPublic", "organizationId", "createdAt", "outdated")
        VALUES(' ||
               CASE WHEN tpr."name" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(tpr."name", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN tpr."isPublic" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
               'NULL, ' ||
               CASE WHEN tpr."createdAt" IS NULL THEN 'NULL' ELSE '''' || tpr."createdAt" || '''' END || ', ' ||
               CASE WHEN tpr."outdated" IS TRUE THEN 'true' ELSE 'false' END ||
        ')
        RETURNING "id"
      ),
      targetprofile_' || cmp."id" || '_record AS ( INSERT INTO "target_profiles_by_campaign" ("dest_target_profile_id", "src_campaign_id") SELECT targetprofile_' || cmp."id" || '.id, ' || cmp."id" || ' FROM targetprofile_' || cmp."id" ||
      ')' AS targetprofile_cte,

      'targetprofileskill_' || tps."id" || ' AS (
        INSERT INTO "target-profiles_skills" ("targetProfileId", "skillId")
        SELECT ' ||
               'targetprofile_' || cmp."id" || '.id, ' ||
               CASE WHEN tps."skillId" IS NULL THEN 'NULL' ELSE '''' || tps."skillId" || '''' END ||
        ' FROM targetprofile_' || cmp."id" || ' RETURNING "id"
      )' AS targetprofileskill_cte
    FROM "campaigns" AS cmp
    JOIN "target-profiles" AS tpr ON tpr."id" = cmp."targetProfileId"
    JOIN "target-profiles_skills" AS tps ON tps."targetProfileId" = tpr."id"
    WHERE cmp."id" = ANY(
      SELECT DISTINCT cmp."id"
      FROM "campaigns" AS cmp
      JOIN "campaign-participations" AS cpp ON cpp."campaignId" = cmp."id"
      WHERE cpp."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
    )
  )


  , PARCOURS_ALL_DATA AS (
    SELECT

      'campaign_' || cmp."id" || ' AS (
        INSERT INTO "campaigns" ("name", "code", "organizationId", "creatorId", "createdAt", "targetProfileId", "idPixLabel", "title", "customLandingPageText", "archivedAt", "type")
        SELECT ' ||
               CASE WHEN cmp."name" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(cmp."name", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN cmp."code" IS NULL THEN 'NULL' ELSE '''' || cmp."code" || '''' END || ', ' ||
               current_setting('copy_profile.dest_organizationid') || ', ' ||
               current_setting('copy_profile.dest_creatorid') || ', ' ||
               CASE WHEN cmp."createdAt" IS NULL THEN 'NULL' ELSE '''' || cmp."createdAt" || '''' END || ', ' ||
               'target_profiles_by_campaign.dest_target_profile_id, ' ||
               CASE WHEN cmp."idPixLabel" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(cmp."idPixLabel", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN cmp."title" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(cmp."title", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN cmp."customLandingPageText" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(cmp."customLandingPageText", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN cmp."archivedAt" IS NULL THEN 'NULL' ELSE '''' || cmp."archivedAt" || '''' END || ', ' ||
               CASE WHEN cmp."type" IS NULL THEN 'NULL' ELSE '''' || cmp."type" || '''' END ||
        ' FROM target_profiles_by_campaign WHERE target_profiles_by_campaign.src_campaign_id = ' || cmp."id" || ' RETURNING "id"
      )' AS campaign_cte,

      'campaignparticipation_' || cpp."id" || ' AS (
        INSERT INTO "campaign-participations" ("campaignId", "createdAt", "isShared", "sharedAt", "participantExternalId", "userId")
        SELECT ' ||
               'campaign_' || cmp."id" || '.id, ' ||
               CASE WHEN cpp."createdAt" IS NULL THEN 'NULL' ELSE '''' || cpp."createdAt" || '''' END || ', ' ||
               CASE WHEN cpp."isShared" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
               CASE WHEN cpp."sharedAt" IS NULL THEN 'NULL' ELSE '''' || cpp."sharedAt" || '''' END || ', ' ||
               CASE WHEN cpp."participantExternalId" IS NULL THEN 'NULL' ELSE '''' || cpp."participantExternalId" || '''' END || ', ' ||
               current_setting('copy_profile.dest_userid') ||
        ' FROM campaign_' || cmp."id" || ' RETURNING "id"
      )' AS campaignparticipation_cte,

      'assessment_' || ass."id" || ' AS (
        INSERT INTO "assessments" ("courseId", "createdAt", "updatedAt", "userId", "type", "state", "competenceId", "campaignParticipationId", "isImproving", "certificationCourseId")
        SELECT ' ||
               CASE WHEN ass."courseId" IS NULL THEN 'NULL' ELSE '''' || ass."courseId" || '''' END || ', ' ||
               CASE WHEN ass."createdAt" IS NULL THEN 'NULL' ELSE '''' || ass."createdAt" || '''' END || ', ' ||
               CASE WHEN ass."updatedAt" IS NULL THEN 'NULL' ELSE '''' || ass."updatedAt" || '''' END || ', ' ||
               current_setting('copy_profile.dest_userid') || ', ' ||
               CASE WHEN ass."type" IS NULL THEN 'NULL' ELSE '''' || ass."type" || '''' END || ', ' ||
               CASE WHEN ass."state"  IS NULL THEN 'NULL' ELSE '''' || ass."state" || '''' END || ', ' ||
               CASE WHEN ass."competenceId"  IS NULL THEN 'NULL' ELSE '''' || ass."competenceId" || '''' END || ', ' ||
               'campaignparticipation_' || cpp."id" || '.id, ' ||
               CASE WHEN ass."isImproving" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
               CASE WHEN ass."certificationCourseId" IS NULL THEN 'NULL' ELSE '''' || ass."certificationCourseId" || '''' END ||
        ' FROM campaignparticipation_' || cpp."id" || ' RETURNING "id"
      )' AS assessment_cte,

      'answer_' || ans."id" || ' AS (
        INSERT INTO "answers" ("value", "result", "assessmentId", "challengeId", "createdAt", "updatedAt", "timeout", "elapsedTime", "resultDetails")
        SELECT ' ||
               CASE WHEN ans."value" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."value", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ans."result" IS NULL THEN 'NULL' ELSE '''' || ans."result" || '''' END || ', ' ||
               'assessment_' || ass."id" || '.id, ' ||
               CASE WHEN ans."challengeId" IS NULL THEN 'NULL' ELSE '''' || ans."challengeId" || '''' END || ', ' ||
               CASE WHEN ans."createdAt"  IS NULL THEN 'NULL' ELSE '''' || ans."createdAt" || '''' END || ', ' ||
               CASE WHEN ans."updatedAt"  IS NULL THEN 'NULL' ELSE '''' || ans."updatedAt" || '''' END || ', ' ||
               CASE WHEN ans."timeout" IS NULL THEN 'NULL' ELSE '''' || ans."timeout" || '''' END || ', ' ||
               CASE WHEN ans."elapsedTime" IS NULL THEN 'NULL' ELSE '''' || ans."elapsedTime" || '''' END || ', ' ||
               CASE WHEN ans."resultDetails" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."resultDetails", '''', '''''', 'g' ) || '''' END ||
        ' FROM assessment_' || ass."id" || ' RETURNING "id"
      )' AS answer_cte,

      'knowledgeelement_' || ke."id" || ' AS (
        INSERT INTO "knowledge-elements" ("source", "status", "assessmentId", "answerId", "skillId", "createdAt", "earnedPix", "userId", "competenceId")
        SELECT ' ||
               CASE WHEN ke."source" IS NULL THEN 'NULL' ELSE '''' || ke."source" || '''' END || ', ' ||
               CASE WHEN ke."status" IS NULL THEN 'NULL' ELSE '''' || ke."status" || '''' END || ', ' ||
               'assessment_' || ass."id" || '.id, ' ||
               'answer_' || ans."id" || '.id, ' ||
               CASE WHEN ke."skillId" IS NULL THEN 'NULL' ELSE '''' || ke."skillId" || '''' END || ', ' ||
               CASE WHEN ke."createdAt"  IS NULL THEN 'NULL' ELSE '''' || ke."createdAt" || '''' END || ', ' ||
               CASE WHEN ke."earnedPix"  IS NULL THEN 'NULL' ELSE '''' || ke."earnedPix" || '''' END || ', ' ||
               current_setting('copy_profile.dest_userid') || ', ' ||
               CASE WHEN ke."competenceId" IS NULL THEN 'NULL' ELSE '''' || ke."competenceId" || '''' END ||
        ' FROM answer_' || ans."id" || ', assessment_' || ass."id" || ' RETURNING "id"
      )' AS knowledgeelement_cte
    FROM "knowledge-elements" AS ke
    LEFT JOIN "answers" AS ans ON ans."id" = ke."answerId"
    LEFT JOIN "assessments" AS ass ON ass."id" = ans."assessmentId"
    LEFT JOIN "campaign-participations" AS cpp ON cpp."id" = ass."campaignParticipationId"
    LEFT JOIN "campaigns" AS cmp ON cmp."id" = cpp."campaignId"
    WHERE ke."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
      AND ass."type" = 'SMART_PLACEMENT'
  ),

  GROUPED_TARGET_PROFILES_SKILLS AS (
    SELECT
      distinct "targetprofile_cte",
      STRING_AGG("targetprofileskill_cte", ' , ') OVER (PARTITION BY "targetprofile_cte") AS "tps_ctes"
    FROM TARGET_PROFILES_ALL_DATA
  ), CONCATENED_TARGET_PROFILES_SKILLS AS (
    SELECT
      'WITH ' || "targetprofile_cte" || ', ' || "tps_ctes" || ' SELECT ''DATA OK'';' AS "tpf_with_tps_ctes"
    FROM GROUPED_TARGET_PROFILES_SKILLS
  ), PREPARATION_PARCOURS_DATA AS (
    SELECT
      STRING_AGG(tpf_with_tps_ctes, '${SPLIT_MARKER}') AS data
    FROM CONCATENED_TARGET_PROFILES_SKILLS
  ),

  GROUPED_KNOWLEDGE_ELEMENTS AS (
    SELECT
      distinct "answer_cte",
      "assessment_cte",
      "campaignparticipation_cte",
      "campaign_cte",
      STRING_AGG("knowledgeelement_cte", ' , ') OVER (PARTITION BY "answer_cte") AS "ke_ctes"
    FROM PARCOURS_ALL_DATA
  ), CONCATENED_KNOWLEDGE_ELEMENTS AS (
    SELECT
      "answer_cte" || ', ' || "ke_ctes" AS "answer_with_ke_ctes",
      "assessment_cte" ,
      "campaignparticipation_cte",
      "campaign_cte"
    FROM GROUPED_KNOWLEDGE_ELEMENTS
  ), GROUPED_ANSWERS AS (
    SELECT
      distinct "assessment_cte",
      "campaignparticipation_cte",
      "campaign_cte",
      STRING_AGG("answer_with_ke_ctes", ' , ') OVER (PARTITION BY "assessment_cte") AS "answers_with_ke_ctes"
    FROM CONCATENED_KNOWLEDGE_ELEMENTS
  ), CONCATENED_ANSWERS AS (
    SELECT
      "assessment_cte" || ', ' || "answers_with_ke_ctes" AS "full_assessment_cte",
      "campaignparticipation_cte",
      "campaign_cte"
    FROM GROUPED_ANSWERS
  ), GROUPED_ASSESSMENTS AS (
    SELECT
      distinct "campaignparticipation_cte",
      "campaign_cte",
      STRING_AGG("full_assessment_cte", ' , ') OVER (PARTITION BY "campaignparticipation_cte") AS "full_assessment_ctes"
    FROM CONCATENED_ANSWERS
  ), CONCATENED_ASSESSMENTS AS (
    SELECT
      "campaignparticipation_cte" || ', ' || "full_assessment_ctes" AS "full_cp_cte",
      "campaign_cte"
    FROM GROUPED_ASSESSMENTS
  ), GROUPED_CAMPAIGN_PARTICIPATIONS AS (
    SELECT
      distinct "campaign_cte",
      STRING_AGG("full_cp_cte", ' , ') OVER (PARTITION BY "campaign_cte") AS "full_cp_ctes"
    FROM CONCATENED_ASSESSMENTS
  ), CONCATENED_CAMPAIGN_PARTICIPATIONS AS (
    SELECT
      'WITH ' || "campaign_cte" || ', ' || "full_cp_ctes" || ' SELECT ''DATA OK'';' AS "full_cmp_cte"
    FROM GROUPED_CAMPAIGN_PARTICIPATIONS
  ), PARCOURS_DATA AS (
    SELECT
      STRING_AGG(full_cmp_cte, '${SPLIT_MARKER}') AS data
    FROM CONCATENED_CAMPAIGN_PARTICIPATIONS
  )

  SELECT CONCAT(PREPARATION_PARCOURS_DATA.data, PARCOURS_DATA.data) AS data
  FROM PREPARATION_PARCOURS_DATA, PARCOURS_DATA
),


CERTIFICATION AS (


  WITH SESSIONS_AND_CERTIFICATION_COURSES_AND_ASSESSMENTS_ALL_DATA AS (
    SELECT

      'session_' || ses."id" || ' AS (
        INSERT INTO "sessions" ("certificationCenter", "address", "room", "examiner", "date", "time", "description", "createdAt", "accessCode", "certificationCenterId", "examinerGlobalComment", "finalizedAt", "resultsSentToPrescriberAt", "publishedAt", "assignedCertificationOfficerId")
        VALUES(' ||
               CASE WHEN ses."certificationCenter" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."certificationCenter", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."address" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."address", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."room" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."room", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."examiner" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."examiner", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."date" IS NULL THEN 'NULL' ELSE '''' || ses."date" || '''' END || ', ' ||
               CASE WHEN ses."time" IS NULL THEN 'NULL' ELSE '''' || ses."time" || '''' END || ', ' ||
               CASE WHEN ses."description" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."description", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."createdAt" IS NULL THEN 'NULL' ELSE '''' || ses."createdAt" || '''' END || ', ' ||
               CASE WHEN ses."accessCode" IS NULL THEN 'NULL' ELSE '''' || ses."accessCode" || '''' END || ', ' ||
               current_setting('copy_profile.dest_certificationcenterid') || ', ' ||
               CASE WHEN ses."examinerGlobalComment" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ses."examinerGlobalComment", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ses."finalizedAt" IS NULL THEN 'NULL' ELSE '''' || ses."finalizedAt" || '''' END || ', ' ||
               CASE WHEN ses."resultsSentToPrescriberAt" IS NULL THEN 'NULL' ELSE '''' || ses."resultsSentToPrescriberAt" || '''' END || ', ' ||
               CASE WHEN ses."publishedAt" IS NULL THEN 'NULL' ELSE '''' || ses."publishedAt" || '''' END || ', ' ||
               'NULL' ||
        ')
        RETURNING "id"
      )' AS session_cte,

      'certificationcourse_' || cc."id" || ' AS (
        INSERT INTO "certification-courses" ("createdAt", "updatedAt", "userId", "completedAt", "firstName", "lastName", "birthdate", "birthplace", "sessionId", "externalId", "isPublished", "isV2Certification", "examinerComment", "hasSeenEndTestScreen" )
        SELECT ' ||
                 CASE WHEN cc."createdAt" IS NULL THEN 'NULL' ELSE '''' || cc."createdAt" || '''' END || ', ' ||
                 CASE WHEN cc."updatedAt" IS NULL THEN 'NULL' ELSE '''' || cc."updatedAt" || '''' END || ', ' ||
                 current_setting('copy_profile.dest_userid') || ', ' ||
                 CASE WHEN cc."completedAt" IS NULL THEN 'NULL' ELSE '''' || cc."completedAt" || '''' END || ', ' ||
                 '''firstName'', ''lastName'', ''2020-01-01'', ''birthplace'', ' ||
                 'session_' || ses."id" || '.id, ' ||
                 '''externalId'', ' ||
                 CASE WHEN cc."isPublished" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
                 CASE WHEN cc."isV2Certification" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
                 CASE WHEN cc."examinerComment" IS NULL THEN 'NULL' ELSE '''' || cc."examinerComment" || '''' END || ', ' ||
                 CASE WHEN cc."hasSeenEndTestScreen" IS TRUE THEN 'true' ELSE 'false' END ||
        ' FROM session_' || ses."id" || ' RETURNING "id"
      ),
      certificationcourse_' || cc."id" || '_record AS ( INSERT INTO "certification_course_link" ("src_certification_course_id", "dest_certification_course_id") SELECT ' || cc."id" || ', certificationcourse_' || cc."id" || '.id FROM certificationcourse_' || cc."id" ||
      ')' AS certificationcourse_cte,

      'assessment_' || ass."id" || ' AS (
        INSERT INTO "assessments" ("courseId", "createdAt", "updatedAt", "userId", "type", "state", "competenceId", "campaignParticipationId", "isImproving", "certificationCourseId")
        SELECT ' ||
                 CASE WHEN ass."courseId" IS NULL THEN 'NULL' ELSE '''' || ass."courseId" || '''' END || ', ' ||
                 CASE WHEN ass."createdAt" IS NULL THEN 'NULL' ELSE '''' || ass."createdAt" || '''' END || ', ' ||
                 CASE WHEN ass."updatedAt" IS NULL THEN 'NULL' ELSE '''' || ass."updatedAt" || '''' END || ', ' ||
                 current_setting('copy_profile.dest_userid') || ', ' ||
                 CASE WHEN ass."type" IS NULL THEN 'NULL' ELSE '''' || ass."type" || '''' END || ', ' ||
                 CASE WHEN ass."state"  IS NULL THEN 'NULL' ELSE '''' || ass."state" || '''' END || ', ' ||
                 CASE WHEN ass."competenceId"  IS NULL THEN 'NULL' ELSE '''' || ass."competenceId" || '''' END || ', ' ||
                 CASE WHEN ass."campaignParticipationId"  IS NULL THEN 'NULL' ELSE '''' || ass."campaignParticipationId" || '''' END || ', ' ||
                 CASE WHEN ass."isImproving" IS TRUE THEN 'true' ELSE 'false' END || ', ' ||
                 'certificationcourse_' || ass."certificationCourseId" || '.id ' ||
        ' FROM certificationcourse_' || cc."id" || ' RETURNING "id"
      ),
      assessment_' || cc."id" || '_record AS ( INSERT INTO "certification_assessment_link" ("src_assessment_id", "dest_assessment_id") SELECT ' || ass."id" || ', assessment_' || ass."id" || '.id FROM assessment_' || ass."id" ||
      ')' AS assessment_cte
    FROM "assessments" AS ass
    JOIN "certification-courses" AS cc ON cc."id" = ass."certificationCourseId"
    JOIN "sessions" AS ses ON ses."id" = cc."sessionId"
    WHERE cc."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
  ),


  CERTIFICATION_SCORING_ALL_DATA AS (
    SELECT

      'assessmentresult_' || asr."id" || ' AS (
        INSERT INTO "assessment-results" ("createdAt", "level", "pixScore", "emitter", "commentForJury", "commentForOrganization", "commentForCandidate", "status", "juryId", "assessmentId")
        SELECT ' ||
                 CASE WHEN asr."createdAt" IS NULL THEN 'NULL' ELSE '''' || asr."createdAt" || '''' END || ', ' ||
                 CASE WHEN asr."level" IS NULL THEN 'NULL' ELSE '''' || asr."level" || '''' END || ', ' ||
                 CASE WHEN asr."pixScore" IS NULL THEN 'NULL' ELSE '''' || asr."pixScore" || '''' END || ', ' ||
                 CASE WHEN asr."emitter" IS NULL THEN 'NULL' ELSE '''' || asr."emitter" || '''' END || ', ' ||
                 CASE WHEN asr."commentForJury" IS NULL THEN 'NULL' ELSE '''' || asr."commentForJury" || '''' END || ', ' ||
                 CASE WHEN asr."commentForOrganization" IS NULL THEN 'NULL' ELSE '''' || asr."commentForOrganization" || '''' END || ', ' ||
                 CASE WHEN asr."commentForCandidate" IS NULL THEN 'NULL' ELSE '''' || asr."commentForCandidate" || '''' END || ', ' ||
                 CASE WHEN asr."status" IS NULL THEN 'NULL' ELSE '''' || asr."status" || '''' END || ', ' ||
                 'NULL, ' ||
                 'certification_assessment_link.dest_assessment_id ' ||
        ' FROM certification_assessment_link WHERE certification_assessment_link.src_assessment_id = ' || ass."id" || ' RETURNING "id"
      )' AS assessmentresult_cte,

      'competencemark_' || cm."id" || ' AS (
        INSERT INTO "competence-marks" ("level", "score", "area_code", "competence_code", "createdAt", "assessmentResultId", "competenceId")
        SELECT ' ||
                 CASE WHEN cm."level" IS NULL THEN 'NULL' ELSE '''' || cm."level" || '''' END || ', ' ||
                 CASE WHEN cm."score" IS NULL THEN 'NULL' ELSE '''' || cm."score" || '''' END || ', ' ||
                 CASE WHEN cm."area_code" IS NULL THEN 'NULL' ELSE '''' || cm."area_code" || '''' END || ', ' ||
                 CASE WHEN cm."competence_code" IS NULL THEN 'NULL' ELSE '''' || cm."competence_code" || '''' END || ', ' ||
                 CASE WHEN cm."createdAt" IS NULL THEN 'NULL' ELSE '''' || cm."createdAt" || '''' END || ', ' ||
                 'assessmentresult_' || asr."id" || '.id, ' ||
                 CASE WHEN cm."competenceId" IS NULL THEN 'NULL' ELSE '''' || cm."competenceId" || '''' END ||
        ' FROM assessmentresult_' || asr."id" || ' RETURNING "id"
      )' AS competencemark_cte
    FROM "competence-marks" AS cm
    JOIN "assessment-results" AS asr ON asr."id" = cm."assessmentResultId"
    JOIN "assessments" AS ass ON ass."id" = asr."assessmentId"
    JOIN "certification-courses" AS cc ON cc."id" = ass."certificationCourseId"
    WHERE cc."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
      AND ass."type" = 'CERTIFICATION'
  ),


  CERTIFICATION_ANSWERS_ALL_DATA AS (
    SELECT

      'answer_' || ans."id" || ' AS (
        INSERT INTO "answers" ("value", "result", "assessmentId", "challengeId", "createdAt", "updatedAt", "timeout", "elapsedTime", "resultDetails")
        SELECT ' ||
               CASE WHEN ans."value" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."value", '''', '''''', 'g' ) || '''' END || ', ' ||
               CASE WHEN ans."result" IS NULL THEN 'NULL' ELSE '''' || ans."result" || '''' END || ', ' ||
               'certification_assessment_link.dest_assessment_id, ' ||
               CASE WHEN ans."challengeId" IS NULL THEN 'NULL' ELSE '''' || ans."challengeId" || '''' END || ', ' ||
               CASE WHEN ans."createdAt"  IS NULL THEN 'NULL' ELSE '''' || ans."createdAt" || '''' END || ', ' ||
               CASE WHEN ans."updatedAt"  IS NULL THEN 'NULL' ELSE '''' || ans."updatedAt" || '''' END || ', ' ||
               CASE WHEN ans."timeout" IS NULL THEN 'NULL' ELSE '''' || ans."timeout" || '''' END || ', ' ||
               CASE WHEN ans."elapsedTime" IS NULL THEN 'NULL' ELSE '''' || ans."elapsedTime" || '''' END || ', ' ||
               CASE WHEN ans."resultDetails" IS NULL THEN 'NULL' ELSE '''' || regexp_replace(ans."resultDetails", '''', '''''', 'g' ) || '''' END ||
        ' FROM certification_assessment_link WHERE certification_assessment_link.src_assessment_id = ' || ass."id" || ' RETURNING "id"
      )' AS answer_cte
    FROM "answers" AS ans
    JOIN "assessments" AS ass ON ass."id" = ans."assessmentId"
    JOIN "certification-courses" AS cc ON cc."id" = ass."certificationCourseId"
    WHERE cc."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
      AND ass."type" = 'CERTIFICATION'
  ),


  CERTIFICATION_CHALLENGES_ALL_DATA AS (
    SELECT

      'certificationchallenge_' || cch."id" || ' AS (
        INSERT INTO "certification-challenges" ("challengeId", "competenceId", "associatedSkillName", "courseId", "createdAt", "updatedAt", "associatedSkillId")
        SELECT ' ||
               CASE WHEN cch."challengeId" IS NULL THEN 'NULL' ELSE '''' || cch."challengeId" || '''' END || ', ' ||
               CASE WHEN cch."competenceId" IS NULL THEN 'NULL' ELSE '''' || cch."competenceId" || '''' END || ', ' ||
               CASE WHEN cch."associatedSkillName" IS NULL THEN 'NULL' ELSE '''' || cch."associatedSkillName" || '''' END || ', ' ||
               'certification_course_link.dest_certification_course_id, ' ||
               CASE WHEN cch."createdAt"  IS NULL THEN 'NULL' ELSE '''' || cch."createdAt" || '''' END || ', ' ||
               CASE WHEN cch."updatedAt"  IS NULL THEN 'NULL' ELSE '''' || cch."updatedAt" || '''' END || ', ' ||
               CASE WHEN cch."associatedSkillId" IS NULL THEN 'NULL' ELSE '''' || cch."associatedSkillId" || '''' END ||
        ' FROM certification_course_link WHERE certification_course_link.src_certification_course_id = ' || cc."id" || ' RETURNING "id"
      )' AS certificationchallenge_cte
    FROM "certification-challenges" AS cch
    JOIN "certification-courses" AS cc ON cc."id" = cch."courseId"
    WHERE cc."userId" = CAST( current_setting('copy_profile.src_userid') AS integer )
  ),

  GROUPED_ASSESSMENTS AS (
    SELECT
      distinct "certificationcourse_cte",
      "session_cte",
      STRING_AGG("assessment_cte", ' , ') OVER (PARTITION BY "certificationcourse_cte") AS "ass_ctes"
    FROM SESSIONS_AND_CERTIFICATION_COURSES_AND_ASSESSMENTS_ALL_DATA
  ), CONCATENED_ASSESSMENTS AS (
    SELECT
      "certificationcourse_cte" || ', ' || "ass_ctes" AS "cc_with_ass_ctes",
      "session_cte"
    FROM GROUPED_ASSESSMENTS
  ),
  GROUPED_CERTIFICATION_COURSES AS (
    SELECT
      distinct "session_cte",
      STRING_AGG("cc_with_ass_ctes", ' , ') OVER (PARTITION BY "session_cte") AS "cc_ctes"
    FROM CONCATENED_ASSESSMENTS
  ), CONCATENED_CERTIFICATION_COURSES AS (
    SELECT
      'WITH ' || "session_cte" || ', ' || "cc_ctes" || ' SELECT ''CERTIFICATION PREPARATION OK'';' AS "ses_with_cc_ctes"
    FROM GROUPED_CERTIFICATION_COURSES
  ), PREPARATION_CERTIFICATION_DATA AS (
    SELECT
      STRING_AGG(ses_with_cc_ctes, '${SPLIT_MARKER}') AS data
    FROM CONCATENED_CERTIFICATION_COURSES
  ),

  GROUPED_COMPETENCE_MARKS AS (
    SELECT
      distinct "assessmentresult_cte",
      STRING_AGG("competencemark_cte", ' , ') OVER (PARTITION BY "assessmentresult_cte") AS "cm_ctes"
    FROM CERTIFICATION_SCORING_ALL_DATA
  ), CONCATENED_COMPETENCE_MARKS AS (
    SELECT
      'WITH ' || "assessmentresult_cte" || ', ' || "cm_ctes"|| ' SELECT ''CERTIFICATION SCORING OK'';' AS "asr_with_cm_ctes"
    FROM GROUPED_COMPETENCE_MARKS
  ), SCORING_DATA AS (
    SELECT
      STRING_AGG(asr_with_cm_ctes, '${SPLIT_MARKER}') AS data
    FROM CONCATENED_COMPETENCE_MARKS
  ),

  ANSWERS_DATA AS (
    SELECT
      'WITH ' || STRING_AGG("answer_cte", ', ') || ' SELECT ''CERTIFICATION ANSWERS OK'';' AS data
    FROM CERTIFICATION_ANSWERS_ALL_DATA
  ),

  CERTIFICATION_CHALLENGES_DATA AS (
    SELECT
      'WITH ' || STRING_AGG("certificationchallenge_cte", ', ') || ' SELECT ''CERTIFICATION CHALLENGES OK'';' AS data
    FROM CERTIFICATION_CHALLENGES_ALL_DATA
  )

  SELECT CONCAT(CONCAT(CONCAT(PREPARATION_CERTIFICATION_DATA.data, SCORING_DATA.data), ANSWERS_DATA.data), CERTIFICATION_CHALLENGES_DATA.data) AS data
  FROM PREPARATION_CERTIFICATION_DATA, SCORING_DATA, ANSWERS_DATA, CERTIFICATION_CHALLENGES_DATA
)

SELECT
  TEMP_TABLE_TARGET_PROFILE.query ||
  '${SPLIT_MARKER}' ||
  TEMP_TABLE_CERTIFICATION_ASSESSMENT.query ||
  '${SPLIT_MARKER}' ||
  TEMP_TABLE_CERTIFICATION_COURSE.query ||
  '${SPLIT_MARKER}' ||
  POSITIONNEMENT.data ||
  '${SPLIT_MARKER}' ||
  PARCOURS.data ||
  '${SPLIT_MARKER}' ||
  CERTIFICATION.data AS query_to_execute
FROM POSITIONNEMENT, PARCOURS, CERTIFICATION, TEMP_TABLE_TARGET_PROFILE, TEMP_TABLE_CERTIFICATION_ASSESSMENT, TEMP_TABLE_CERTIFICATION_COURSE;
`;

module.exports = {
  QUERY,
  SPLIT_MARKER,
};
