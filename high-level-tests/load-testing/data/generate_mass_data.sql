BEGIN;

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



