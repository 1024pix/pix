-- ============================================================================
-- POC "Death to the KE" — vérification de la bascule
-- ----------------------------------------------------------------------------
-- Recalcule score et niveau des deux façons — depuis les knowledge elements,
-- puis depuis l'état de connaissance — et compare, utilisateur par utilisateur
-- et compétence par compétence.
--
-- À exécuter APRÈS le backfill et AVANT de vider `knowledge-elements`, tant que
-- les deux représentations coexistent.
--
-- Reproduit `scoring-service.js` :
--   score  = min(floor(somme des pixValue des acquis validés), 8 × MAX_REACHABLE_LEVEL)
--   niveau = min(floor(somme exacte / 8), MAX_REACHABLE_LEVEL)
-- ============================================================================

\set ON_ERROR_STOP on
\timing on

\set max_reachable_level 8
\set pix_count_by_level 8
\set max_pix_by_competence 64

-- ---------------------------------------------------------------------------
-- Score tel que le modèle historique le calcule : somme des pixValue courantes
-- des acquis validés. On lit `pixValue` et non `earnedPix`, les deux modèles
-- devant être comparés à référentiel identique.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE verif_depuis_ke AS
WITH dedup AS (
  SELECT DISTINCT ON (ke."userId", ke."skillId")
         ke."userId", ke."skillId", ke.status
  FROM "knowledge-elements" ke
  ORDER BY ke."userId", ke."skillId", ke."createdAt" DESC
)
SELECT d."userId", s."competenceId", sum(s."pixValue")::numeric AS pix_exact
FROM dedup d
JOIN learningcontent.skills s ON s.id = d."skillId"
WHERE d.status = 'validated'
GROUP BY 1, 2;

-- ---------------------------------------------------------------------------
-- Score tel que le nouveau modèle le calcule : les acquis situés sous le
-- plancher de leur tube sont validés.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE verif_depuis_etat AS
SELECT ks."userId", s."competenceId", sum(s."pixValue")::numeric AS pix_exact
FROM "knowledge-states" ks
JOIN learningcontent.skills s
  ON s."tubeId" = ks."tubeId"
 AND s.level <= ks.floor
 AND s.status = 'actif'
GROUP BY 1, 2;

\echo ''
\echo '=== Score et niveau par utilisateur et compétence ==='

WITH compare AS (
  SELECT COALESCE(k."userId", e."userId") AS "userId",
         COALESCE(k."competenceId", e."competenceId") AS "competenceId",
         LEAST(floor(COALESCE(k.pix_exact, 0)), :max_pix_by_competence) AS score_ke,
         LEAST(floor(COALESCE(e.pix_exact, 0)), :max_pix_by_competence) AS score_etat,
         LEAST(floor(COALESCE(k.pix_exact, 0) / :pix_count_by_level), :max_reachable_level) AS niveau_ke,
         LEAST(floor(COALESCE(e.pix_exact, 0) / :pix_count_by_level), :max_reachable_level) AS niveau_etat
  FROM verif_depuis_ke k
  FULL OUTER JOIN verif_depuis_etat e
    ON e."userId" = k."userId" AND e."competenceId" = k."competenceId"
)
SELECT count(*) AS couples_compares,
       count(*) FILTER (WHERE score_ke = score_etat) AS score_identique,
       count(*) FILTER (WHERE score_ke <> score_etat) AS score_different,
       count(*) FILTER (WHERE niveau_ke = niveau_etat) AS niveau_identique,
       count(*) FILTER (WHERE niveau_ke <> niveau_etat) AS niveau_different,
       COALESCE(max(abs(score_ke - score_etat)), 0) AS ecart_max
FROM compare;

\echo '--- Détail des écarts, s il y en a ---'
WITH compare AS (
  SELECT COALESCE(k."userId", e."userId") AS "userId",
         COALESCE(k."competenceId", e."competenceId") AS "competenceId",
         LEAST(floor(COALESCE(k.pix_exact, 0)), :max_pix_by_competence) AS score_ke,
         LEAST(floor(COALESCE(e.pix_exact, 0)), :max_pix_by_competence) AS score_etat
  FROM verif_depuis_ke k
  FULL OUTER JOIN verif_depuis_etat e
    ON e."userId" = k."userId" AND e."competenceId" = k."competenceId"
)
SELECT "userId", "competenceId", score_ke, score_etat, score_etat - score_ke AS ecart
FROM compare WHERE score_ke <> score_etat
ORDER BY abs(score_etat - score_ke) DESC LIMIT 20;

\echo ''
\echo '=== Score Pix global par utilisateur ==='

WITH par_user AS (
  SELECT COALESCE(k."userId", e."userId") AS "userId",
         sum(LEAST(floor(COALESCE(k.pix_exact, 0)), :max_pix_by_competence)) AS total_ke,
         sum(LEAST(floor(COALESCE(e.pix_exact, 0)), :max_pix_by_competence)) AS total_etat
  FROM verif_depuis_ke k
  FULL OUTER JOIN verif_depuis_etat e
    ON e."userId" = k."userId" AND e."competenceId" = k."competenceId"
  GROUP BY 1
)
SELECT count(*) AS users,
       count(*) FILTER (WHERE total_ke = total_etat) AS score_identique,
       count(*) FILTER (WHERE total_ke <> total_etat) AS score_different,
       COALESCE(max(abs(total_ke - total_etat)), 0) AS ecart_max
FROM par_user;

\echo ''
\echo '=== Certifiabilité : au moins 5 compétences de niveau >= 1 ==='

WITH par_user AS (
  SELECT COALESCE(k."userId", e."userId") AS "userId",
         count(*) FILTER (
           WHERE LEAST(floor(COALESCE(k.pix_exact, 0) / :pix_count_by_level), :max_reachable_level) >= 1
         ) >= 5 AS certifiable_ke,
         count(*) FILTER (
           WHERE LEAST(floor(COALESCE(e.pix_exact, 0) / :pix_count_by_level), :max_reachable_level) >= 1
         ) >= 5 AS certifiable_etat
  FROM verif_depuis_ke k
  FULL OUTER JOIN verif_depuis_etat e
    ON e."userId" = k."userId" AND e."competenceId" = k."competenceId"
  GROUP BY 1
)
SELECT count(*) AS users,
       count(*) FILTER (WHERE NOT certifiable_ke AND certifiable_etat) AS deviennent_certifiables,
       count(*) FILTER (WHERE certifiable_ke AND NOT certifiable_etat) AS perdent_certifiabilite
FROM par_user;

\echo ''
\echo '=== L écart s explique-t-il entièrement par la monotonie ? ==='
-- La monotonie comble les trous : les acquis situés sous le plancher d un tube
-- deviennent validés même si l utilisateur ne les a jamais réussis. Si le
-- modèle est correct, l écart de score vaut EXACTEMENT la somme des pixValue de
-- ces acquis — ni plus, ni moins. Toute ligne restante signale un défaut.

CREATE TEMP TABLE verif_trous AS
WITH dedup AS (
  SELECT DISTINCT ON (ke."userId", ke."skillId") ke."userId", ke."skillId", ke.status
  FROM "knowledge-elements" ke
  ORDER BY ke."userId", ke."skillId", ke."createdAt" DESC
),
valides AS (
  SELECT "userId", "skillId" FROM dedup WHERE status = 'validated'
)
SELECT ks."userId", s."competenceId", sum(s."pixValue")::numeric AS pix_comble
FROM "knowledge-states" ks
JOIN learningcontent.skills s
  ON s."tubeId" = ks."tubeId"
 AND s.level <= ks.floor
 AND s.status = 'actif'
LEFT JOIN valides v ON v."userId" = ks."userId" AND v."skillId" = s.id
WHERE v."skillId" IS NULL
GROUP BY 1, 2;

WITH compare AS (
  SELECT COALESCE(k."userId", e."userId") AS "userId",
         COALESCE(k."competenceId", e."competenceId") AS "competenceId",
         COALESCE(e.pix_exact, 0) - COALESCE(k.pix_exact, 0) AS ecart_constate,
         COALESCE(t.pix_comble, 0) AS ecart_explique
  FROM verif_depuis_ke k
  FULL OUTER JOIN verif_depuis_etat e
    ON e."userId" = k."userId" AND e."competenceId" = k."competenceId"
  LEFT JOIN verif_trous t
    ON t."userId" = COALESCE(k."userId", e."userId")
   AND t."competenceId" = COALESCE(k."competenceId", e."competenceId")
)
SELECT count(*) AS couples_compares,
       count(*) FILTER (WHERE abs(ecart_constate - ecart_explique) < 0.001) AS ecart_entierement_explique,
       count(*) FILTER (WHERE abs(ecart_constate - ecart_explique) >= 0.001) AS ecart_inexplique,
       COALESCE(max(abs(ecart_constate - ecart_explique)), 0) AS residu_max
FROM compare;
