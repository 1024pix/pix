BEGIN;

-----------------------------------------------------------------------------------------------------
--				Recalage des séquences       --------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "users";
SELECT setval(pg_get_serial_sequence('assessments','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "assessments";
SELECT setval(pg_get_serial_sequence('organizations','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "organizations";
SELECT setval(pg_get_serial_sequence('memberships','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "memberships";


-----------------------------------------------------------------------------------------------------
--				Déclaration de constantes   ---------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SET LOCAL constants.user_count=1000;
SET LOCAL constants.string_count=20000;
SET LOCAL constants.competence_evaluation_count=3000;
SET LOCAL constants.organization_count=5;


-----------------------------------------------------------------------------------------------------
--				Création d'une table temporaire contenant le référentiel   --------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE referentiel (
  skill_id 		VARCHAR,
  competence_id VARCHAR,
  pix_value 	NUMERIC(6,5)
) ON COMMIT DROP;
INSERT INTO referentiel(skill_id, competence_id, pix_value)
VALUES
-- Ajouter les données du référentiel ici !

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
  user_id INTEGER
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
  RETURNING id AS user_id
)
INSERT INTO inserted_users(rownum, user_id)
SELECT
  row_number() OVER (),
  *
FROM inserted_users_cte;


-----------------------------------------------------------------------------------------------------
--				Ajout des assessments COMPETENCE_EVALUATION   ---------------------------------------------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE inserted_assessments (
  rownum SERIAL PRIMARY KEY,
  assessment_id INTEGER,
  user_id INTEGER,
  created_at TIMESTAMPTZ,
  type VARCHAR
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
INSERT INTO inserted_assessments(rownum, assessment_id, user_id, created_at, type)
SELECT
  row_number() OVER (),
  assessment_id,
  user_id,
  created_at,
  type
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
INSERT INTO inserted_administrators(rownum, administrator_id)
SELECT
  row_number() OVER (),
  *
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
INSERT INTO inserted_organizations(rownum, organization_id)
SELECT
  row_number() OVER (),
  *
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
INSERT INTO inserted_memberships(rownum, organization_id, administrator_id)
SELECT
  row_number() OVER (),
  organization_id,
  administrator_id
FROM inserted_memberships_cte;


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



