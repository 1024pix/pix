BEGIN;

-----------------------------------------------------------------------------------------------------
--				Recalage des séquences       --------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "users";
SELECT setval(pg_get_serial_sequence('assessments','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "assessments";
SELECT setval(pg_get_serial_sequence('organizations','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "organizations";
SELECT setval(pg_get_serial_sequence('memberships','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "memberships";
SELECT setval(pg_get_serial_sequence('target-profiles','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "target-profiles";
SELECT setval(pg_get_serial_sequence('target-profiles_skills','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "target-profiles_skills";
SELECT setval(pg_get_serial_sequence('campaigns','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "campaigns";
SELECT setval(pg_get_serial_sequence('campaign-participations','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "campaign-participations";
SELECT setval(pg_get_serial_sequence('answers','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "answers";
SELECT setval(pg_get_serial_sequence('knowledge-elements','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "knowledge-elements";


-----------------------------------------------------------------------------------------------------
--				Déclaration de constantes   ---------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SET LOCAL constants.user_count=1000;
SET LOCAL constants.string_count=20000;
SET LOCAL constants.competence_evaluation_count=3000;
SET LOCAL constants.organization_count=5;
SET LOCAL constants.campaign_per_organization_count=3;
SET LOCAL constants.participation_per_campaign_count=150;
SET LOCAL constants.shared_participation_percentage=65;
SET LOCAL constants.answer_per_competence_evaluation_assessment_count=25;
SET LOCAL constants.answer_per_campaign_assessment_count=25;
SET LOCAL constants.knowledge_element_per_answer_count=2;
SET LOCAL constants.validated_knowledge_element_percentage=60; -- Détermine la répartition des statuts des knowledge-elements
SET LOCAL constants.invalidated_knowledge_element_percentage=30; -- Le reste du pourcentage va constituer les knowledge-elements 'reset'


-----------------------------------------------------------------------------------------------------
--				Création d'une table temporaire contenant le référentiel   --------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE referentiel (
  rownum SERIAL PRIMARY KEY,
  skill_id 		VARCHAR,
  tube_id 		VARCHAR,
  competence_id VARCHAR,
  pix_value 	NUMERIC(6,5),
  level			INTEGER
) ON COMMIT DROP;
INSERT INTO referentiel(skill_id, competence_id, tube_id, pix_value, level)
VALUES (...);
-- Ajouter les données du référentiel ici !


-----------------------------------------------------------------------------------------------------
--				Création d'une table temporaire contenant des données de dépendances entre les acquis   ---
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE skills_dependency (
  skill_id 		VARCHAR,
  sub_skill_id 		VARCHAR,
  sub_skill_pix_value NUMERIC(6,5)
) ON COMMIT DROP;
INSERT INTO skills_dependency(skill_id, sub_skill_id, sub_skill_pix_value)
SELECT
  referentiel_a.skill_id,
  referentiel_b.skill_id,
  referentiel_b.pix_value
FROM referentiel AS referentiel_a
JOIN referentiel AS referentiel_b ON referentiel_a.tube_id=referentiel_b.tube_id
WHERE referentiel_a.level > referentiel_b.level;

-----------------------------------------------------------------------------------------------------
--				Empêcher la journalisation des tables   ---------------------------------------------
-----------------------------------------------------------------------------------------------------
ALTER TABLE "knowledge-elements" SET UNLOGGED;
ALTER TABLE "competence-marks" SET UNLOGGED;
ALTER TABLE "feedbacks" SET UNLOGGED;
ALTER TABLE "answers" SET UNLOGGED;
ALTER TABLE "assessment-results" SET UNLOGGED;
ALTER TABLE "competence-evaluations" SET UNLOGGED;
ALTER TABLE "assessments" SET UNLOGGED;
ALTER TABLE "certification-challenges" SET UNLOGGED;
ALTER TABLE "badge-partner-competences" SET UNLOGGED;
ALTER TABLE "partner-certifications" SET UNLOGGED;
ALTER TABLE "campaign-participations" SET UNLOGGED;
ALTER TABLE "badge-acquisitions" SET UNLOGGED;
ALTER TABLE "badge-criteria" SET UNLOGGED;
ALTER TABLE "target-profile-shares" SET UNLOGGED;
ALTER TABLE "badges" SET UNLOGGED;
ALTER TABLE "campaigns" SET UNLOGGED;
ALTER TABLE "certification-candidates" SET UNLOGGED;
ALTER TABLE "certification-courses" SET UNLOGGED;
ALTER TABLE "target-profiles_skills" SET UNLOGGED;
ALTER TABLE "stages" SET UNLOGGED;
ALTER TABLE "users_pix_roles" SET UNLOGGED;
ALTER TABLE "certification-center-memberships" SET UNLOGGED;
ALTER TABLE "memberships" SET UNLOGGED;
ALTER TABLE "organization-invitations" SET UNLOGGED;
ALTER TABLE "schooling-registrations" SET UNLOGGED;
ALTER TABLE "sessions" SET UNLOGGED;
ALTER TABLE "target-profiles" SET UNLOGGED;
ALTER TABLE "user-orga-settings" SET UNLOGGED;
ALTER TABLE "certification-centers" SET UNLOGGED;
ALTER TABLE "user_tutorials" SET UNLOGGED;
ALTER TABLE "users" SET UNLOGGED;
ALTER TABLE "tutorial-evaluations" SET UNLOGGED;
ALTER TABLE "organizations" SET UNLOGGED;


-----------------------------------------------------------------------------------------------------
--				Supprimer les contraintes   ---------------------------------------------------------
-----------------------------------------------------------------------------------------------------
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";
ALTER TABLE "users" DROP CONSTRAINT "users_samlid_unique";
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_userid_certificationcourseid_unique";
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_certificationcourseid_foreign";
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_userid_foreign";
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_campaignparticipationid_foreign";
ALTER TABLE "campaign-participations" DROP CONSTRAINT "campaign_participations_campaignid_foreign";
ALTER TABLE "campaign-participations" DROP CONSTRAINT "campaign_participations_userid_foreign";
ALTER TABLE "answers" DROP CONSTRAINT "answers_assessmentid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_answerid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_assessmentid_foreign";
ALTER TABLE "knowledge-elements" DROP CONSTRAINT "knowledge_elements_userid_foreign";


-----------------------------------------------------------------------------------------------------
--				Supprimer les index   ---------------------------------------------------------
-----------------------------------------------------------------------------------------------------
DROP INDEX "assessment_courseid_index";
DROP INDEX "assessments_campaignparticipationid_index";
DROP INDEX "assessments_certificationcourseid_index";
DROP INDEX "assessments_competenceid_index";
DROP INDEX "assessments_state_index";
DROP INDEX "assessments_type_index";
DROP INDEX "assessments_userid_index";
DROP INDEX "campaign_participations_userid_index";
DROP INDEX "answers_assessmentid_index";
DROP INDEX "knowledge_elements_userid_index";


-----------------------------------------------------------------------------------------------------
--				Création et remplissage d'une table de chaînes aléatoires composées de 3 syllabes   -------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE random_string (
  rownum SERIAL PRIMARY KEY,
  rand_str VARCHAR
) ON COMMIT DROP;
INSERT INTO random_string(rownum, rand_str)
SELECT
  generator,
	(
	  SELECT string_agg(x,'')
		FROM (
		  SELECT start_arr[ 1 + ( (random() * 25)::int) % 33 ]
			FROM (
			  SELECT '{cu,bal,ro,re,pi,co,jho,bo,ba,ja,mi,pe,da,an,en,sy,vir,nath,so,mo,al,che,cha,dia,n,ph,hn,b,t,gh,ri,hen,ng}'::text[] as start_arr
			) AS syllables_array, generate_series(1, 3 + (generator*0))
			) AS the_string(x)
	)
FROM generate_series(1,current_setting('constants.string_count')::int) as generator;


-----------------------------------------------------------------------------------------------------
--				Ajout des utilisateurs   ------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_users (
  rownum SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email VARCHAR
) ON COMMIT DROP;
WITH inserted_users_cte AS (
  INSERT INTO users("firstName", "lastName", "email", "password")
  SELECT
    r_s_a.rand_str,
    r_s_b.rand_str,
    r_s_a.rand_str || '.' || r_s_b.rand_str || (currval(pg_get_serial_sequence('users','id'))+1) || '@example.net',
    'default_password'
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as first_name_rownum
    ),
    (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as last_name_rownum
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.user_count')::int) as generator
  ) id_picker
  INNER JOIN random_string as r_s_a ON r_s_a.rownum = id_picker.first_name_rownum
  INNER JOIN random_string as r_s_b ON r_s_b.rownum = id_picker.last_name_rownum
  RETURNING id AS user_id, email AS user_email
)
INSERT INTO inserted_users(user_id, user_email)
SELECT
  user_id,
  user_email
FROM inserted_users_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des assessments COMPETENCE_EVALUATION   ---------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_assessments (
  rownum SERIAL PRIMARY KEY,
  assessment_id INTEGER,
  user_id INTEGER,
  created_at TIMESTAMPTZ,
  type VARCHAR,
  campaign_participation_id INTEGER DEFAULT NULL
) ON COMMIT DROP;
WITH inserted_assessments_cte AS (
  INSERT INTO assessments("userId", "state", "type", "createdAt")
  SELECT
    inserted_users.user_id,
    'completed',
    'COMPETENCE_EVALUATION',
    NOW() - interval '365 days' + (random() * (interval '365 days'))
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.user_count')::int)::int + (generator*0) as picked_rownum
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.competence_evaluation_count')::int) as generator
  ) id_picker
  INNER JOIN inserted_users ON inserted_users.rownum = id_picker.picked_rownum
  RETURNING id AS assessment_id, "userId" AS user_id, "createdAt" AS created_at, type
)
INSERT INTO inserted_assessments(assessment_id, user_id, created_at, type, campaign_participation_id)
SELECT
  assessment_id,
  user_id,
  created_at,
  type,
  NULL
FROM inserted_assessments_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des organisations et de leur administrateur   ---------------------------------------
-----------------------------------------------------------------------------------------------------

--   Administrateurs
CREATE TEMPORARY TABLE inserted_administrators (
  rownum SERIAL PRIMARY KEY,
  administrator_id INTEGER
) ON COMMIT DROP;
WITH inserted_administrators_cte AS (
  INSERT INTO users("firstName", "lastName", "email", "password")
  SELECT
    r_s_a.rand_str,
    r_s_b.rand_str,
    r_s_a.rand_str || '.' || r_s_b.rand_str || (currval(pg_get_serial_sequence('users','id'))+1) || '@example.net',
    'default_password'
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as first_name_rownum
    ),
    (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as last_name_rownum
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.organization_count')::int) as generator
  ) id_picker
  INNER JOIN random_string as r_s_a ON r_s_a.rownum = id_picker.first_name_rownum
  INNER JOIN random_string as r_s_b ON r_s_b.rownum = id_picker.last_name_rownum
  RETURNING id AS administrator_id
)
INSERT INTO inserted_administrators(administrator_id)
SELECT
  administrator_id
FROM inserted_administrators_cte;

--   Organisations
CREATE TEMPORARY TABLE inserted_organizations (
  rownum SERIAL PRIMARY KEY,
  organization_id INTEGER
) ON COMMIT DROP;
WITH inserted_organizations_cte AS (
  INSERT INTO organizations("type", "name", "createdAt", "isManagingStudents", "canCollectProfiles")
  SELECT
    'SCO',
    random_string.rand_str,
    NOW() - interval '800 days' + (random() * (interval '365 days')),
    true,
    true
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as name_rownum
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.organization_count')::int) as generator
  ) id_picker
  INNER JOIN random_string ON random_string.rownum = id_picker.name_rownum
  RETURNING id AS organization_id
)
INSERT INTO inserted_organizations(organization_id)
SELECT
  organization_id
FROM inserted_organizations_cte;

--   Memberships
CREATE TEMPORARY TABLE inserted_memberships (
  rownum SERIAL PRIMARY KEY,
  organization_id INTEGER,
  administrator_id INTEGER
) ON COMMIT DROP;
WITH inserted_memberships_cte AS (
  INSERT INTO memberships("organizationId", "userId", "organizationRole")
  SELECT
    inserted_organizations.organization_id,
    inserted_administrators.administrator_id,
    'ADMIN'
  FROM inserted_organizations
  JOIN inserted_administrators ON inserted_organizations.rownum = inserted_administrators.rownum
  RETURNING "organizationId" AS organization_id, "userId" AS administrator_id
)
INSERT INTO inserted_memberships(organization_id, administrator_id)
SELECT
  organization_id,
  administrator_id
FROM inserted_memberships_cte;

-----------------------------------------------------------------------------------------------------
--				Ajout des target-profiles   ---------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_target_profiles (
  rownum SERIAL PRIMARY KEY,
  name VARCHAR,
  target_profile_id INTEGER
) ON COMMIT DROP;
WITH inserted_target_profiles_cte AS (
  INSERT INTO "target-profiles"("name", "isPublic")
  VALUES('Profil petit',true), ('Profil moyen',true), ('Profil complet',true)
  RETURNING id as target_profile_id, name
)
INSERT INTO inserted_target_profiles(name, target_profile_id)
SELECT
  name,
  target_profile_id
FROM inserted_target_profiles_cte;

-- Profil petit
INSERT INTO "target-profiles_skills"("targetProfileId", "skillId")
SELECT
  ( SELECT inserted_target_profiles.target_profile_id FROM inserted_target_profiles WHERE inserted_target_profiles.name = 'Profil petit' ),
  referentiel.skill_id
FROM (
  SELECT
    DISTINCT (
      SELECT (random() * 655)::int + (generator*0) AS picked_skill_rownum
    ),
    generator AS id
  FROM generate_series(1,1500) AS generator LIMIT 100
) id_picker
INNER JOIN referentiel ON referentiel.rownum = id_picker.picked_skill_rownum;

-- Profil moyen
INSERT INTO "target-profiles_skills"("targetProfileId", "skillId")
SELECT
  ( SELECT inserted_target_profiles.target_profile_id FROM inserted_target_profiles WHERE inserted_target_profiles.name = 'Profil moyen' ),
  referentiel.skill_id
FROM (
  SELECT
    DISTINCT (
      SELECT (random() * 655)::int + (generator*0) AS picked_skill_rownum
    ),
    generator AS id
  FROM generate_series(1,1500) AS generator LIMIT 300
) id_picker
INNER JOIN referentiel ON referentiel.rownum = id_picker.picked_skill_rownum;

-- Profil complet
INSERT INTO "target-profiles_skills"("targetProfileId", "skillId")
SELECT
  ( SELECT inserted_target_profiles.target_profile_id FROM inserted_target_profiles WHERE inserted_target_profiles.name = 'Profil complet' ),
  referentiel.skill_id
FROM (
  SELECT
    DISTINCT (
      SELECT (random() * 655)::int + (generator*0) AS picked_skill_rownum
    ),
    generator AS id
  FROM generate_series(1,1500) AS generator LIMIT 655
) id_picker
INNER JOIN referentiel ON referentiel.rownum = id_picker.picked_skill_rownum;

-----------------------------------------------------------------------------------------------------
--				Ajout des campagnes   ---------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_campaigns (
  rownum SERIAL PRIMARY KEY,
  campaign_id INTEGER,
  organization_id INTEGER
) ON COMMIT DROP;
WITH inserted_campaigns_cte AS (
  INSERT INTO campaigns("name", "code", "organizationId", "creatorId", "createdAt", "targetProfileId", "type")
  SELECT
    'Campagne_' || (currval(pg_get_serial_sequence('campaigns','id'))+1),
    'Code_' || (currval(pg_get_serial_sequence('campaigns','id'))+1),
    inserted_memberships.organization_id,
    inserted_memberships.administrator_id,
    NOW() - interval '800 days' + (random() * (interval '365 days')),
    inserted_target_profiles.target_profile_id,
    'ASSESSMENT'
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.organization_count')::int)::int + (generator*0) as picked_membership_rownum
    ),(
      SELECT (random() * 3)::int + (generator*0) as picked_target_profile_rownum
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int) as generator
  ) id_picker
  INNER JOIN inserted_memberships ON inserted_memberships.rownum = id_picker.picked_membership_rownum
  INNER JOIN inserted_target_profiles ON inserted_target_profiles.rownum = id_picker.picked_target_profile_rownum
  RETURNING id AS campaign_id, "organizationId" AS organization_id
)
INSERT INTO inserted_campaigns(campaign_id, organization_id)
SELECT
  campaign_id,
  organization_id
FROM inserted_campaigns_cte;

-----------------------------------------------------------------------------------------------------
--				Ajout des participations   ----------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_campaign_participations (
  rownum SERIAL PRIMARY KEY,
  campaign_participation_id INTEGER,
  user_id INTEGER
) ON COMMIT DROP;
WITH inserted_campaign_participations_cte AS (
  INSERT INTO "campaign-participations"("campaignId", "createdAt", "isShared", "sharedAt", "userId", "participantExternalId")
  SELECT
    inserted_campaigns.campaign_id,
    NOW() - interval '800 days' + (random() * (interval '365 days')),
    id_picker.is_shared,
    CASE WHEN (is_shared=true) THEN NOW() - interval '800 days' + (random() * (interval '365 days')) ELSE NULL END,
    inserted_users.user_id,
    inserted_users.user_email
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int)::int + (generator*0) as picked_campaign_rownum
    ),(
      SELECT (random() * current_setting('constants.user_count')::int)::int + (generator*0) as picked_user_rownum
    ),(
      SELECT ((random() * 100 + (generator*0)) > (100-current_setting('constants.shared_participation_percentage')::int))::boolean as is_shared
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int*current_setting('constants.participation_per_campaign_count')::int) as generator
  ) id_picker
  INNER JOIN inserted_users ON inserted_users.rownum = id_picker.picked_user_rownum
  INNER JOIN inserted_campaigns ON inserted_campaigns.rownum = id_picker.picked_campaign_rownum
  ON CONFLICT DO nothing
  RETURNING id AS campaign_participation_id, "userId" AS user_id
)
INSERT INTO inserted_campaign_participations(campaign_participation_id, user_id)
SELECT
  campaign_participation_id,
  user_id
FROM inserted_campaign_participations_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des assessments CAMPAIGN   ----------------------------------------------------------
-----------------------------------------------------------------------------------------------------
WITH inserted_assessments_cte AS (
  INSERT INTO assessments("userId", "state", "type", "createdAt", "campaignParticipationId")
  SELECT
    inserted_campaign_participations.user_id,
    'completed',
    'CAMPAIGN',
    NOW() - interval '365 days' + (random() * (interval '365 days')),
    inserted_campaign_participations.campaign_participation_id
  FROM inserted_campaign_participations
  RETURNING id AS assessment_id, "userId" AS user_id, "createdAt" AS created_at, type, "campaignParticipationId" AS campaign_participation_id
)
INSERT INTO inserted_assessments(assessment_id, user_id, created_at, type, campaign_participation_id)
SELECT
  assessment_id,
  user_id,
  created_at,
  type,
  campaign_participation_id
FROM inserted_assessments_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des réponses pour les assessments COMPETENCE_EVALUATION   ---------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_answers (
  rownum SERIAL PRIMARY KEY,
  answer_id INTEGER,
  user_id INTEGER,
  assessment_id INTEGER,
  campaign_participation_id INTEGER,
  created_at TIMESTAMPTZ,
  assessment_type VARCHAR
) ON COMMIT DROP;
WITH inserted_answers_cte AS (
  INSERT INTO answers("assessmentId", "challengeId", "createdAt")
  SELECT
    inserted_assessments.assessment_id,
    'recSomeChallenge',
    NOW() - interval '365 days' + (random() * (interval '365 days'))
  FROM (
      SELECT (
        SELECT (random() * current_setting('constants.competence_evaluation_count')::int)::int + (generator*0) as picked_assessment_rownum
      ),
        generator as id
      FROM generate_series(1,current_setting('constants.answer_per_competence_evaluation_assessment_count')::int*current_setting('constants.competence_evaluation_count')::int) as generator
    ) id_picker
  INNER JOIN inserted_assessments ON inserted_assessments.rownum = id_picker.picked_assessment_rownum
  WHERE inserted_assessments.type = 'COMPETENCE_EVALUATION'
  RETURNING id AS answer_id, "assessmentId" AS assessment_id, "createdAt" AS created_at
)
INSERT INTO inserted_answers(answer_id, user_id, assessment_id, campaign_participation_id, created_at, assessment_type)
SELECT
  inserted_answers_cte.answer_id,
  inserted_assessments.user_id,
  inserted_answers_cte.assessment_id,
  inserted_assessments.campaign_participation_id,
  inserted_answers_cte.created_at,
  inserted_assessments.type
FROM inserted_answers_cte
JOIN inserted_assessments ON inserted_assessments.assessment_id = inserted_answers_cte.assessment_id;


-----------------------------------------------------------------------------------------------------
--				Ajout des réponses pour les assessments CAMPAIGN   ----------------------------------------
-----------------------------------------------------------------------------------------------------
WITH inserted_answers_cte AS (
  INSERT INTO answers("assessmentId", "challengeId", "createdAt")
  SELECT
    inserted_assessments.assessment_id,
    'recSomeChallenge',
    NOW() - interval '365 days' + (random() * (interval '365 days'))
  FROM (
      SELECT (
        SELECT (current_setting('constants.competence_evaluation_count')::int + random() * current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int*current_setting('constants.participation_per_campaign_count')::int)::int + (generator*0) as picked_assessment_rownum
      ),
        generator as id
      FROM generate_series(1,current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int*current_setting('constants.participation_per_campaign_count')::int*current_setting('constants.answer_per_campaign_assessment_count')::int) as generator
    ) id_picker
  INNER JOIN inserted_assessments ON inserted_assessments.rownum = id_picker.picked_assessment_rownum
  WHERE inserted_assessments.type = 'CAMPAIGN'
  RETURNING id AS answer_id, "assessmentId" AS assessment_id, "createdAt" AS created_at
)
INSERT INTO inserted_answers(answer_id, user_id, assessment_id, campaign_participation_id, created_at, assessment_type)
SELECT
  inserted_answers_cte.answer_id,
  inserted_assessments.user_id,
  inserted_answers_cte.assessment_id,
  inserted_assessments.campaign_participation_id,
  inserted_answers_cte.created_at,
  inserted_assessments.type
FROM inserted_answers_cte
JOIN inserted_assessments ON inserted_assessments.assessment_id = inserted_answers_cte.assessment_id;


-----------------------------------------------------------------------------------------------------
--				Ajout des knowledge elements pour les assessments COMPETENCE_EVALUATION   -----------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_knowledge_elements (
  rownum SERIAL PRIMARY KEY,
  source VARCHAR,
  status VARCHAR,
  assessment_id INTEGER,
  answer_id INTEGER,
  user_id INTEGER,
  skill_id VARCHAR,
  competence_id VARCHAR,
  created_at TIMESTAMPTZ
) ON COMMIT DROP;
WITH inserted_knowledge_elements_cte AS (
  INSERT INTO "knowledge-elements"("source", "status", "assessmentId", "userId", "answerId", "skillId", "earnedPix", "competenceId", "createdAt")
  SELECT
    'direct',
    CASE
      WHEN id_picker.status_score > (100-current_setting('constants.invalidated_knowledge_element_percentage')::int) THEN 'invalidated'
      WHEN id_picker.status_score > (100-current_setting('constants.validated_knowledge_element_percentage')::int) THEN 'validated'
      ELSE 'reset'
    END,
    inserted_answers.assessment_id,
    inserted_answers.user_id,
    inserted_answers.answer_id,
    referentiel.skill_id,
    CASE
      WHEN id_picker.status_score > (100-current_setting('constants.validated_knowledge_element_percentage')::int) THEN referentiel.pix_value
      ELSE 0
    END,
    referentiel.competence_id,
    inserted_answers.created_at
  FROM (
      SELECT (
        SELECT (random() * current_setting('constants.answer_per_competence_evaluation_assessment_count')::int*current_setting('constants.competence_evaluation_count')::int)::int + (generator*0) AS picked_answer_rownum
      ),
      (
        SELECT (random() * 657)::int + (generator*0) AS picked_referentiel_rownum
      ),
      (
        SELECT (random() * 100 + (generator*0))::int AS status_score
      ),
        generator AS id
      FROM generate_series(1,current_setting('constants.answer_per_competence_evaluation_assessment_count')::int*current_setting('constants.competence_evaluation_count')::int*current_setting('constants.knowledge_element_per_answer_count')::int) as generator
    ) id_picker
  INNER JOIN inserted_answers ON inserted_answers.rownum = id_picker.picked_answer_rownum
  INNER JOIN referentiel ON referentiel.rownum = id_picker.picked_referentiel_rownum
  WHERE inserted_answers.assessment_type = 'COMPETENCE_EVALUATION'
  RETURNING source, status, "assessmentId" AS assessment_id, "answerId" AS answer_id, "userId" AS user_id, "skillId" AS skill_id, "competenceId" AS competence_id, "createdAt" AS created_at
)
INSERT INTO inserted_knowledge_elements(source, status, assessment_id, answer_id, user_id, skill_id, competence_id, created_at)
SELECT
  inserted_knowledge_elements_cte.source,
  inserted_knowledge_elements_cte.status,
  inserted_knowledge_elements_cte.assessment_id,
  inserted_knowledge_elements_cte.answer_id,
  inserted_knowledge_elements_cte.user_id,
  inserted_knowledge_elements_cte.skill_id,
  inserted_knowledge_elements_cte.competence_id,
  inserted_knowledge_elements_cte.created_at
FROM inserted_knowledge_elements_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des knowledge elements pour les assessments CAMPAIGN   ------------------------------
-----------------------------------------------------------------------------------------------------
WITH inserted_knowledge_elements_cte AS (
  INSERT INTO "knowledge-elements"("source", "status", "assessmentId", "userId", "answerId", "skillId", "earnedPix", "competenceId", "createdAt")
  SELECT
    'direct',
    CASE
      WHEN id_picker.status_score > (100-current_setting('constants.invalidated_knowledge_element_percentage')::int) THEN 'invalidated'
      WHEN id_picker.status_score > (100-current_setting('constants.validated_knowledge_element_percentage')::int) THEN 'validated'
      ELSE 'reset'
    END,
    inserted_answers.assessment_id,
    inserted_answers.user_id,
    inserted_answers.answer_id,
    referentiel.skill_id,
    CASE
      WHEN id_picker.status_score > (100-current_setting('constants.validated_knowledge_element_percentage')::int) THEN referentiel.pix_value
      ELSE 0
    END,
    referentiel.competence_id,
    inserted_answers.created_at
  FROM (
      SELECT (
        SELECT (current_setting('constants.answer_per_competence_evaluation_assessment_count')::int*current_setting('constants.competence_evaluation_count')::int + random() * current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int*current_setting('constants.participation_per_campaign_count')::int*current_setting('constants.answer_per_campaign_assessment_count')::int)::int + (generator*0) AS picked_answer_rownum
      ),
      (
        SELECT (random() * 657)::int + (generator*0) AS picked_referentiel_rownum
      ),
      (
        SELECT (random() * 100 + (generator*0))::int AS status_score
      ),
        generator AS id
      FROM generate_series(1,current_setting('constants.campaign_per_organization_count')::int*current_setting('constants.organization_count')::int*current_setting('constants.participation_per_campaign_count')::int*current_setting('constants.answer_per_campaign_assessment_count')::int*current_setting('constants.knowledge_element_per_answer_count')::int) as generator
    ) id_picker
  INNER JOIN inserted_answers ON inserted_answers.rownum = id_picker.picked_answer_rownum
  INNER JOIN referentiel ON referentiel.rownum = id_picker.picked_referentiel_rownum
  WHERE inserted_answers.assessment_type = 'CAMPAIGN'
  RETURNING source, status, "assessmentId" AS assessment_id, "answerId" AS answer_id, "userId" AS user_id, "skillId" AS skill_id, "competenceId" AS competence_id, "createdAt" AS created_at
)
INSERT INTO inserted_knowledge_elements(source, status, assessment_id, answer_id, user_id, skill_id, competence_id, created_at)
SELECT
  inserted_knowledge_elements_cte.source,
  inserted_knowledge_elements_cte.status,
  inserted_knowledge_elements_cte.assessment_id,
  inserted_knowledge_elements_cte.answer_id,
  inserted_knowledge_elements_cte.user_id,
  inserted_knowledge_elements_cte.skill_id,
  inserted_knowledge_elements_cte.competence_id,
  inserted_knowledge_elements_cte.created_at
FROM inserted_knowledge_elements_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des knowledge elements dépendants   -------------------------------------------------
-----------------------------------------------------------------------------------------------------
INSERT INTO "knowledge-elements"("source", "status", "assessmentId", "userId", "answerId", "skillId", "earnedPix", "competenceId", "createdAt")
SELECT
  'inferred',
  'validated',
  inserted_knowledge_elements.assessment_id,
  inserted_knowledge_elements.user_id,
  inserted_knowledge_elements.answer_id,
  skills_dependency.sub_skill_id,
  skills_dependency.sub_skill_pix_value,
  inserted_knowledge_elements.competence_id,
  inserted_knowledge_elements.created_at
FROM inserted_knowledge_elements
JOIN skills_dependency ON skills_dependency.skill_id = inserted_knowledge_elements.skill_id
WHERE inserted_knowledge_elements.status = 'validated';

-----------------------------------------------------------------------------------------------------
--				Rétablir les contraintes   ----------------------------------------------------------
-----------------------------------------------------------------------------------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_samlid_unique" UNIQUE ("samlId");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_userid_certificationcourseid_unique" UNIQUE ("userId", "certificationCourseId");
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_certificationcourseid_foreign" FOREIGN KEY ("certificationCourseId") REFERENCES "certification-courses"("id");
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_userid_foreign" FOREIGN KEY ("userId") REFERENCES "users"("id");
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_campaignparticipationid_foreign" FOREIGN KEY ("campaignParticipationId") REFERENCES "campaign-participations"("id");
ALTER TABLE "campaign-participations" ADD CONSTRAINT "campaign_participations_campaignid_foreign" FOREIGN KEY ("campaignId") REFERENCES "campaigns" ("id");
ALTER TABLE "campaign-participations" ADD CONSTRAINT "campaign_participations_userid_foreign" FOREIGN KEY ("userId") REFERENCES "users" ("id");
ALTER TABLE "answers" ADD CONSTRAINT "answers_assessmentid_foreign" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id");
ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_answerid_foreign" FOREIGN KEY ("answerId") REFERENCES "answers" ("id");
ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_assessmentid_foreign" FOREIGN KEY ("assessmentId") REFERENCES "assessments" ("id");
ALTER TABLE "knowledge-elements" ADD CONSTRAINT "knowledge_elements_userid_foreign" FOREIGN KEY ("userId") REFERENCES "users" ("id");

-----------------------------------------------------------------------------------------------------
--				Rétablir les index   ---------------------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE INDEX "assessment_courseid_index" ON "assessments"("courseId");
CREATE INDEX "assessments_campaignparticipationid_index" ON "assessments"("campaignParticipationId");
CREATE INDEX "assessments_certificationcourseid_index" ON "assessments"("certificationCourseId");
CREATE INDEX "assessments_competenceid_index" ON "assessments"("competenceId");
CREATE INDEX "assessments_state_index" ON "assessments"("state");
CREATE INDEX "assessments_type_index" ON "assessments"("type");
CREATE INDEX "assessments_userid_index" ON "assessments"("userId");
CREATE INDEX "campaign_participations_userid_index" ON "campaign-participations"("userId");
CREATE INDEX "answers_assessmentid_index" ON "answers"("assessmentId");
CREATE INDEX "knowledge_elements_userid_index" ON "knowledge-elements"("userId");


-----------------------------------------------------------------------------------------------------
--				Rétablir la journalisation des tables   ---------------------------------------------
-----------------------------------------------------------------------------------------------------
ALTER TABLE "organizations" SET LOGGED;
ALTER TABLE "tutorial-evaluations" SET LOGGED;
ALTER TABLE "users" SET LOGGED;
ALTER TABLE "user_tutorials" SET LOGGED;
ALTER TABLE "certification-centers" SET LOGGED;
ALTER TABLE "user-orga-settings" SET LOGGED;
ALTER TABLE "target-profiles" SET LOGGED;
ALTER TABLE "sessions" SET LOGGED;
ALTER TABLE "schooling-registrations" SET LOGGED;
ALTER TABLE "organization-invitations" SET LOGGED;
ALTER TABLE "memberships" SET LOGGED;
ALTER TABLE "certification-center-memberships" SET LOGGED;
ALTER TABLE "users_pix_roles" SET LOGGED;
ALTER TABLE "stages" SET LOGGED;
ALTER TABLE "target-profiles_skills" SET LOGGED;
ALTER TABLE "certification-courses" SET LOGGED;
ALTER TABLE "certification-candidates" SET LOGGED;
ALTER TABLE "campaigns" SET LOGGED;
ALTER TABLE "badges" SET LOGGED;
ALTER TABLE "target-profile-shares" SET LOGGED;
ALTER TABLE "badge-criteria" SET LOGGED;
ALTER TABLE "badge-acquisitions" SET LOGGED;
ALTER TABLE "campaign-participations" SET LOGGED;
ALTER TABLE "partner-certifications" SET LOGGED;
ALTER TABLE "badge-partner-competences" SET LOGGED;
ALTER TABLE "certification-challenges" SET LOGGED;
ALTER TABLE "assessments" SET LOGGED;
ALTER TABLE "competence-evaluations" SET LOGGED;
ALTER TABLE "assessment-results" SET LOGGED;
ALTER TABLE "answers" SET LOGGED;
ALTER TABLE "feedbacks" SET LOGGED;
ALTER TABLE "competence-marks" SET LOGGED;
ALTER TABLE "knowledge-elements" SET LOGGED;



ROLLBACK;
