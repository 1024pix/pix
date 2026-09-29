-- ============================================================================
-- POC "Death to the KE" — bascule vers l'état de connaissance
-- ----------------------------------------------------------------------------
-- Matérialise `knowledge-states` à partir de la table `knowledge-elements`.
--
-- Pourquoi partir des knowledge elements et non des réponses : les réponses
-- sont purgées au bout d'un certain temps, les knowledge elements non. Eux
-- seuls décrivent encore l'état des utilisateurs anciens.
--
-- À exécuter AVANT de basculer les écritures. Sans lui, un utilisateur inactif
-- dont les réponses ont été purgées perdrait son état : la reconstruction à la
-- volée ne se déclenche qu'à sa prochaine réponse.
--
-- Idempotent : relançable sans effet de bord (ON CONFLICT ... DO UPDATE).
--
-- Usage :
--   psql "$DATABASE_URL" -v batch_size=50000 -f 02-backfill.sql
-- ============================================================================

\set ON_ERROR_STOP on
\timing on

\if :{?batch_size}
\else
  \set batch_size 50000
\endif

-- Knowledge elements dédupliqués, comme le fait la lecture applicative
-- (`KnowledgeElement.toLatestUniqNonResetCollection`) : un par couple
-- utilisateur/acquis, le plus récent, hors statut 'reset'.
\echo '=== Déduplication des knowledge elements ==='

CREATE TEMP TABLE backfill_ke AS
WITH dedup AS (
  SELECT DISTINCT ON (ke."userId", ke."skillId")
         ke."userId", ke."skillId", ke.status, ke.source, ke."createdAt"
  FROM "knowledge-elements" ke
  ORDER BY ke."userId", ke."skillId", ke."createdAt" DESC
)
SELECT d."userId", d.status, d.source, d."createdAt",
       s.level,
       s."tubeId"
FROM dedup d
JOIN learningcontent.skills s ON s.id = d."skillId"
WHERE d.status <> 'reset'
  AND s."tubeId" IS NOT NULL;

CREATE INDEX ON backfill_ke ("userId", "tubeId");
ANALYZE backfill_ke;

\echo '=== Agrégation par tube ==='

CREATE TEMP TABLE backfill_state AS
SELECT "userId",
       "tubeId",
       COALESCE(max(level) FILTER (WHERE status = 'validated'), 0) AS floor,
       min(level) FILTER (WHERE status = 'invalidated') AS ceiling,
       COALESCE(
         array_agg(DISTINCT level) FILTER (WHERE source = 'direct'),
         '{}'
       ) AS "directLevels",
       max("createdAt") AS "updatedAt"
FROM backfill_ke
GROUP BY "userId", "tubeId";

ANALYZE backfill_state;

\echo '--- Contrôle : l invariant plancher < plafond est-il respecté ? ---'
-- Une violation signale un état contradictoire hérité de plusieurs assessments.
-- Le plafond est alors relevé au-dessus du plancher : la validation gagne, comme
-- lorsque la lecture applicative retient le knowledge element le plus récent.
SELECT count(*) AS etats_contradictoires
FROM backfill_state
WHERE ceiling IS NOT NULL AND ceiling <= floor;

UPDATE backfill_state SET ceiling = NULL
WHERE ceiling IS NOT NULL AND ceiling <= floor;

\echo '=== Écriture de knowledge-states ==='

INSERT INTO "knowledge-states" ("userId", "tubeId", floor, ceiling, "directLevels", "updatedAt")
SELECT "userId", "tubeId", floor, ceiling, "directLevels", "updatedAt"
FROM backfill_state
ON CONFLICT ("userId", "tubeId") DO UPDATE SET
  floor = EXCLUDED.floor,
  ceiling = EXCLUDED.ceiling,
  "directLevels" = EXCLUDED."directLevels",
  "updatedAt" = EXCLUDED."updatedAt";

\echo '=== Résultat ==='
SELECT
  (SELECT count(*) FROM "knowledge-elements") AS ke_avant,
  (SELECT count(*) FROM "knowledge-states") AS etats_apres,
  round(
    (SELECT count(*) FROM "knowledge-elements")::numeric
    / NULLIF((SELECT count(*) FROM "knowledge-states"), 0)
  , 2) AS facteur_de_compression,
  (SELECT count(DISTINCT "userId") FROM "knowledge-states") AS users_couverts;

\echo '--- Contrôle : utilisateurs ayant des knowledge elements mais aucun état ---'
-- Un utilisateur peut légitimement rester sans état : si tous ses knowledge
-- elements portent sur des acquis disparus du référentiel, il n a déjà
-- aujourd hui ni score ni niveau. Seule la colonne `perte_reelle` doit valoir 0.
WITH non_couverts AS (
  SELECT DISTINCT ke."userId" FROM "knowledge-elements" ke
  EXCEPT
  SELECT DISTINCT ks."userId" FROM "knowledge-states" ks
)
SELECT
  (SELECT count(*) FROM non_couverts) AS users_non_couverts,
  count(*) FILTER (WHERE s.id IS NULL) AS ke_sur_acquis_disparu,
  count(*) FILTER (WHERE s.id IS NOT NULL AND s.level IS NULL) AS ke_sur_acquis_sans_niveau,
  count(*) FILTER (
    WHERE s.id IS NOT NULL AND s.level IS NOT NULL AND ke.status <> 'reset'
  ) AS perte_reelle
FROM "knowledge-elements" ke
JOIN non_couverts n ON n."userId" = ke."userId"
LEFT JOIN learningcontent.skills s ON s.id = ke."skillId";
