SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP TABLE IF EXISTS "public"."knowledge-elements_bigint";

CREATE TABLE "public"."knowledge-elements_bigint" (
    id bigint NOT NULL,
    source character varying(255),
    status character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "answerId" bigint,
    "assessmentId" integer,
    "skillId" character varying(255),
    "earnedPix" real DEFAULT '0'::real NOT NULL,
    "userId" integer,
    "competenceId" character varying(255)
);

COPY public."knowledge-elements_bigint" (source, status, "createdAt", "answerId", "assessmentId", "skillId", "earnedPix", "userId", "competenceId", id) FROM stdin;
