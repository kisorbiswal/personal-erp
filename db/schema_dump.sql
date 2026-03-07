--
-- PostgreSQL database dump
--

\restrict KliOYelNPUKNCcPapVAbp6CLnXHTuJtlq05bTWbexl2WNUHyRr37dZaAPsKvTWu

-- Dumped from database version 16.12 (Debian 16.12-1.pgdg13+1)
-- Dumped by pg_dump version 16.12 (Debian 16.12-1.pgdg13+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: personal_erp
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO personal_erp;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: personal_erp
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Board; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."Board" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    config jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Board" OWNER TO personal_erp;

--
-- Name: BoardPin; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."BoardPin" (
    id text NOT NULL,
    "boardId" text NOT NULL,
    "eventId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."BoardPin" OWNER TO personal_erp;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "occurredAt" timestamp(3) without time zone NOT NULL,
    "ingestedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    content text NOT NULL,
    source text,
    "sourceRef" text,
    "deletedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Event" OWNER TO personal_erp;

--
-- Name: EventTag; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."EventTag" (
    id text NOT NULL,
    "eventId" text NOT NULL,
    "tagId" text NOT NULL
);


ALTER TABLE public."EventTag" OWNER TO personal_erp;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    "userId" text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Tag" OWNER TO personal_erp;

--
-- Name: User; Type: TABLE; Schema: public; Owner: personal_erp
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO personal_erp;

--
-- Name: BoardPin BoardPin_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."BoardPin"
    ADD CONSTRAINT "BoardPin_pkey" PRIMARY KEY (id);


--
-- Name: Board Board_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Board"
    ADD CONSTRAINT "Board_pkey" PRIMARY KEY (id);


--
-- Name: EventTag EventTag_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."EventTag"
    ADD CONSTRAINT "EventTag_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: BoardPin_boardId_eventId_key; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE UNIQUE INDEX "BoardPin_boardId_eventId_key" ON public."BoardPin" USING btree ("boardId", "eventId");


--
-- Name: BoardPin_eventId_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "BoardPin_eventId_idx" ON public."BoardPin" USING btree ("eventId");


--
-- Name: Board_userId_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "Board_userId_idx" ON public."Board" USING btree ("userId");


--
-- Name: Board_userId_name_key; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE UNIQUE INDEX "Board_userId_name_key" ON public."Board" USING btree ("userId", name);


--
-- Name: EventTag_eventId_tagId_key; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE UNIQUE INDEX "EventTag_eventId_tagId_key" ON public."EventTag" USING btree ("eventId", "tagId");


--
-- Name: EventTag_tagId_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "EventTag_tagId_idx" ON public."EventTag" USING btree ("tagId");


--
-- Name: Event_userId_deletedAt_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "Event_userId_deletedAt_idx" ON public."Event" USING btree ("userId", "deletedAt");


--
-- Name: Event_userId_occurredAt_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "Event_userId_occurredAt_idx" ON public."Event" USING btree ("userId", "occurredAt");


--
-- Name: Event_userId_source_sourceRef_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "Event_userId_source_sourceRef_idx" ON public."Event" USING btree ("userId", source, "sourceRef");


--
-- Name: Tag_userId_name_idx; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE INDEX "Tag_userId_name_idx" ON public."Tag" USING btree ("userId", name);


--
-- Name: Tag_userId_name_key; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE UNIQUE INDEX "Tag_userId_name_key" ON public."Tag" USING btree ("userId", name);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: personal_erp
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: BoardPin BoardPin_boardId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."BoardPin"
    ADD CONSTRAINT "BoardPin_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES public."Board"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BoardPin BoardPin_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."BoardPin"
    ADD CONSTRAINT "BoardPin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Board Board_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Board"
    ADD CONSTRAINT "Board_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventTag EventTag_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."EventTag"
    ADD CONSTRAINT "EventTag_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: EventTag EventTag_tagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."EventTag"
    ADD CONSTRAINT "EventTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES public."Tag"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Event Event_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tag Tag_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: personal_erp
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: personal_erp
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict KliOYelNPUKNCcPapVAbp6CLnXHTuJtlq05bTWbexl2WNUHyRr37dZaAPsKvTWu

