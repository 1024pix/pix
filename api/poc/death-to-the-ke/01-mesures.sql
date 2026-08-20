-- ============================================================================
-- POC "Death to the KE" — mesures preparatoires
-- ----------------------------------------------------------------------------
-- Objectif : chiffrer, AVANT toute ligne de code, le gain reel du passage
-- d'un modele "knowledge element" a un modele "etat de connaissance par tube",
-- et l'ecart fonctionnel que ce passage induit.
--
-- Lecture seule. Aucune ecriture, aucun DDL hors tables TEMP.
--
-- Usage :
--   psql -v sample_pct=0.5 -f 01-mesures.sql
--   (sample_pct = pourcentage de la table users echantillonne ; 100 en local)
--
-- Hypotheses :
--   - le schema learningcontent.skills est disponible sur l'instance interrogee
--   - la deduplication reproduit KnowledgeElement.toLatestUniqNonResetCollection :
--     un seul KE par (userId, skillId), le plus recent, hors status 'reset'
-- ============================================================================

\set ON_ERROR_STOP on
\timing on

-- Valeur par defaut si -v sample_pct n'est pas fourni
\if :{?sample_pct}
\else
  \set sample_pct 100
\endif

\echo '=== Echantillon : ' :sample_pct '% des users ==='

CREATE TEMP TABLE poc_users AS
SELECT id FROM users TABLESAMPLE SYSTEM (:sample_pct);
CREATE INDEX ON poc_users (id);
ANALYZE poc_users;

-- KE dedupliques de l'echantillon, enrichis du referentiel.
-- ATTENTION : le JOIN sur skills exclut les KE portant un skillId disparu du
-- referentiel. M1b mesure combien on en perd.
CREATE TEMP TABLE poc_ke AS
WITH dedup AS (
  SELECT DISTINCT ON (ke."userId", ke."skillId")
         ke."userId", ke."skillId", ke.status, ke.source, ke."earnedPix", ke."createdAt"
  FROM "knowledge-elements" ke
  JOIN poc_users u ON u.id = ke."userId"
  ORDER BY ke."userId", ke."skillId", ke."createdAt" DESC
)
SELECT d."userId", d."skillId", d.status, d.source, d."earnedPix", d."createdAt",
       s."tubeId", s.level, s."competenceId", s."pixValue"
FROM dedup d
JOIN learningcontent.skills s ON s.id = d."skillId"
WHERE d.status <> 'reset';
CREATE INDEX ON poc_ke ("userId", "tubeId");
CREATE INDEX ON poc_ke ("userId", "competenceId");
ANALYZE poc_ke;

-- ============================================================================
-- M1 — Volumetrie et gain de compression
-- ----------------------------------------------------------------------------
-- Combien de lignes on stocke aujourd'hui, combien on en stockerait demain
-- (une ligne par couple user/tube touche).
-- ============================================================================
\echo ''
\echo '=== M1 — Volumetrie et gain de compression ==='

SELECT
  (SELECT count(*) FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId")
    AS ke_lignes_brutes,
  (SELECT count(*) FROM poc_ke)
    AS ke_lignes_dedupliquees,
  (SELECT count(DISTINCT ("userId", "tubeId")) FROM poc_ke)
    AS lignes_modele_cible,
  round(
    (SELECT count(*) FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId")::numeric
    / NULLIF((SELECT count(DISTINCT ("userId", "tubeId")) FROM poc_ke), 0)
  , 2) AS facteur_de_compression,
  pg_size_pretty(pg_total_relation_size('"knowledge-elements"')) AS taille_table_totale;

\echo '--- M1b — part des lignes brutes perdues par la deduplication et le referentiel ---'
SELECT
  (SELECT count(*) FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId") AS brutes,
  (SELECT count(*) FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId"
     LEFT JOIN learningcontent.skills s ON s.id = ke."skillId" WHERE s.id IS NULL) AS skill_absent_du_referentiel,
  (SELECT count(*) FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId"
     WHERE ke.status = 'reset') AS status_reset;

\echo '--- M1c — distribution du nombre de KE par user (le chiffre "295 KE / user") ---'
SELECT
  count(*) AS nb_users_avec_ke,
  round(avg(nb), 1) AS moyenne_ke,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY nb) AS mediane_ke,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY nb) AS p95_ke,
  max(nb) AS max_ke,
  round(avg(nb_tubes), 1) AS moyenne_tubes,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY nb_tubes) AS p95_tubes
FROM (
  SELECT "userId", count(*) AS nb, count(DISTINCT "tubeId") AS nb_tubes
  FROM poc_ke GROUP BY 1
) t;

-- ============================================================================
-- M2 — Repartition source / status
-- ----------------------------------------------------------------------------
-- Les KE "direct" sont redondants avec les answers : c'est la part "inferred"
-- qui justifie l'existence d'un etat persiste.
-- ============================================================================
\echo ''
\echo '=== M2 — Repartition source / status (apres deduplication) ==='

SELECT source, status, count(*) AS nb,
       round(100.0 * count(*) / SUM(count(*)) OVER (), 1) AS pct
FROM poc_ke GROUP BY 1, 2 ORDER BY 3 DESC;

\echo '--- M2b — reecritures : combien de KE brutes par couple (user, skill) ---'
SELECT nb_versions, count(*) AS nb_couples_user_skill,
       round(100.0 * count(*) / SUM(count(*)) OVER (), 2) AS pct
FROM (
  SELECT ke."userId", ke."skillId", count(*) AS nb_versions
  FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId"
  GROUP BY 1, 2
) t GROUP BY 1 ORDER BY 1 LIMIT 20;

-- ============================================================================
-- M3 — Profils a trous
-- ----------------------------------------------------------------------------
-- Ecart n.1 du nouveau modele : la monotonie forcee comble les trous.
-- Un "trou" = un acquis actif du referentiel situe SOUS le niveau max valide
-- du tube, et qui n'est pas valide pour l'utilisateur (invalide ou jamais vu).
-- ============================================================================
\echo ''
\echo '=== M3 — Profils a trous ==='

CREATE TEMP TABLE poc_plancher AS
SELECT "userId", "tubeId", max(level) AS niveau_max
FROM poc_ke WHERE status = 'validated'
GROUP BY 1, 2;
CREATE INDEX ON poc_plancher ("userId", "tubeId");
ANALYZE poc_plancher;

-- Acquis que la monotonie offrirait gratuitement
CREATE TEMP TABLE poc_trous AS
SELECT p."userId", p."tubeId", s."competenceId", s.id AS "skillId", s.level, s."pixValue",
       CASE WHEN k."skillId" IS NULL THEN 'jamais_teste' ELSE 'invalide' END AS origine
FROM poc_plancher p
JOIN learningcontent.skills s
  ON s."tubeId" = p."tubeId" AND s.level < p.niveau_max AND s.status = 'actif'
LEFT JOIN poc_ke k
  ON k."userId" = p."userId" AND k."skillId" = s.id AND k.status = 'validated'
WHERE k."skillId" IS NULL;
CREATE INDEX ON poc_trous ("userId", "competenceId");
ANALYZE poc_trous;

SELECT
  (SELECT count(DISTINCT "userId") FROM poc_plancher) AS users_evalues,
  (SELECT count(DISTINCT "userId") FROM poc_trous) AS users_avec_trous,
  round(100.0 * (SELECT count(DISTINCT "userId") FROM poc_trous)
        / NULLIF((SELECT count(DISTINCT "userId") FROM poc_plancher), 0), 2) AS pct_users_avec_trous,
  (SELECT count(*) FROM poc_trous) AS nb_trous_total;

\echo '--- M3b — nature des trous ---'
SELECT origine, count(*) AS nb, round(100.0 * count(*) / SUM(count(*)) OVER (), 1) AS pct
FROM poc_trous GROUP BY 1 ORDER BY 2 DESC;

-- ============================================================================
-- M4 — Impact de la monotonie sur le score et le niveau
-- ----------------------------------------------------------------------------
-- Reproduit scoring-service.js :
--   score competence  = min(floor(somme des pixValue), MAX_REACHABLE_PIX_BY_COMPETENCE)
--   niveau competence = min(floor(somme exacte / 8), MAX_REACHABLE_LEVEL)
-- MAX_REACHABLE_LEVEL = 8 en production => plafond pix = 64.
-- ============================================================================
\echo ''
\echo '=== M4 — Impact de la monotonie sur score et niveau ==='

\set max_reachable_level 8
\set pix_count_by_level 8
\set max_pix_by_competence 64

CREATE TEMP TABLE poc_scores AS
WITH actuel AS (
  SELECT "userId", "competenceId", sum("earnedPix")::numeric AS pix_exact
  FROM poc_ke WHERE status = 'validated' GROUP BY 1, 2
),
gain AS (
  SELECT "userId", "competenceId", sum("pixValue")::numeric AS pix_gagne
  FROM poc_trous GROUP BY 1, 2
)
SELECT a."userId", a."competenceId",
       a.pix_exact,
       a.pix_exact + COALESCE(g.pix_gagne, 0) AS pix_exact_cible,
       LEAST(floor(a.pix_exact), :max_pix_by_competence) AS score_actuel,
       LEAST(floor(a.pix_exact + COALESCE(g.pix_gagne, 0)), :max_pix_by_competence) AS score_cible,
       LEAST(floor(a.pix_exact / :pix_count_by_level), :max_reachable_level) AS niveau_actuel,
       LEAST(floor((a.pix_exact + COALESCE(g.pix_gagne, 0)) / :pix_count_by_level), :max_reachable_level) AS niveau_cible
FROM actuel a
LEFT JOIN gain g ON g."userId" = a."userId" AND g."competenceId" = a."competenceId";
ANALYZE poc_scores;

SELECT
  count(*) AS couples_user_competence,
  count(*) FILTER (WHERE score_cible <> score_actuel) AS nb_score_modifie,
  round(100.0 * count(*) FILTER (WHERE score_cible <> score_actuel) / NULLIF(count(*), 0), 2) AS pct_score_modifie,
  count(*) FILTER (WHERE niveau_cible <> niveau_actuel) AS nb_niveau_modifie,
  round(100.0 * count(*) FILTER (WHERE niveau_cible <> niveau_actuel) / NULLIF(count(*), 0), 2) AS pct_niveau_modifie,
  round(avg(score_cible - score_actuel) FILTER (WHERE score_cible <> score_actuel), 2) AS delta_score_moyen,
  max(score_cible - score_actuel) AS delta_score_max
FROM poc_scores;

\echo '--- M4b — impact sur le score Pix global par utilisateur ---'
SELECT
  count(*) AS nb_users,
  count(*) FILTER (WHERE total_cible <> total_actuel) AS nb_users_score_modifie,
  round(100.0 * count(*) FILTER (WHERE total_cible <> total_actuel) / NULLIF(count(*), 0), 2) AS pct,
  round(avg(total_cible - total_actuel) FILTER (WHERE total_cible <> total_actuel), 2) AS delta_moyen,
  max(total_cible - total_actuel) AS delta_max
FROM (
  SELECT "userId", sum(score_actuel) AS total_actuel, sum(score_cible) AS total_cible
  FROM poc_scores GROUP BY 1
) t;

-- ============================================================================
-- M5 — Bascule de certifiabilite
-- ----------------------------------------------------------------------------
-- MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY = 5 competences a niveau >= 1.
-- Fonction a seuil : c'est ici qu'un ecart de quelques pix devient visible.
-- NB : approximation, la certifiabilite reelle se restreint aux competences
-- du referentiel Pix coeur et depend d'autres regles.
-- ============================================================================
\echo ''
\echo '=== M5 — Bascule de certifiabilite (approximation) ==='

SELECT
  count(*) AS nb_users,
  count(*) FILTER (WHERE NOT certifiable_actuel AND certifiable_cible) AS deviennent_certifiables,
  count(*) FILTER (WHERE certifiable_actuel AND NOT certifiable_cible) AS perdent_certifiabilite,
  round(100.0 * count(*) FILTER (WHERE certifiable_actuel <> certifiable_cible) / NULLIF(count(*), 0), 3) AS pct_bascule
FROM (
  SELECT "userId",
         count(*) FILTER (WHERE niveau_actuel >= 1) >= 5 AS certifiable_actuel,
         count(*) FILTER (WHERE niveau_cible  >= 1) >= 5 AS certifiable_cible
  FROM poc_scores GROUP BY 1
) t;

-- ============================================================================
-- M6 — Desynchronisation earnedPix (fige) / pixValue (vivante)
-- ----------------------------------------------------------------------------
-- Ecart n.2 du nouveau modele : recalculer au referentiel courant plutot que
-- lire une valeur figee a l'ecriture du KE.
-- ============================================================================
\echo ''
\echo '=== M6 — Desynchronisation earnedPix / pixValue ==='

SELECT
  count(*) AS ke_valides,
  count(*) FILTER (WHERE abs("earnedPix" - "pixValue") > 0.0001) AS nb_desynchronises,
  round(100.0 * count(*) FILTER (WHERE abs("earnedPix" - "pixValue") > 0.0001) / NULLIF(count(*), 0), 2) AS pct,
  round(max(abs("earnedPix" - "pixValue"))::numeric, 4) AS ecart_max_unitaire
FROM poc_ke WHERE status = 'validated';

\echo '--- M6b — impact cumule de la resynchronisation, par user/competence ---'
SELECT
  count(*) AS couples_user_competence,
  count(*) FILTER (WHERE score_resync <> score_fige) AS nb_score_modifie,
  round(100.0 * count(*) FILTER (WHERE score_resync <> score_fige) / NULLIF(count(*), 0), 2) AS pct,
  round(avg(score_resync - score_fige) FILTER (WHERE score_resync <> score_fige), 2) AS delta_moyen,
  max(abs(score_resync - score_fige)) AS delta_abs_max
FROM (
  SELECT "userId", "competenceId",
         LEAST(floor(sum("earnedPix")::numeric), :max_pix_by_competence) AS score_fige,
         LEAST(floor(sum("pixValue")::numeric),  :max_pix_by_competence) AS score_resync
  FROM poc_ke WHERE status = 'validated' GROUP BY 1, 2
) t;

\echo ''
\echo '=== Fin des mesures ==='

-- ============================================================================
-- M7 — Cout de lecture du modele cible
-- ----------------------------------------------------------------------------
-- Dans le modele cible, l'algo ne lit plus les KE directs mais les answers.
-- Le gain en perf de lecture depend donc du ratio answers/KE par utilisateur.
-- ATTENTION : le data-fetcher actuel ne charge que les answers de l'assessment
-- courant, alors que les KE couvrent tout l'historique de l'utilisateur. Il
-- faudra charger les answers de TOUS ses assessments : c'est ce que mesure M7.
-- Si answers_moy >= ke_moy, le gain de lecture s'inverse et le modele cible
-- coute plus cher que l'actuel.
-- ============================================================================
\echo ''
\echo '=== M7 — Cout de lecture : answers (tous assessments) vs KE ==='

WITH par_user AS (
  SELECT ass."userId",
         count(DISTINCT a.id) AS nb_answers,
         count(DISTINCT ass.id) AS nb_assessments
  FROM answers a
  JOIN assessments ass ON ass.id = a."assessmentId"
  JOIN poc_users u ON u.id = ass."userId"
  GROUP BY 1
), ke_user AS (
  SELECT k."userId", count(*) AS nb_ke
  FROM "knowledge-elements" k JOIN poc_users u ON u.id = k."userId"
  GROUP BY 1
)
SELECT count(*) AS nb_users,
       round(avg(p.nb_answers), 1) AS answers_moy,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY p.nb_answers) AS answers_p95,
       max(p.nb_answers) AS answers_max,
       round(avg(k.nb_ke), 1) AS ke_moy,
       percentile_cont(0.95) WITHIN GROUP (ORDER BY k.nb_ke) AS ke_p95,
       round(avg(p.nb_assessments), 1) AS assessments_moy,
       round(avg(k.nb_ke)::numeric / NULLIF(avg(p.nb_answers)::numeric, 0), 2) AS ratio_ke_sur_answers
FROM par_user p JOIN ke_user k ON k."userId" = p."userId";

\echo '--- M7b — taille des tables concernees ---'
SELECT relname,
       pg_size_pretty(pg_total_relation_size(oid)) AS taille,
       reltuples::bigint AS lignes_estimees
FROM pg_class
WHERE relname IN ('knowledge-elements', 'answers', 'assessments', 'knowledge-element-snapshots')
ORDER BY pg_total_relation_size(oid) DESC;

-- ============================================================================
-- M8 — Reconstructibilite des KE directs depuis les answers
-- ----------------------------------------------------------------------------
-- Condition necessaire a l'iso-comportement de l'algorithme : cat-algorithm.js
-- ne consomme que les KE de source 'direct' pour calculer le niveau predit.
-- Si la bijection KE direct <-> answer est parfaite, l'algo peut se rebrancher
-- sur les answers et l'etat par tube n'a plus a porter que les inferences.
-- ============================================================================
\echo ''
\echo '=== M8 — Reconstructibilite des KE directs depuis les answers ==='

\echo '--- M8a — bijection KE direct / answer ---'
SELECT ke.source,
       count(*) AS nb,
       count(*) FILTER (WHERE ke."answerId" IS NULL) AS sans_answer,
       count(DISTINCT ke."answerId") AS answers_distinctes
FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId"
GROUP BY 1;

\echo '--- M8b — plusieurs KE directs pour une meme answer ? (attendu : uniquement 1) ---'
SELECT nb_ke_par_answer, count(*) AS nb_answers
FROM (
  SELECT ke."answerId", count(*) AS nb_ke_par_answer
  FROM "knowledge-elements" ke JOIN poc_users u ON u.id = ke."userId"
  WHERE ke.source = 'direct' AND ke."answerId" IS NOT NULL
  GROUP BY 1
) t GROUP BY 1 ORDER BY 1;

\echo '--- M8c — le skillId du KE correspond-il au skill du challenge repondu ? ---'
-- Une divergence signalerait qu un challenge a change de skill dans le LCMS :
-- la reconstruction depuis les answers donnerait alors un resultat different.
SELECT count(*) AS ke_verifiables,
       count(*) FILTER (WHERE ke."skillId" = c."skillId") AS skill_identique,
       count(*) FILTER (WHERE ke."skillId" IS DISTINCT FROM c."skillId") AS skill_different
FROM "knowledge-elements" ke
JOIN poc_users u ON u.id = ke."userId"
JOIN answers a ON a.id = ke."answerId"
JOIN learningcontent.challenges c ON c.id = a."challengeId"
WHERE ke.source = 'direct';

\echo '--- M8d — le status du KE correspond-il au result de l answer ? ---'
SELECT a.result, ke.status, count(*) AS nb
FROM "knowledge-elements" ke
JOIN poc_users u ON u.id = ke."userId"
JOIN answers a ON a.id = ke."answerId"
WHERE ke.source = 'direct'
GROUP BY 1, 2 ORDER BY 3 DESC;
