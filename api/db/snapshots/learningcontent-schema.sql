--
-- PostgreSQL database dump
--

\restrict mWQJIBXfzVJKdYxC8X6hDQwmb5OMzwn4ymdZGBvYoJOKQnfvPeRrOpnd1AaxoUd

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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

--
-- Name: pix; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE pix WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


\unrestrict mWQJIBXfzVJKdYxC8X6hDQwmb5OMzwn4ymdZGBvYoJOKQnfvPeRrOpnd1AaxoUd
\connect pix
\restrict mWQJIBXfzVJKdYxC8X6hDQwmb5OMzwn4ymdZGBvYoJOKQnfvPeRrOpnd1AaxoUd

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

--
-- Name: learningcontent; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA learningcontent;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: areas; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.areas (
    id character varying(255) NOT NULL,
    code character varying(255),
    name text,
    title_i18n jsonb,
    color character varying(255),
    "frameworkId" character varying(255),
    "competenceIds" text[]
);


--
-- Name: challenges; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.challenges (
    id character varying(255) NOT NULL,
    instruction text,
    "alternativeInstruction" text,
    proposals text,
    type character varying(255),
    solution text,
    "solutionToDisplay" text,
    "t1Status" boolean,
    "t2Status" boolean,
    "t3Status" boolean,
    status character varying(255),
    genealogy character varying(255),
    accessibility1 character varying(255),
    accessibility2 character varying(255),
    "requireGafamWebsiteAccess" boolean,
    "isIncompatibleIpadCertif" boolean,
    "deafAndHardOfHearing" character varying(255),
    "isAwarenessChallenge" boolean,
    "toRephrase" boolean,
    "alternativeVersion" integer,
    shuffled boolean,
    "illustrationAlt" text,
    "illustrationUrl" text,
    attachments text[],
    responsive character varying(255),
    alpha real,
    delta real,
    "autoReply" boolean,
    focusable boolean,
    format character varying(255),
    timer integer,
    "embedHeight" integer,
    "embedUrl" text,
    "embedTitle" text,
    locales text[],
    "competenceId" character varying(255),
    "skillId" character varying(255),
    "hasEmbedInternalValidation" boolean DEFAULT false,
    "noValidationNeeded" boolean DEFAULT false
);


--
-- Name: COLUMN challenges."hasEmbedInternalValidation"; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.challenges."hasEmbedInternalValidation" IS 'Indicates that the embed has internal rules to handle the challenge validation';


--
-- Name: COLUMN challenges."noValidationNeeded"; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.challenges."noValidationNeeded" IS 'Indicates that the challenge does not need any validation, i.e. contains only a video to watch or a text to read';


--
-- Name: competences; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.competences (
    id character varying(255) NOT NULL,
    name_i18n jsonb,
    description_i18n jsonb,
    index character varying(255),
    origin text,
    "areaId" character varying(255),
    "skillIds" text[],
    "thematicIds" text[]
);


--
-- Name: courses; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.courses (
    id character varying(255) NOT NULL,
    name text,
    description text,
    "isActive" boolean,
    competences text[],
    challenges text[]
);


--
-- Name: frameworks; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.frameworks (
    id character varying(255) NOT NULL,
    name text
);


--
-- Name: missions; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.missions (
    id integer NOT NULL,
    status character varying(255),
    name_i18n jsonb,
    content jsonb,
    "learningObjectives_i18n" jsonb,
    "validatedObjectives_i18n" jsonb,
    "introductionMediaType" character varying(255),
    "introductionMediaUrl" text,
    "introductionMediaAlt_i18n" jsonb,
    "documentationUrl" text,
    "cardImageUrl" text,
    "competenceId" character varying(255)
);


--
-- Name: modules; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "shortId" character varying(8) NOT NULL,
    slug character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    "isBeta" boolean DEFAULT true NOT NULL,
    visibility character varying(255) NOT NULL,
    image text NOT NULL,
    description text NOT NULL,
    duration integer NOT NULL,
    level character varying(255) NOT NULL,
    "tabletSupport" character varying(255) NOT NULL,
    objectives text[] NOT NULL,
    sections jsonb NOT NULL,
    glossary jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: COLUMN modules."shortId"; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules."shortId" IS 'used for permanent url';


--
-- Name: COLUMN modules.slug; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.slug IS 'used for user-friendly url';


--
-- Name: COLUMN modules."isBeta"; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules."isBeta" IS 'draft status of the module';


--
-- Name: COLUMN modules.visibility; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.visibility IS 'controls visibility in trainings configuration';


--
-- Name: COLUMN modules.image; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.image IS 'url';


--
-- Name: COLUMN modules.description; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.description IS 'may contain html content';


--
-- Name: COLUMN modules.duration; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.duration IS 'duration of the module in minutes';


--
-- Name: COLUMN modules."tabletSupport"; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules."tabletSupport" IS 'convenientness level of module reading on small screens';


--
-- Name: COLUMN modules.objectives; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.objectives IS 'objectives of the module. May contain html content';


--
-- Name: COLUMN modules.sections; Type: COMMENT; Schema: learningcontent; Owner: -
--

COMMENT ON COLUMN learningcontent.modules.sections IS 'main content of the module';


--
-- Name: skills; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.skills (
    id character varying(255) NOT NULL,
    name text,
    status character varying(255),
    "pixValue" real,
    version integer,
    level integer,
    "hintStatus" character varying(255),
    hint_i18n jsonb,
    "competenceId" character varying(255),
    "tubeId" character varying(255),
    "tutorialIds" text[],
    "learningMoreTutorialIds" text[]
);


--
-- Name: thematics; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.thematics (
    id character varying(255) NOT NULL,
    name_i18n jsonb,
    index integer,
    "competenceId" character varying(255),
    "tubeIds" text[]
);


--
-- Name: tubes; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.tubes (
    id character varying(255) NOT NULL,
    name text,
    title text,
    description text,
    "practicalTitle_i18n" jsonb,
    "practicalDescription_i18n" jsonb,
    "competenceId" character varying(255),
    "thematicId" character varying(255),
    "skillIds" text[],
    "isMobileCompliant" boolean,
    "isTabletCompliant" boolean
);


--
-- Name: tutorials; Type: TABLE; Schema: learningcontent; Owner: -
--

CREATE TABLE learningcontent.tutorials (
    id character varying(255) NOT NULL,
    duration character varying(255),
    format text,
    title text,
    source text,
    link text,
    locale character varying(255)
);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: competences competences_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.competences
    ADD CONSTRAINT competences_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: frameworks frameworks_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.frameworks
    ADD CONSTRAINT frameworks_pkey PRIMARY KEY (id);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: modules modules_shortid_unique; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.modules
    ADD CONSTRAINT modules_shortid_unique UNIQUE ("shortId");


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: thematics thematics_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.thematics
    ADD CONSTRAINT thematics_pkey PRIMARY KEY (id);


--
-- Name: tubes tubes_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.tubes
    ADD CONSTRAINT tubes_pkey PRIMARY KEY (id);


--
-- Name: tutorials tutorials_pkey; Type: CONSTRAINT; Schema: learningcontent; Owner: -
--

ALTER TABLE ONLY learningcontent.tutorials
    ADD CONSTRAINT tutorials_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict mWQJIBXfzVJKdYxC8X6hDQwmb5OMzwn4ymdZGBvYoJOKQnfvPeRrOpnd1AaxoUd

