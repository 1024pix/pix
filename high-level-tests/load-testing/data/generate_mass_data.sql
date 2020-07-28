BEGIN;

-----------------------------------------------------------------------------------------------------
--				Recalage des séquences       --------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users','id'), coalesce(max("id"), 1), max("id") IS NOT null) FROM "users";

-----------------------------------------------------------------------------------------------------
--				Déclaration de constantes   ---------------------------------------------------------------
-----------------------------------------------------------------------------------------------------
SET LOCAL constants.user_count=1000;
SET LOCAL constants.string_count=20000;


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


-----------------------------------------------------------------------------------------------------
--				Création et remplissage d'une table de chaînes aléatoires composées de 3 syllabes   -------
-----------------------------------------------------------------------------------------------------
CREATE TEMPORARY TABLE random_string (
  id SERIAL PRIMARY KEY,
  rand_str VARCHAR
) ON COMMIT DROP;
INSERT INTO random_string(id, rand_str)
SELECT
  generator AS id,
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
CREATE TEMPORARY TABLE inserted_user_ids (
  user_id INTEGER
) ON COMMIT DROP;
WITH inserted_user_ids_cte AS (
  INSERT INTO users("firstName", "lastName", "email", "password")
  SELECT
    r_s_a.rand_str,
    r_s_b.rand_str,
    r_s_a.rand_str || '.' || r_s_b.rand_str || (currval(pg_get_serial_sequence('users','id'))+1) || '@example.net',
    'default_password'
  FROM (
    SELECT (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as first_name_id
    ),
    (
      SELECT (random() * current_setting('constants.string_count')::int)::int + (generator*0) as last_name_id
    ),
      generator as id
    FROM generate_series(1,current_setting('constants.user_count')::int) as generator
  ) id_picker
  INNER JOIN random_string as r_s_a ON r_s_a.id = id_picker.first_name_id
  INNER JOIN random_string as r_s_b ON r_s_b.id = id_picker.last_name_id
  RETURNING id AS user_id
)
INSERT INTO inserted_user_ids(user_id)
SELECT * FROM inserted_user_ids_cte;
CREATE INDEX ON inserted_user_ids(user_id);


-----------------------------------------------------------------------------------------------------
--				Rétablir les contraintes   ----------------------------------------------------------
-----------------------------------------------------------------------------------------------------
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_samlid_unique" UNIQUE ("samlId");
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE ("username");


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



