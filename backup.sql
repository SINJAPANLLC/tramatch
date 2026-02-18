--
-- PostgreSQL database dump
--

\restrict Znd8SGFggCHs60byz74T4YJjmIzJfcHk8LWCSNcov5gASesVARfdPNzzAYyoxYd

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_settings OWNER TO postgres;

--
-- Name: agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    prefecture text NOT NULL,
    company_name text NOT NULL,
    representative_name text,
    contact_name text,
    phone text,
    email text,
    address text,
    postal_code text,
    website_url text,
    business_area text,
    note text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying,
    login_email text
);


ALTER TABLE public.agents OWNER TO postgres;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    user_name text,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id character varying,
    details text,
    ip_address text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cargo_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cargo_listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    departure_area text NOT NULL,
    arrival_area text NOT NULL,
    cargo_type text NOT NULL,
    weight text NOT NULL,
    desired_date text NOT NULL,
    vehicle_type text NOT NULL,
    price text,
    description text,
    company_name text NOT NULL,
    contact_phone text NOT NULL,
    contact_email text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying,
    arrival_date text,
    departure_address text,
    departure_time text,
    arrival_address text,
    arrival_time text,
    body_type text,
    temperature_control text,
    highway_fee text,
    consolidation text,
    driver_work text,
    package_count text,
    loading_method text,
    transport_type text,
    view_count integer DEFAULT 0 NOT NULL,
    urgency text,
    moving_job text,
    vehicle_spec text,
    equipment text,
    loading_time text,
    unloading_time text,
    payment_date text,
    contact_person text,
    tax_type text,
    cargo_number integer,
    listing_type text DEFAULT 'own'::text NOT NULL
);


ALTER TABLE public.cargo_listings OWNER TO postgres;

--
-- Name: cargo_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cargo_number_seq
    START WITH 7891235
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cargo_number_seq OWNER TO postgres;

--
-- Name: contact_inquiries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_inquiries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_name text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    category text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'unread'::text NOT NULL,
    admin_note text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.contact_inquiries OWNER TO postgres;

--
-- Name: dispatch_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispatch_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    cargo_id character varying NOT NULL,
    user_id character varying NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    transport_company text,
    shipper_company text,
    contact_person text,
    loading_date text,
    loading_time text,
    loading_place text,
    unloading_date text,
    unloading_time text,
    unloading_place text,
    cargo_type text,
    total_weight text,
    weight_vehicle text,
    notes text,
    vehicle_equipment text,
    fare text,
    highway_fee text,
    waiting_fee text,
    additional_work_fee text,
    export_fee text,
    parking_fee text,
    customs_fee text,
    fuel_surcharge text,
    total_amount text,
    tax text,
    payment_method text,
    payment_due_date text,
    prime_contractor_name text,
    prime_contractor_phone text,
    prime_contractor_contact text,
    contract_level text,
    actual_shipper_name text,
    actual_transport_company text,
    vehicle_number text,
    driver_name text,
    driver_phone text,
    transport_company_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    sent_at timestamp without time zone
);


ALTER TABLE public.dispatch_requests OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    user_id character varying NOT NULL,
    company_name text NOT NULL,
    email text NOT NULL,
    plan_type text NOT NULL,
    amount integer NOT NULL,
    tax integer NOT NULL,
    total_amount integer NOT NULL,
    billing_month text NOT NULL,
    due_date text NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    payment_method text,
    paid_at timestamp without time zone,
    sent_at timestamp without time zone,
    admin_note text,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    name text NOT NULL,
    subject text,
    body text NOT NULL,
    trigger_event text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    channel text DEFAULT 'system'::text NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    related_id character varying,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partners (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    company_name text NOT NULL,
    company_name_kana text,
    representative text,
    contact_name text,
    phone text,
    fax text,
    email text,
    postal_code text,
    address text,
    business_type text,
    truck_count text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.partners OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'JPY'::text NOT NULL,
    square_payment_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: plan_change_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plan_change_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    current_plan text NOT NULL,
    requested_plan text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_note text,
    created_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone
);


ALTER TABLE public.plan_change_requests OWNER TO postgres;

--
-- Name: seo_articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seo_articles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    topic text NOT NULL,
    keywords text,
    title text NOT NULL,
    content text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    slug text DEFAULT ''::text NOT NULL,
    meta_description text,
    auto_generated boolean DEFAULT false
);


ALTER TABLE public.seo_articles OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: transport_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    cargo_id character varying,
    transport_company text NOT NULL,
    shipper_name text,
    driver_name text,
    driver_phone text,
    vehicle_number text,
    vehicle_type text,
    departure_area text,
    arrival_area text,
    transport_date text,
    cargo_description text,
    fare text,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transport_records OWNER TO postgres;

--
-- Name: truck_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.truck_listings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    current_area text NOT NULL,
    destination_area text NOT NULL,
    vehicle_type text NOT NULL,
    max_weight text NOT NULL,
    available_date text NOT NULL,
    price text,
    description text,
    company_name text NOT NULL,
    contact_phone text NOT NULL,
    contact_email text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    user_id character varying,
    body_type text
);


ALTER TABLE public.truck_listings OWNER TO postgres;

--
-- Name: user_add_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_add_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    requester_id character varying NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    note text,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_note text,
    created_at timestamp without time zone DEFAULT now(),
    reviewed_at timestamp without time zone,
    password text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.user_add_requests OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    company_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    user_type text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    address text,
    contact_name text,
    fax text,
    truck_count text,
    permit_file text,
    approved boolean DEFAULT false NOT NULL,
    payment_terms text,
    business_description text,
    company_name_kana text,
    postal_code text,
    website_url text,
    invoice_registration_number text,
    registration_date text,
    representative text,
    established_date text,
    capital text,
    employee_count text,
    office_locations text,
    annual_revenue text,
    bank_info text,
    major_clients text,
    closing_day text,
    payment_month text,
    business_area text,
    auto_invoice_acceptance text,
    member_organization text,
    transport_license_number text,
    digital_tachograph_count text,
    gps_count text,
    safety_excellence_cert text,
    green_management_cert text,
    iso9000 text,
    iso14000 text,
    iso39001 text,
    cargo_insurance text,
    plan text DEFAULT 'premium'::text NOT NULL,
    closing_month text,
    payment_day text,
    bank_name text,
    bank_branch text,
    account_type text,
    account_number text,
    account_holder_kana text,
    accounting_contact_name text,
    accounting_contact_email text,
    accounting_contact_phone text,
    accounting_contact_fax text,
    line_user_id text,
    notify_system boolean DEFAULT true NOT NULL,
    notify_email boolean DEFAULT true NOT NULL,
    notify_line boolean DEFAULT false NOT NULL,
    added_by_user_id character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: admin_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_settings (id, key, value, updated_at) FROM stdin;
a95abba7-de47-41a3-9658-2e7375dc73cf	approvalRequired	true	2026-02-18 07:03:39.603775
c7c16034-a12e-4971-889b-0f6bf25a17ac	preventConcurrentLogin	true	2026-02-18 07:03:39.623981
405232cb-488a-4aa7-8272-0b1c43d41238	permitRequired	true	2026-02-18 07:03:39.628889
1760cd11-363f-4194-87b9-fc19a655828e	maintenanceMode	false	2026-02-18 07:03:39.633864
84482f24-395a-49c9-a83c-48336756e1c0	sessionTimeout	24	2026-02-18 07:03:39.637457
4cdd3059-dd1e-4904-a58c-5341881f29ad	passwordMinLength	6	2026-02-18 07:03:39.640866
56aff153-c341-4110-9b4c-43b41227ab1a	maxListingsPerUser	999	2026-02-18 14:19:53.204486
64184dbd-a64a-43de-b3a7-40a1de3d3c2e	defaultListingDays	180	2026-02-18 14:19:53.208959
541068d1-cb57-4f9f-918b-4816a95377e2	autoDeleteDays	0	2026-02-18 14:19:53.213954
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents (id, prefecture, company_name, representative_name, contact_name, phone, email, address, postal_code, website_url, business_area, note, status, created_at, user_id, login_email) FROM stdin;
2fcd2684-fe3f-4ea9-b95c-5b695c5594d7	三重県	SIN JAPAN 三重配車センター	\N	\N	\N	agent-mie@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	412bf243-e676-41f6-987c-b19341fa56f3	agent-mie@tramatch.jp
8a606df1-daef-451f-8bc5-af4e08f5fff3	北海道	SIN JAPAN 北海道配車センター				agent-hokkaido@tramatch.jp						active	2026-02-18 15:32:45.0591	3834cf6e-94d0-4a3d-b94c-487d25b0759c	agent-hokkaido@tramatch.jp
4f5a2df4-5eb9-4bab-9965-8d1bc40e470e	京都府	SIN JAPAN 京都配車センター	\N	\N	\N	agent-kyoto@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	be7eba29-3438-451a-89a0-dae268b590e1	agent-kyoto@tramatch.jp
6b8875c5-0376-4615-893e-f69000bc4a2f	佐賀県	SIN JAPAN 佐賀配車センター	\N	\N	\N	agent-saga@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	c300ad86-244a-4495-9446-ffd4c50713ff	agent-saga@tramatch.jp
5c8a5dd0-e354-44a7-a5bc-2cd9716d5ef7	埼玉県	SIN JAPAN 埼玉配車センター	\N	\N	\N	agent-saitama@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	f060c152-3734-4c47-b26b-69db4154e8fd	agent-saitama@tramatch.jp
0089256c-4f0b-49bb-a7ac-3608559f90e7	兵庫県	SIN JAPAN 兵庫配車センター	\N	\N	\N	agent-hyogo@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	9aeb9f7f-0a79-47de-91bd-b260b9b57d75	agent-hyogo@tramatch.jp
8d54f873-493f-4af9-b74c-7addf5fa2e77	広島県	SIN JAPAN 広島配車センター	\N	\N	\N	agent-hiroshima@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	cc5aca81-e569-446d-ad44-518de8e319e8	agent-hiroshima@tramatch.jp
6bba7ee1-fa34-4833-8a24-8020d5ab095c	千葉県	SIN JAPAN 千葉配車センター	\N	\N	\N	agent-chiba@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	e25dfea7-7c1d-4df4-be34-39ad2c11d60f	agent-chiba@tramatch.jp
601cc9af-20be-46f2-aac1-ede2eebef62c	和歌山県	SIN JAPAN 和歌山配車センター	\N	\N	\N	agent-wakayama@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	5b040a32-0746-4259-bf6b-24f1319de036	agent-wakayama@tramatch.jp
1290d265-f2b4-4665-86d5-d12f6fa3c2f1	大分県	SIN JAPAN 大分配車センター	\N	\N	\N	agent-oita@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	cab87083-33c7-41ca-a5d6-2aa3306f7f3c	agent-oita@tramatch.jp
8ebf0337-30b5-4759-bb9a-f0278ea8a93f	大阪府	SIN JAPAN 大阪配車センター	\N	\N	\N	agent-osaka@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	5f63224a-4cee-4fc1-a886-cc4ad446c374	agent-osaka@tramatch.jp
14a047e1-8001-4a43-bc01-15e7223e1608	奈良県	SIN JAPAN 奈良配車センター	\N	\N	\N	agent-nara@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	f0c0bc3b-e38a-4065-8b5d-d64ea4817b20	agent-nara@tramatch.jp
fc87f38b-5f7b-4370-9f1e-3ee15574724e	宮城県	SIN JAPAN 宮城配車センター	\N	\N	\N	agent-miyagi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	2b9728a1-8957-4c3a-8c55-bc027e58f3ae	agent-miyagi@tramatch.jp
396f1ac1-135c-4ec5-890c-fbfd9388f6b4	宮崎県	SIN JAPAN 宮崎配車センター	\N	\N	\N	agent-miyazaki@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	6e54a5bc-de1f-4b47-985b-026716eef691	agent-miyazaki@tramatch.jp
327927c6-cbce-4432-88d7-f181341142fd	富山県	SIN JAPAN 富山配車センター	\N	\N	\N	agent-toyama@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	8b52aa33-ff87-448b-bac4-2946813865f2	agent-toyama@tramatch.jp
2283f570-c8b8-4f24-b42d-9b2188126475	山口県	SIN JAPAN 山口配車センター	\N	\N	\N	agent-yamaguchi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	7672141d-05c3-4354-8391-b1a591784314	agent-yamaguchi@tramatch.jp
85397d2d-b505-4c38-ab84-f53afdfc969a	山形県	SIN JAPAN 山形配車センター	\N	\N	\N	agent-yamagata@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	1e1e96c1-0b8c-4591-b8af-f0624eb9260f	agent-yamagata@tramatch.jp
3755670b-7bf6-4661-9bbb-2156911d1e97	山梨県	SIN JAPAN 山梨配車センター	\N	\N	\N	agent-yamanashi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	a41c254f-dc49-499f-ab56-2e10b4d97d07	agent-yamanashi@tramatch.jp
dfffefed-012c-4faa-9f75-611d5d926805	岐阜県	SIN JAPAN 岐阜配車センター	\N	\N	\N	agent-gifu@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	f07f6e3b-bb9b-4e73-9e8f-4332789a42d1	agent-gifu@tramatch.jp
82684158-fc4f-411b-998d-456e561e2273	岡山県	SIN JAPAN 岡山配車センター	\N	\N	\N	agent-okayama@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	b08ad358-86b7-4a8f-b31c-46cd5df5bfd2	agent-okayama@tramatch.jp
0610bdb6-9116-48d4-8d57-2ff46abda588	岩手県	SIN JAPAN 岩手配車センター	\N	\N	\N	agent-iwate@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	b7beec3e-0544-4fcd-a2f3-d98429563aa6	agent-iwate@tramatch.jp
0539f4c2-4bb7-4cff-af1c-20e781cfc8fa	島根県	SIN JAPAN 島根配車センター	\N	\N	\N	agent-shimane@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	b0b8837a-69ca-42bc-b420-00e8ca20e14f	agent-shimane@tramatch.jp
53780e07-e7dd-4c9e-8a4b-778ac8915ffa	徳島県	SIN JAPAN 徳島配車センター	\N	\N	\N	agent-tokushima@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	7df13401-3e72-44a9-b958-1caa43db68c5	agent-tokushima@tramatch.jp
cd2b81dc-c54c-4925-87fb-fe230d4e4b96	愛媛県	SIN JAPAN 愛媛配車センター	\N	\N	\N	agent-ehime@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	4e7c5d92-d814-4a00-946b-3b53bd9cb777	agent-ehime@tramatch.jp
63e9deec-fd3c-41e0-ae28-84a4629dcb61	愛知県	SIN JAPAN 愛知配車センター	\N	\N	\N	agent-aichi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	30ef598a-0247-4940-84b5-1e9ddeeb10d5	agent-aichi@tramatch.jp
4d0be81b-47b7-4c36-9eed-62df4f3e9d03	新潟県	SIN JAPAN 新潟配車センター	\N	\N	\N	agent-niigata@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	75afed5b-0af2-46f6-b5ef-c2f784ccae83	agent-niigata@tramatch.jp
255bc097-0705-43a6-be6d-17f305604246	栃木県	SIN JAPAN 栃木配車センター	\N	\N	\N	agent-tochigi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	fcc02b8f-2310-4654-b806-f3ab07457e19	agent-tochigi@tramatch.jp
fe60453e-1a0e-4fe9-bcfa-a4a0de3324d2	沖縄県	SIN JAPAN 沖縄配車センター	\N	\N	\N	agent-okinawa@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	c600b749-b276-4708-90ca-be3e904d9639	agent-okinawa@tramatch.jp
e94a2eb0-e315-45d3-bdbd-778328503309	滋賀県	SIN JAPAN 滋賀配車センター	\N	\N	\N	agent-shiga@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	aeffd472-8dea-4518-bbf8-cd346d788435	agent-shiga@tramatch.jp
e538f2f6-8dbb-4958-853d-cfc78865235b	熊本県	SIN JAPAN 熊本配車センター	\N	\N	\N	agent-kumamoto@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	79b95cf1-b59c-4c88-ac39-004b09a80121	agent-kumamoto@tramatch.jp
2e4cfa75-efcb-47ea-a5cb-e83675b3b021	石川県	SIN JAPAN 石川配車センター	\N	\N	\N	agent-ishikawa@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	a6220bb0-a46e-4a98-be66-e5b3cd44ac93	agent-ishikawa@tramatch.jp
498441a8-e4b7-499c-a302-78b05d30e25d	神奈川県	SIN JAPAN 神奈川配車センター	\N	\N	\N	agent-kanagawa@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	57c956f6-868c-4df0-8bdd-64a630f7ed2b	agent-kanagawa@tramatch.jp
1ba39d70-2c92-4a8e-8cb6-20d8b5ced1ae	福井県	SIN JAPAN 福井配車センター	\N	\N	\N	agent-fukui@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	ee32adbc-700a-4986-b3f0-d24619d4eaad	agent-fukui@tramatch.jp
3a6a9acb-1c75-439d-ab02-e9b6636340e0	福岡県	SIN JAPAN 福岡配車センター	\N	\N	\N	agent-fukuoka@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	a1da15c8-5699-4553-8a81-3999fc9b7565	agent-fukuoka@tramatch.jp
503079e9-b6a8-4ae2-9296-d1b898ff042a	福島県	SIN JAPAN 福島配車センター	\N	\N	\N	agent-fukushima@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	53546504-54d7-46c6-8602-975bdf35bb85	agent-fukushima@tramatch.jp
558b762e-d87e-43ef-ac3e-4075efb463fa	秋田県	SIN JAPAN 秋田配車センター	\N	\N	\N	agent-akita@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	5716ab67-dced-48e5-b128-2d6e883dc83e	agent-akita@tramatch.jp
5b4f2b04-43b0-463b-be41-28c2ea540418	群馬県	SIN JAPAN 群馬配車センター	\N	\N	\N	agent-gunma@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	fbc52150-0350-4fce-9ad3-29b0e1ff1f29	agent-gunma@tramatch.jp
7ce908d5-1708-4a64-b761-00b888ef3f18	茨城県	SIN JAPAN 茨城配車センター	\N	\N	\N	agent-ibaraki@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	33dfb624-cd15-40ca-a751-60fd9db154a3	agent-ibaraki@tramatch.jp
63aca1e3-ac56-4b25-8b00-cfc9804525f9	長崎県	SIN JAPAN 長崎配車センター	\N	\N	\N	agent-nagasaki@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	05b7b730-ddce-459d-b39c-6cf3a5f74e28	agent-nagasaki@tramatch.jp
25eec136-5ad2-4c95-8f8f-c1beafa04a83	長野県	SIN JAPAN 長野配車センター	\N	\N	\N	agent-nagano@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	01858591-b44a-401a-ad76-fceafd531179	agent-nagano@tramatch.jp
12eb023f-86cd-4ea3-9af1-814dc570f4d1	青森県	SIN JAPAN 青森配車センター	\N	\N	\N	agent-aomori@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	611e4a1d-fe13-4f8c-9f18-8842e7d1066c	agent-aomori@tramatch.jp
d01dda2d-fcff-44ed-b1ef-04dffdb93fc8	静岡県	SIN JAPAN 静岡配車センター	\N	\N	\N	agent-shizuoka@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	97e05289-1639-4dd2-b2b8-d0c0de82b329	agent-shizuoka@tramatch.jp
d45c76d1-dbee-47c6-af93-04eb626d2039	香川県	SIN JAPAN 香川配車センター	\N	\N	\N	agent-kagawa@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	0320493f-754b-4c58-a46e-f8ec01c2b6ed	agent-kagawa@tramatch.jp
55cdd848-b0f6-4fad-8af0-86a56cd4dcfd	高知県	SIN JAPAN 高知配車センター	\N	\N	\N	agent-kochi@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	4208046b-4d32-490a-8949-9096592f6324	agent-kochi@tramatch.jp
945394be-b503-48a7-85c9-4b1f7f4dabf8	鳥取県	SIN JAPAN 鳥取配車センター	\N	\N	\N	agent-tottori@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	72edd7f6-39d6-4066-a131-efd39e0b1bea	agent-tottori@tramatch.jp
a46845a1-057c-4a59-862a-de1a08ac6781	鹿児島県	SIN JAPAN 鹿児島配車センター	\N	\N	\N	agent-kagoshima@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	03b3c350-a37c-48b2-9f58-e2a4ca3ef396	agent-kagoshima@tramatch.jp
492ef68c-c35a-4d79-b77f-4f7b5c196c49	東京都	SIN JAPAN 東京配車センター	\N	山田太郎	03-1234-5678	agent-tokyo@tramatch.jp	\N	\N	\N	\N	\N	active	2026-02-18 15:32:45.0591	04e2660a-c43d-4376-8f6c-64f7636c666a	agent-tokyo@tramatch.jp
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, content, category, is_published, created_at, updated_at) FROM stdin;
f031eea6-d35c-431d-92c4-757d05508cf9	TRA MATCH β版をリリースしました	月額費用0円でご利用いただけます。荷物や空車の情報を簡単にAI掲載・AI検索できるようになりました。	update	t	2026-02-16 10:00:00	2026-02-18 06:36:43.389
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, user_name, action, target_type, target_id, details, ip_address, created_at) FROM stdin;
0fcd707b-b2eb-4d99-b593-373e4647b9ca	8524e6bc-44ec-4980-bd54-3f5b63d38c28	SIN JAPAN LLC	approve	user	962f53e2-ae24-474a-9b7b-8d9a58c5c750	ユーザー「テスト運送株式会社」を承認	10.83.4.117	2026-02-18 13:03:42.808455
8db66910-7146-4ea7-bb3a-d54882f0b187	8524e6bc-44ec-4980-bd54-3f5b63d38c28	SIN JAPAN LLC	approve	user	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	ユーザー「サンプル」を承認	10.83.5.98	2026-02-18 13:12:28.944803
e185ca59-475c-4f87-aca6-1856484a01b5	8524e6bc-44ec-4980-bd54-3f5b63d38c28	SIN JAPAN LLC	delete	cargo	04a9f8ba-8383-4c06-8e8a-a34863419a53	荷物「埼玉→仙台 建材」を管理者が削除	10.83.4.119	2026-02-18 14:18:25.483673
102ebca8-66d3-4ed5-a2f0-b2fbc82fa8b2	\N	\N	create	agent	cf72b4a6-c73c-4a43-842b-1ec8f8052ff3	代理店「テスト運送株式会社」(東京都)を登録	10.83.6.114	2026-02-18 14:59:07.315404
bec7699b-0001-47ef-aa7b-35d6c753c705	\N	\N	update	agent	cf72b4a6-c73c-4a43-842b-1ec8f8052ff3	代理店「テスト運送株式会社（編集済）」(東京都)を更新	10.83.6.114	2026-02-18 15:00:14.272264
1a5fbf61-e46e-47fa-9f58-43bbf9383d33	\N	\N	delete	agent	cf72b4a6-c73c-4a43-842b-1ec8f8052ff3	代理店「テスト運送株式会社（編集済）」(東京都)を削除	10.83.6.114	2026-02-18 15:00:24.669416
69c4f08a-d769-4dbf-888f-7808ea3e5e5c	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	10.83.8.140	2026-02-18 15:57:27.156567
2c17fbc4-3686-4b82-8140-d0713a96b84d	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	10.83.8.140	2026-02-18 15:57:33.5276
a08c4377-84d8-4bd6-9d27-62766dedcfcb	\N	\N	update	agent_account	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」のパスワードをリセット	10.83.12.135	2026-02-18 15:59:08.16995
e16d85ca-3bd5-467d-bf71-e675b83f3fbd	\N	\N	update	agent_account	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」のパスワードをリセット	10.83.12.135	2026-02-18 15:59:24.51346
c2412372-7833-4e5d-bc61-8327aad0465d	\N	\N	update	agent_account	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」のパスワードをリセット	10.83.11.146	2026-02-18 16:00:47.279509
16a89476-86d2-4c32-896c-f4bfd3dbe1c3	\N	\N	update	agent_account	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」のパスワードをリセット	127.0.0.1	2026-02-18 16:04:03.67601
a6661737-a831-4d45-b894-0eeb18435560	\N	\N	update	agent_account	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」のパスワードをリセット	10.83.0.65	2026-02-18 16:04:20.282853
84532b8c-e858-456a-be85-5046a24a3b68	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	10.83.7.223	2026-02-18 16:06:44.011751
5c2ed45a-a3b8-4eee-8842-c446d22ed06c	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	127.0.0.1	2026-02-18 16:09:51.899763
5fa343e0-8a5b-47b4-8d85-6b583d04ddf9	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	10.83.12.135	2026-02-18 16:10:11.720565
18aa58c1-8a02-4a9e-88de-650b625ceb44	\N	\N	update	agent	492ef68c-c35a-4d79-b77f-4f7b5c196c49	代理店「SIN JAPAN 東京配車センター」(東京都)を更新	127.0.0.1	2026-02-18 16:13:00.508157
fb996486-a32c-4679-911b-8e1f6ceafcc3	\N	\N	update	agent	8a606df1-daef-451f-8bc5-af4e08f5fff3	代理店「SIN JAPAN 北海道配車センター」(北海道)を更新	10.83.6.114	2026-02-18 16:14:58.591912
\.


--
-- Data for Name: cargo_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cargo_listings (id, title, departure_area, arrival_area, cargo_type, weight, desired_date, vehicle_type, price, description, company_name, contact_phone, contact_email, status, created_at, user_id, arrival_date, departure_address, departure_time, arrival_address, arrival_time, body_type, temperature_control, highway_fee, consolidation, driver_work, package_count, loading_method, transport_type, view_count, urgency, moving_job, vehicle_spec, equipment, loading_time, unloading_time, payment_date, contact_person, tax_type, cargo_number, listing_type) FROM stdin;
e8d452d6-893c-4553-a6fb-b31cde724a07	東京→大阪 食品冷蔵便	東京	大阪	食品（冷蔵）	8t	2026/03/05	10t車	120,000	冷蔵食品の輸送です。温度管理が必要です。集荷は朝8時希望。	東京フーズ株式会社	03-1234-5678	logistics@tokyofoods.co.jp	active	2026-02-16 18:17:51.012143	\N	2026/03/06	江東区有明	08:00	大阪市住之江区南港	午前中	冷蔵車	冷蔵（0〜10℃）	込み	不可	フォークリフト	20パレット	パレット積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	own
565d1e85-e085-45db-89da-9414a4323cee	仙台→愛知 イベント什器 4tG	宮城	愛知	イベント什器		2024/02/27	4t車	140000	カゴやバラがあります	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 06:39:44.517845	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/03/02	仙台市若林区	17:00	犬山市	13:00			込み		手積み手降ろし		バラ積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	11	own
0d400934-c034-44fa-a611-37d4850188fa	愛知→仙台 イベント什器 4tG	愛知	宮城	イベント什器		2024/02/24	4t車	140000	カゴやバラがあります	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 06:39:34.283001	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/26	犬山市	13:00	仙台市若林区	14:00			込み		手積み手降ろし		バラ積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	10	own
5e241fae-afc1-4584-8ba0-f9b40c53b55f	仙台→愛知 イベント什器	宮城	愛知	イベント什器		2024/02/27	4t車	140000	カゴやバラあります。	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 06:33:25.961617	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/03/02	仙台市若林区	17:00	犬山市	13:00					手積み手降ろし		バラ積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	9	own
6b2f0aa9-c431-4f14-bbec-ddec5001871f	名古屋→福岡 機械部品	愛知	福岡	機械部品	5t	2026/03/08	10t車	95,000	精密機械部品のため丁寧な扱いをお願いします。梱包済み。	中部メカニクス株式会社	052-987-6543	shipping@chubu-mech.co.jp	active	2026-02-16 18:17:51.012143	\N	2026/03/09	名古屋市港区	午前中	福岡市東区	指定なし	ウイング	常温	別途	可	フォークリフト	15箱	段ボール	定期	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	2	own
feb25b28-0d79-41f2-bff1-5d30600258a8	大阪→東京 アパレル商品	大阪	東京	アパレル	3t	2026/03/10	4t車	65,000	春物アパレル商品。ハンガーラック使用。雨濡れ厳禁。	関西アパレル株式会社	06-5555-1234	info@kansai-apparel.co.jp	active	2026-02-16 18:17:51.012143	\N	2026/03/11	大阪市中央区	午後	渋谷区神宮前	午前中	バン	指定なし	込み	不可	手積み手降ろし	50箱	段ボール	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	3	own
663caa6c-8f5d-44d0-a377-c3bef81dd4a7	北海道→東京 農産物	北海道	東京	農産物	10t	2026/03/12	大型車	180,000	じゃがいも・玉ねぎの大量輸送。鮮度管理のため迅速な配送をお願いします。	北海道農産直送株式会社	011-222-3333	nouhan@hokkaido-farm.co.jp	active	2026-02-16 18:17:51.012143	\N	2026/03/14	帯広市西	06:00	大田区東海	午前中	ウイング	常温	込み	不可	作業なし（車上渡し）	バラ	バラ積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	5	own
ff54faea-4227-4f83-af9a-c29e9d43db24	神奈川→千葉 フレコン鋼材	神奈川	千葉	鋼材	15t	2026/03/17	大型車	40,000	連絡は携帯電話へお願いします。	津田運送株式会社	080-7121-xxxx		active	2026-02-16 18:17:51.012143	\N	2026/03/17	横浜市鶴見区	09:00	千葉市中央区	指定なし	平ボディ	指定なし	込み	不可	クレーン		フレコン	スポット	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	6	own
2756991b-467c-49ba-99ee-1ccefe40cc15	川崎→浦安 フレコン	神奈川	千葉	フレコン	13t	2026/03/17	大型車	22,000		株式会社エー・アイ・コーポレーション	044-xxx-xxxx		active	2026-02-16 18:17:51.012143	\N		川崎市川崎区	指定なし	浦安市	指定なし	平ボディ	指定なし	高速代なし	不可	未入力		フレコン	スポット	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	7	own
801da154-8015-4072-b0bf-59f0cd764a76	神奈川→香川 シャフト	神奈川	香川	シャフト	13t	2026/03/19	大型車	150,000	連絡は携帯電話へお願いします。080-7121-xxxx	ビックネット株式会社	045-xxx-xxxx		active	2026-02-16 18:17:51.012143	\N		横浜市	指定なし	香川郡直島町	指定なし	平ボディ	指定なし	高速代なし	可	未入力		バラ積み	スポット	3	\N	\N	\N	\N	\N	\N	\N	\N	\N	8	own
914d55ac-f0c1-4a0b-9859-25642b4f7b3f	埼玉→埼玉 ケース,オリコン 2t	埼玉	埼玉	ケース,オリコン			2t車	30000	西濃運輸	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-17 07:55:22.12944	8524e6bc-44ec-4980-bd54-3f5b63d38c28		狭山市		入間				高速代なし					定期	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	12	own
81b94a42-f5a4-4575-afbe-17e5fbce2fb3	東京→東京 引越 2tL	東京	東京	引越			2t車	27000	ありさん	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-17 07:55:24.643965	8524e6bc-44ec-4980-bd54-3f5b63d38c28													定期	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	13	own
7c95260b-f3f3-4939-8e42-db0ba1f753a1	神奈川→東京 家財一式 4t	神奈川	東京	家財一式			4t車	40000	残業代1H1500円	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-17 07:55:26.46936	8524e6bc-44ec-4980-bd54-3f5b63d38c28		厚木市	07:00	横浜市	16:00								定期	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	14	own
e7972272-14e2-415b-b707-3906949aef6d	東京→関東 ケース 4tW	東京		ケース			4t車	32000	Amazon,2往復	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-17 07:55:27.520211	8524e6bc-44ec-4980-bd54-3f5b63d38c28		江東区		エリア		ウイング		高速代なし					定期	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	15	own
696225ee-a414-446d-9337-a6409cf24932	埼玉→コース別 梱包家具 4tW	埼玉		梱包家具			4t車	35000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-17 07:55:28.239518	8524e6bc-44ec-4980-bd54-3f5b63d38c28		入間	08:00	別	13:00	ウイング		高速代なし				バラ積み	定期	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	16	own
57fb40c0-8c43-4bfd-827a-f17e8a4b6706	愛知→宮城 イベント什器 4tG	愛知	宮城	イベント什器		2023/02/24	4t車	140000	往路	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 07:55:30.318921	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2023/02/26	犬山市	13:00	仙台市	14:00	パワーゲート付き		高速代なし				バラ積み	スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	19	own
c55fc5b9-3676-4437-92ee-9642930ee8d6	宮城→愛知 イベント什器 4tG	宮城	愛知	イベント什器		2023/02/27	4t車	140000	復路	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	completed	2026-02-17 07:55:30.914389	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2023/03/02	仙台市	17:00	犬山市	13:00	パワーゲート付き		高速代なし				バラ積み	スポット	2	\N	\N	\N	\N	\N	\N	\N	\N	\N	20	own
cb708829-6f09-4d33-a51d-e4e9b4a49acc	UI Test Cargo - 東京→大阪 食品 1t	東京都	大阪府	食品	1000	2026-02-18	2t車	\N	\N	トラマッチ運営	03-0000-0000	admin@tramatch.jp	active	2026-02-17 08:51:56.214515	df5b3e74-7d02-4469-9c87-713f2a6b1326	2026-02-19	渋谷区テスト	\N	大阪市北区テスト	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	21	own
2eac4136-8c61-49f3-aa36-7862a0776d2c	大阪→千葉 店舗什器 4tWG	大阪	千葉	店舗什器		2023/02/20	4t車	70000	梱包材,毛布多めに	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	completed	2026-02-17 07:55:29.07195	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2023/02/21	中央区	10:00	野田市	11:00	ウイング, パワーゲート付き		高速代なし					スポット	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	17	own
1de7ca86-9443-42ee-bad1-58d15a1d84b7	東京都江東区→茨城県大洗町 荷種: ラック 10tW	東京	茨城	ラック	不明	2024/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:52:17.939799	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/24	江東区	指定なし	大洗町	指定なし	ウイング			不可		不明		スポット	0	通常						\N		\N	\N	own
c057d3fa-c0d1-43f8-a1f8-9522d5db4a62	4tウイングゲート 仙台→愛知 イベント什器（復路）	宮城	愛知	イベント什器（カゴやバラあり）	特記事項なし	2025/02/27	4t車	140000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 14:36:18.706978	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2025/03/02	仙台市若林区	17:00	犬山市	13:00	ウイング, パワーゲート付き	指定なし	あり	不可		不明	その他	スポット	0	通常						\N	大谷	\N	26	own
67ab74d6-adc8-42ba-9024-3415011b93f2	仙台→愛知 イベント什器 4t車	宮城	愛知	イベント什器（カゴやバラあり）		2024/02/27	4t車	140000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 14:32:59.586459	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/03/02	仙台市若林区	17:00	犬山市	13:00				不可			バラ積み	スポット	0	通常						\N		\N	24	own
c5879012-2ffa-4e8c-97bb-2972a19bebbb	4tウイングゲート 愛知→仙台 イベント什器（往路）	愛知	宮城	イベント什器（カゴやバラあり）	特記事項なし	2025/02/24	4t車	140000	愛知-仙台往路、運賃140,000円	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 14:36:13.912817	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2025/02/26	犬山市	13:00	仙台市若林区	14:00	ウイング, パワーゲート付き	指定なし	あり	不可		不明	その他	スポット	0	通常						\N	大谷	\N	25	own
d115272b-e934-428e-be96-d8d4c3cc530b	埼玉→東京 引越 2t	埼玉	東京	引越		2023/02/19	2t車	31000	アート	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 07:55:29.699244	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2023/02/19	和光市	07:00	都内	17:00								スポット	1	\N	\N	\N	\N	\N	\N	\N	\N	\N	18	own
01f0c512-79ed-4094-b693-02660ffe8d85	愛知→仙台 イベント什器 4t車	愛知	宮城	イベント什器（カゴやバラあり）		2024/02/24	4t車	140000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 14:32:56.69404	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/26	犬山市	13:00	仙台市若林区	14:00				不可			バラ積み	スポット	0	通常						\N		\N	23	own
b29fffd3-0a53-4173-ab32-5739b3776003	愛知→仙台 イベント什器 4t	愛知	宮城	イベント什器（カゴやバラ）		2024/02/24	4t車	120000	往路運行案件	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-17 14:30:08.758231	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/26	犬山市	13:00	仙台市若林区	14:00				不可	手積み手降ろし			スポット	0	通常						\N		\N	22	own
50adeb42-d747-4d0c-87ce-5a5b9cd933c7	東京→大阪 精密機器輸送	東京都品川区	大阪府大阪市北区	精密機器	2t	2026-02-20	4t	45000	精密機器のため取り扱い注意。エアサス車両必須。養生あり。	株式会社スタームービング	03-1234-5678	star@example.com	active	2026-02-17 15:10:32.353821	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026-02-20	大崎1-2-3	09:00	梅田3-4-5	18:00	ウイング	\N	あり	不可	\N	\N	\N	\N	1	\N	無	\N	\N	\N	\N	2026/04/30	田中	\N	7891234	contracted
6fe0c426-8b5e-4276-9a5f-33aabe8f1a2f	千葉（白井市）→茨城（笠間） PL 10t 荷物	千葉	茨城	PL（パレット）	10t	2026/02/19	10t車	100000	サンプル	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:07:22.271065	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間	午前中	ウイング	常温	なし	不可	作業なし		パレット	スポット	0	通常		サンプル	サンプル			\N	サンプル	\N	\N	own
279474d7-94c0-4ea2-a610-0aa07db98721	千葉→茨城 荷種不明 10t車	千葉	茨城			2026/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:08:05.600072	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間市	午前中	ウイング		なし	不可	作業なし	PL（パレット）	パレット	スポット	0	通常						\N		\N	\N	own
d42eaf21-84d2-47fe-a0f2-832d314e9e63	千葉→茨城 荷種不詳 重量不詳	千葉	茨城			2026/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:09:42.881492	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間	午前中	ウイング		高速代なし				パレット		0							\N		\N	\N	own
d1c3d152-95bc-4281-b814-0962f1f97b11	千葉県白井市→茨城県笠間市 荷種: PL 10tW	千葉	茨城	PL	不明	2024/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:52:06.947651	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/20	白井市	午後	笠間市	午前中	ウイング			不可		不明	パレット	スポット	0	通常						\N		\N	\N	own
376d2598-a3df-41be-9506-886428fbbebd	東京→茨城 荷種（ラック） 重量（不明）	東京	茨城	ラック		2024/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:53:16.362783	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/24	江東区		大洗町		ウイング		なし					スポット	0	通常						\N		\N	\N	own
6f359745-55ec-43a0-8242-a2a5780c9654	東京（江東区）→茨城（大洗） ラック 10t車	東京	茨城	ラック		2024/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:53:44.696852	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/24	江東区		大洗		ウイング			不可				スポット	0							\N		\N	\N	own
80c69129-e8aa-4588-a453-194cd0cad182	千葉（白井市）→茨城（笠間） PL 10t車	千葉	茨城	PL（パレット）		2024/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:53:29.031618	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/20	白井市	午後	笠間	午前中	ウイング			不可			パレット	スポット	0							\N		\N	\N	own
4cc89b62-72bd-4550-86c7-497692fdd1ee	千葉（白井市）→茨城（笠間） PL 10t	千葉	茨城	パレット（PL）	10t	2026/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:03:51.704053	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間	午前中	ウイング	指定なし	なし	不可	作業なし（車上渡し）		パレット	スポット	0	通常						\N		\N	\N	own
585341f4-9b66-4b57-adb3-d0b504c32af2	東京（江東区）→茨城（大洗） ラック 10t	東京	茨城	ラック	10t	2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:03:53.914024	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区	指定なし	大洗	指定なし	ウイング	指定なし	なし	不可	作業なし（車上渡し）			スポット	0	通常						\N		\N	\N	own
57d551b1-0279-4fbf-8640-ab78eb6cae9a	千葉（白井市）→茨城（笠間市） 荷種不明 重量不明	千葉	茨城			2026/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:10:09.106149	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間市	午前中	ウイング		高速代なし				パレット		0							\N		\N	\N	own
3ed30369-0b70-49ee-8252-8fd708832ba8		千葉	茨城			2026/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:12:46.941594	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間市	午前中	ウイング		高速代なし				パレット	スポット	0							\N		\N	\N	own
5d7e3e5a-71f3-420f-b069-248065c278b4	千葉→茨城 荷種不明 重量不明	千葉	茨城	サンプル	サンプル	2026/02/19	10t車	200000	サンプル	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:14:15.304494	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/20	白井市	午後	笠間市	午前中	ウイング	常温	高速代なし	不可	作業なし	サンプル	パレット	スポット	0	通常		サンプル	サンプル			\N	サンプル	\N	\N	own
f617dfba-f7ff-4b20-8b8e-0eed20114aca	東京（江東区）→茨城（大洗） ラック 10t	東京	茨城	ラック		2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:15:49.151909	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング	指定なし	込み					スポット	0							\N	サンプル	\N	\N	own
fe47242f-ad5d-4b3b-b75c-807c15429232	東京→茨城 ラック 10t	東京	茨城	ラック		2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:16:57.455583	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング, 低床, 高床							スポット	0							\N		\N	\N	own
d96bc1fd-0f03-4ee7-8a39-dc33f4b040ae	千葉→茨城 荷種（不明） 重量（不明）	千葉	茨城			2024/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:52:30.114289	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/20	白井市	夕方以降	笠間市	午前中	ウイング		なし				パレット	スポット	0	通常						\N		\N	\N	own
07edcf01-cb45-44b8-a2c6-7c2b6b03cdce	江東区→大洗 ラック 10t	東京	茨城	ラック	不明（10t車使用から重量未確定）	2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:20:18.235849	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング	冷凍（-18℃以下）	込み					スポット	0	通常						\N		\N	\N	own
83fb74db-9796-4fd3-8ab8-2bb4b91e49ea	江東区→大洗 ラック 10t	東京	茨城	ラック		2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:26:24.290959	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング							スポット	0							\N		\N	7891235	own
f1190658-0ae7-4ad0-adaf-5f5f360ab481	東京→茨城 ラック 10t	東京	茨城	ラック		2026/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:26:38.24029	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング								0							\N		\N	7891236	own
3b96c882-d4e7-4cef-8192-72cee38ff41d	東京→茨城 ラック 10t	東京	茨城	ラック		2025/11/04	10t車	137000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 09:49:04.423173	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2025/12/24	江東区		大洗		ウイング							スポット	3	通常						\N		\N	7891240	own
9c8f1bd1-9a74-4e39-9f71-3adafe77a894	東京→茨城 ラック 10t	東京	茨城	ラック		2026/02/20	10t車	237000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 09:27:08.318002	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/24	江東区		大洗		ウイング		込み					スポット	5							\N		\N	7891237	own
18126973-d361-4e6b-81e5-ca695625dbb4	白井市→笠間 荷種:パレット 10tウイング	千葉	茨城	パレット		2024/02/19	10t車	128000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:55:00.501776	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/20	白井市	午後	笠間市	午前中	ウイング						パレット	スポット	0							\N		\N	\N	own
29ba9016-73f2-48f1-a8d1-5136610306db	江東区→大洗 荷種:ラック 10tウイング	東京	茨城	ラック		2024/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:55:03.177665	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/24	江東区	指定なし	大洗町	指定なし	ウイング						その他	スポット	0							\N		\N	\N	own
97337a00-deb3-4076-b0b3-da1ddd360598	千葉県白井市→茨城県笠間市 荷種: PL 10tウイング	千葉	茨城	PL		2024/02/19	10t車	28000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:57:44.146681	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2024/02/20	白井市（詳細未指定）	午後	笠間市（詳細未指定）	午前中	ウイング						パレット	スポット	0							\N		\N	\N	own
a3e38b4c-8dd0-4002-bfe6-b69007713d8c	東京都江東区→茨城県大洗町 荷種: ラック 10tウイング	東京	茨城	ラック		2024/02/20	10t車	37000		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	cancelled	2026-02-18 08:57:47.154126	8524e6bc-44ec-4980-bd54-3f5b63d38c28		江東区（詳細未指定）		大洗町（詳細未指定）		ウイング						パレット	スポット	0							\N		\N	\N	own
f0782fbe-8c79-46d0-a206-db5a2aac6413	建材 埼玉→仙台	埼玉	仙台	建材	10t車	2026/02/12	10t車	320000	鉄骨資材の輸送。ユニック使用。	合同会社SIN JAPAN	03-1234-5678	info@sinjapan.jp	completed	2026-02-10 09:00:00	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/13	埼玉県さいたま市大宮区1-2-3	07:00	宮城県仙台市青葉区4-5-6	16:00	平ボディ	常温	込み	不可	手作業あり	5	クレーン	スポット	6	通常	\N	\N	\N	\N	\N	2026/03/20	田中太郎	税別	7891243	contracted
bcc57153-c96e-453f-8432-68b37ce581fa	衣料品 大阪→福岡	大阪	福岡	衣料品	4t車	2026/02/14	4t車	195000	アパレル商品の輸送。段ボール梱包。	合同会社SIN JAPAN	03-1234-5678	info@sinjapan.jp	completed	2026-02-13 11:00:00	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/15	大阪府大阪市中央区7-8-9	08:00	福岡県福岡市博多区1-1-1	19:00	箱車	常温	高速代なし	可	作業なし	30	手積み	スポット	4	通常	\N	\N	\N	\N	\N	2026/03/25	田中太郎	税別	7891244	contracted
1cd85074-614c-4319-aa5e-b3a27ed861c5	精密機器 東京→大阪	東京	大阪	精密機器	4t車	2026/02/10	4t車	185000	精密機器の輸送。パワーゲート必須。	合同会社SIN JAPAN	03-1234-5678	info@sinjapan.jp	cancelled	2026-02-08 10:00:00	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/10	東京都江東区有明1-1-1	09:00	大阪府大阪市北区梅田2-2-2	17:00	ウイング	常温	込み	不可	作業なし	10	パワーゲート	スポット	12	通常	\N	\N	\N	\N	\N	2026/03/31	田中太郎	税別	7891241	own
fd3442c1-28dc-4b6b-8c0f-36b00d6abf60	食品 千葉→名古屋	千葉	名古屋	食品	10t車	2026/02/05	10t車	250000	冷蔵食品の輸送。温度管理厳守。	合同会社SIN JAPAN	03-1234-5678	info@sinjapan.jp	completed	2026-02-03 14:00:00	8524e6bc-44ec-4980-bd54-3f5b63d38c28	2026/02/06	千葉県千葉市中央区5-5-5	06:00	愛知県名古屋市中村区3-3-3	18:00	冷凍冷蔵	冷蔵	別途	不可	作業なし	20	手積み	スポット	8	通常	\N	\N	\N	\N	\N	2026/03/15	田中太郎	税別	7891242	own
8989e6b4-d40b-4407-8b50-a59bbb51e6e5	サンプル									SIN JAPAN 北海道配車センター		agent-hokkaido@tramatch.jp	active	2026-02-18 16:05:02.37324	3834cf6e-94d0-4a3d-b94c-487d25b0759c														0							\N		\N	7891245	own
332b9a24-f56e-4e0c-ac68-2aaf115a28fa	サンプル									SIN JAPAN 北海道配車センター	08021375162	agent-hokkaido@tramatch.jp	active	2026-02-18 16:10:38.004916	3834cf6e-94d0-4a3d-b94c-487d25b0759c														0							\N		\N	7891246	own
\.


--
-- Data for Name: contact_inquiries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contact_inquiries (id, company_name, name, email, phone, category, message, status, admin_note, created_at) FROM stdin;
a8212cf5-a75c-45e6-ae03-004fb288cfe2	サンプル	サンプル	a@a.com	サンプル	general	サンプル	read	\N	2026-02-18 08:06:36.996112
1b043ceb-d76b-49ce-9808-eb24a29f059f	テスト会社	テスト太郎	test@example.com	\N	general	テストメッセージです	read	\N	2026-02-18 08:03:27.170614
\.


--
-- Data for Name: dispatch_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispatch_requests (id, cargo_id, user_id, status, transport_company, shipper_company, contact_person, loading_date, loading_time, loading_place, unloading_date, unloading_time, unloading_place, cargo_type, total_weight, weight_vehicle, notes, vehicle_equipment, fare, highway_fee, waiting_fee, additional_work_fee, export_fee, parking_fee, customs_fee, fuel_surcharge, total_amount, tax, payment_method, payment_due_date, prime_contractor_name, prime_contractor_phone, prime_contractor_contact, contract_level, actual_shipper_name, actual_transport_company, vehicle_number, driver_name, driver_phone, transport_company_notes, created_at, sent_at) FROM stdin;
a3d51d82-5a79-4e55-a040-f397b7e287e2	c55fc5b9-3676-4437-92ee-9642930ee8d6	8524e6bc-44ec-4980-bd54-3f5b63d38c28	sent	SIN JAPAN LLC	SIN JAPAN LLC		2023/02/27	17:00	宮城 仙台市	2023/03/02	13:00	愛知 犬山市	イベント什器		/4t車/パワーゲート付き	復路		140000	高速代なし									銀行振込												2026-02-17 15:10:05.596798	2026-02-17 15:10:05.873
54c114c9-33b6-41c2-b811-d37727b90028	fd3442c1-28dc-4b6b-8c0f-36b00d6abf60	8524e6bc-44ec-4980-bd54-3f5b63d38c28	sent	合同会社SIN JAPAN	SIN JAPAN LLC	田中太郎	2026/02/05	06:00	千葉 千葉県千葉市中央区5-5-5	2026/02/06	18:00	名古屋 愛知県名古屋市中村区3-3-3	食品		10t車/10t車/冷凍冷蔵	冷蔵食品の輸送。温度管理厳守。		250000	別途									銀行振込	2026/03/15											2026-02-18 10:01:27.997538	2026-02-18 10:02:00.952
e9877a14-4f56-44af-95ba-ee14ed1af604	2eac4136-8c61-49f3-aa36-7862a0776d2c	8524e6bc-44ec-4980-bd54-3f5b63d38c28	sent	SIN JAPAN LLC	SIN JAPAN LLC		2023/02/20	10:00	大阪 中央区	2023/02/21	11:00	千葉 野田市	店舗什器		/4t車/ウイング, パワーゲート付き	梱包材,毛布多めに		70000	高速代なし									銀行振込												2026-02-18 10:04:42.905361	2026-02-18 10:04:43.17
ff6370f9-1f46-4ec7-be95-5296e74e9980	bcc57153-c96e-453f-8432-68b37ce581fa	8524e6bc-44ec-4980-bd54-3f5b63d38c28	sent	合同会社SIN JAPAN	SIN JAPAN LLC	田中太郎	2026/02/14	08:00	大阪 大阪府大阪市中央区7-8-9	2026/02/15	19:00	福岡 福岡県福岡市博多区1-1-1	衣料品		4t車/4t車/箱車	アパレル商品の輸送。段ボール梱包。		195000	高速代なし									銀行振込	2026/03/25						サンプル	サンプル	サンプル	サンプル	サンプル	2026-02-18 10:08:20.559068	2026-02-18 10:08:20.839
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, user_id, company_name, email, plan_type, amount, tax, total_amount, billing_month, due_date, status, payment_method, paid_at, sent_at, admin_note, description, created_at) FROM stdin;
ef826afb-4e1e-4bec-bdba-e02d52820c73	INV-202602-0001	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	サンプル	info@sinjapan.jp	premium_full	5000	500	5500	2026-02	2026-03-末日	unpaid	\N	\N	2026-02-18 14:11:11.922	\N	トラマッチ プレミアムプラン月額利用料（2026-02）¥5,500（税込）	2026-02-18 13:50:27.436713
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_templates (id, category, name, subject, body, trigger_event, is_active, created_at, updated_at, channel) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, related_id, is_read, created_at) FROM stdin;
86b5a334-6f64-4461-a5ef-79b018e73bf0	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→福岡 機械部品 2t	\N	t	2026-02-17 03:40:01.276241
dd6c4676-0e73-483c-b0e6-fdf32966da8b	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→大阪 食品 5t	\N	t	2026-02-17 05:30:01.276241
18a30e8e-dcc7-4107-87cf-83814e588cfa	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	神奈川→愛知 4t車 4t	\N	t	2026-02-17 05:10:01.276241
c49bbbbd-a908-41db-980a-99c0d9911da3	df5b3e74-7d02-4469-9c87-713f2a6b1326	user_registered	新規ユーザー登録	東京運送株式会社 が新規登録しました。承認をお願いします。	\N	t	2026-02-17 04:40:01.276241
10e669f5-6f45-4ac4-89af-33314ced7987	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	宮城→愛知 イベント什器 	5e241fae-afc1-4584-8ba0-f9b40c53b55f	f	2026-02-17 06:33:25.976541
5bc55a13-a6fd-4e45-b162-72d6ef93ccb9	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	愛知→宮城 イベント什器 	0d400934-c034-44fa-a611-37d4850188fa	f	2026-02-17 06:39:34.300078
d5026a3f-f2d6-485d-a844-4d99b6b404da	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	宮城→愛知 イベント什器 	565d1e85-e085-45db-89da-9414a4323cee	f	2026-02-17 06:39:44.560624
1b2ddaf5-95cc-4657-80a2-e4c2718bb151	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	埼玉→埼玉 ケース,オリコン 	914d55ac-f0c1-4a0b-9859-25642b4f7b3f	f	2026-02-17 07:55:22.148494
13e945bf-749f-4832-b684-30721d2ed385	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→東京 引越 	81b94a42-f5a4-4575-afbe-17e5fbce2fb3	f	2026-02-17 07:55:24.648967
6460013c-d0b0-4809-a8cf-e16c83c8fdc9	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	神奈川→東京 家財一式 	7c95260b-f3f3-4939-8e42-db0ba1f753a1	f	2026-02-17 07:55:26.473519
1d504051-2c32-4a2f-8681-7fbce1b23773	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→ ケース 	e7972272-14e2-415b-b707-3906949aef6d	f	2026-02-17 07:55:27.52412
eb0cf92e-1533-44b9-b808-bc3967fd0c64	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	埼玉→ 梱包家具 	696225ee-a414-446d-9337-a6409cf24932	f	2026-02-17 07:55:28.243122
4313c47c-40a9-4e0b-a806-989288c9f39b	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	大阪→千葉 店舗什器 	2eac4136-8c61-49f3-aa36-7862a0776d2c	f	2026-02-17 07:55:29.076383
6178dae2-f59b-4cc9-96f4-16935745b73d	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	埼玉→東京 引越 	d115272b-e934-428e-be96-d8d4c3cc530b	f	2026-02-17 07:55:29.703316
87bfea23-8222-479d-8ba7-c8689def2868	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	愛知→宮城 イベント什器 	57fb40c0-8c43-4bfd-827a-f17e8a4b6706	f	2026-02-17 07:55:30.323197
7ef38db1-e0b7-427c-95a8-914db573613e	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	宮城→愛知 イベント什器 	c55fc5b9-3676-4437-92ee-9642930ee8d6	f	2026-02-17 07:55:30.9173
9819b656-f40a-452c-9385-91d63a987c3f	8524e6bc-44ec-4980-bd54-3f5b63d38c28	cargo_new	新しい荷物が登録されました	大阪→名古屋 建材 10t	\N	t	2026-02-17 05:25:01.276241
05f73dfe-2332-4163-aa3f-77295f027380	8524e6bc-44ec-4980-bd54-3f5b63d38c28	truck_new	新しい空車が登録されました	埼玉→北海道 10t車 10t	\N	t	2026-02-17 04:55:01.276241
7bb7ef8b-83ff-4467-ac2e-e36adcca4acb	8524e6bc-44ec-4980-bd54-3f5b63d38c28	cargo_new	新しい荷物が登録されました	東京都→大阪府 食品 1000	cb708829-6f09-4d33-a51d-e4e9b4a49acc	t	2026-02-17 08:51:56.221283
93cc49ec-7c19-4212-b9be-a272f050fe12	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	愛知→宮城 イベント什器（カゴやバラ） 	b29fffd3-0a53-4173-ab32-5739b3776003	f	2026-02-17 14:30:08.8003
fc7c1dbf-ade8-4ab1-a02c-00bf9671b505	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	愛知→宮城 イベント什器（カゴやバラあり） 	01f0c512-79ed-4094-b693-02660ffe8d85	f	2026-02-17 14:32:56.701289
c1a3884e-ba7c-4df8-8689-523134e96365	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	宮城→愛知 イベント什器（カゴやバラあり） 	67ab74d6-adc8-42ba-9024-3415011b93f2	f	2026-02-17 14:32:59.596029
cdc9520b-3fa0-4392-9384-4701306bfc94	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	愛知→宮城 イベント什器（カゴやバラあり） 特記事項なし	c5879012-2ffa-4e8c-97bb-2972a19bebbb	f	2026-02-17 14:36:13.932562
2270ed85-4d00-4c6d-8a8b-0ac1a80534f4	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	宮城→愛知 イベント什器（カゴやバラあり） 特記事項なし	c057d3fa-c0d1-43f8-a1f8-9522d5db4a62	f	2026-02-17 14:36:18.713763
52b4f29f-e309-4ef4-a516-fdc6ed3a29f4	2daddea0-32eb-470e-bb11-4ea251257485	admin_notification	サンプル	サンプル	\N	f	2026-02-18 08:49:03.09291
a30891ad-37f6-4b88-bafa-b9f80692d48b	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 PL 不明	d1c3d152-95bc-4281-b814-0962f1f97b11	f	2026-02-18 08:52:06.955776
c798412c-d219-46e0-95ee-30ebeec9c523	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 PL 不明	d1c3d152-95bc-4281-b814-0962f1f97b11	f	2026-02-18 08:52:06.960279
7db3e771-7dcb-4453-b126-7b9b947911e9	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 不明	1de7ca86-9443-42ee-bad1-58d15a1d84b7	f	2026-02-18 08:52:17.987146
3fa5efb6-3067-4ce8-829c-4170179822d5	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 不明	1de7ca86-9443-42ee-bad1-58d15a1d84b7	f	2026-02-18 08:52:17.993559
46841961-4dd7-4bda-9aa8-a2bbc3852c93	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城  	d96bc1fd-0f03-4ee7-8a39-dc33f4b040ae	f	2026-02-18 08:52:30.120467
aec46995-b2e0-455a-a032-f718619b7780	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城  	d96bc1fd-0f03-4ee7-8a39-dc33f4b040ae	f	2026-02-18 08:52:30.123812
51652006-1194-43a6-ba16-10463c7d942e	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	376d2598-a3df-41be-9506-886428fbbebd	f	2026-02-18 08:53:16.368322
6fe44d11-6997-4bf3-b479-b730910f975e	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	376d2598-a3df-41be-9506-886428fbbebd	f	2026-02-18 08:53:16.380991
1956d790-af34-423a-8c2a-eb2978d926b9	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 PL（パレット） 	80c69129-e8aa-4588-a453-194cd0cad182	f	2026-02-18 08:53:29.041018
0323106f-45eb-424e-8f23-c7b4cfb37818	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 PL（パレット） 	80c69129-e8aa-4588-a453-194cd0cad182	f	2026-02-18 08:53:29.044586
52dbfcdc-33ac-4b5c-a14d-8a90cff63424	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	6f359745-55ec-43a0-8242-a2a5780c9654	f	2026-02-18 08:53:44.702421
45ff9d38-978d-49e6-a1d4-ee2e96ac1996	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	6f359745-55ec-43a0-8242-a2a5780c9654	f	2026-02-18 08:53:44.708434
0d956218-2b78-4692-acee-d11a0ef392d3	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 パレット 	18126973-d361-4e6b-81e5-ca695625dbb4	f	2026-02-18 08:55:00.516499
e9350a86-da24-4d18-a84e-df0e19b0d42a	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 パレット 	18126973-d361-4e6b-81e5-ca695625dbb4	f	2026-02-18 08:55:00.520334
a891bd45-ae60-47ab-b992-620bb7ea087e	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	29ba9016-73f2-48f1-a8d1-5136610306db	f	2026-02-18 08:55:03.182667
cf5737e6-5208-4d92-b9c9-9c45ff493d57	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	29ba9016-73f2-48f1-a8d1-5136610306db	f	2026-02-18 08:55:03.186219
2113a014-055e-4e4f-afca-d46806e90e24	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 PL 	97337a00-deb3-4076-b0b3-da1ddd360598	f	2026-02-18 08:57:44.163927
ff39a151-4c42-4d7d-8fcb-e2b9c5846332	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 PL 	97337a00-deb3-4076-b0b3-da1ddd360598	f	2026-02-18 08:57:44.169712
66ed4026-2157-41d8-9d24-a0c794f9b241	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	a3e38b4c-8dd0-4002-bfe6-b69007713d8c	f	2026-02-18 08:57:47.160035
a0c25395-7f35-472d-a20e-4808cc3b81a4	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	a3e38b4c-8dd0-4002-bfe6-b69007713d8c	f	2026-02-18 08:57:47.16316
3ff9756b-235a-46a5-b3f0-c1e8014b4eda	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 パレット（PL） 10t	4cc89b62-72bd-4550-86c7-497692fdd1ee	f	2026-02-18 09:03:51.724303
11a7ad50-4655-47eb-aba0-b19e03c9a63b	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 パレット（PL） 10t	4cc89b62-72bd-4550-86c7-497692fdd1ee	f	2026-02-18 09:03:51.728367
2dd3326e-19b6-467a-87c1-573adc9a7d66	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 10t	585341f4-9b66-4b57-adb3-d0b504c32af2	f	2026-02-18 09:03:53.919446
b690ee36-c9bf-477b-b321-d48d5bfada3e	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 10t	585341f4-9b66-4b57-adb3-d0b504c32af2	f	2026-02-18 09:03:53.924542
0178df1e-c15e-4b1a-a169-b30ec5de123f	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 PL（パレット） 10t	6fe0c426-8b5e-4276-9a5f-33aabe8f1a2f	f	2026-02-18 09:07:22.289309
47280c44-b73f-494a-b106-26f1e56b034a	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 PL（パレット） 10t	6fe0c426-8b5e-4276-9a5f-33aabe8f1a2f	f	2026-02-18 09:07:22.293296
8bacab2d-b315-419f-90c5-1655e40b3724	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城  	279474d7-94c0-4ea2-a610-0aa07db98721	f	2026-02-18 09:08:05.606026
6ba7c80d-b288-461c-ad17-5c654e8d425f	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城  	279474d7-94c0-4ea2-a610-0aa07db98721	f	2026-02-18 09:08:05.609787
42b95589-cb83-45a9-b6e1-5a5952695a70	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城  	d42eaf21-84d2-47fe-a0f2-832d314e9e63	f	2026-02-18 09:09:42.888815
248df11a-c389-45b0-ac05-911b3c01ddb7	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城  	d42eaf21-84d2-47fe-a0f2-832d314e9e63	f	2026-02-18 09:09:42.892587
22b89d87-1462-4c12-9efc-b179b50d9b74	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城  	57d551b1-0279-4fbf-8640-ab78eb6cae9a	f	2026-02-18 09:10:09.111041
4e2edcf9-f726-42cd-b855-89a37c48f8a1	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城  	57d551b1-0279-4fbf-8640-ab78eb6cae9a	f	2026-02-18 09:10:09.114065
eca473d3-a7db-4966-b28b-c904e4fc9740	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城  	3ed30369-0b70-49ee-8252-8fd708832ba8	f	2026-02-18 09:12:47.009332
3305bdcf-7607-4f7b-a2cd-4043327fb981	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城  	3ed30369-0b70-49ee-8252-8fd708832ba8	f	2026-02-18 09:12:47.015161
03b46d55-7c57-468e-a76d-eb62a3621444	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	千葉→茨城 サンプル サンプル	5d7e3e5a-71f3-420f-b069-248065c278b4	f	2026-02-18 09:14:15.314485
9b2d4646-57fc-47c4-a6a7-fe6cdce83831	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	千葉→茨城 サンプル サンプル	5d7e3e5a-71f3-420f-b069-248065c278b4	f	2026-02-18 09:14:15.319102
2942ae53-d553-4749-92c4-70ba50218d8e	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	f617dfba-f7ff-4b20-8b8e-0eed20114aca	f	2026-02-18 09:15:49.159652
03033ada-146e-4a68-be32-8316e56a4d39	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	f617dfba-f7ff-4b20-8b8e-0eed20114aca	f	2026-02-18 09:15:49.163207
3028298b-768b-4bb5-84d8-a7eabc6ec029	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	fe47242f-ad5d-4b3b-b75c-807c15429232	f	2026-02-18 09:16:57.493105
be142556-8978-44a5-b8a8-3bb1302c6cc8	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	fe47242f-ad5d-4b3b-b75c-807c15429232	f	2026-02-18 09:16:57.496942
2d2c9166-eca2-4010-b786-d7b2ce04edd8	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 不明（10t車使用から重量未確定）	07edcf01-cb45-44b8-a2c6-7c2b6b03cdce	f	2026-02-18 09:20:18.248654
ba15648e-78ca-4dd2-97d3-8d9b06784f1c	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 不明（10t車使用から重量未確定）	07edcf01-cb45-44b8-a2c6-7c2b6b03cdce	f	2026-02-18 09:20:18.262835
8551d399-db74-4938-8068-c45bcab7c7ce	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	83fb74db-9796-4fd3-8ab8-2bb4b91e49ea	f	2026-02-18 09:26:24.308563
15d25079-54ef-46be-b0b0-4715f3072322	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	83fb74db-9796-4fd3-8ab8-2bb4b91e49ea	f	2026-02-18 09:26:24.312757
f1b0d45f-0d6e-4dbf-b4a3-40744b7a058e	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	f1190658-0ae7-4ad0-adaf-5f5f360ab481	f	2026-02-18 09:26:38.245755
29b49089-839a-468c-a3d6-2278d14a75d0	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	f1190658-0ae7-4ad0-adaf-5f5f360ab481	f	2026-02-18 09:26:38.25051
5c9585cf-75d5-454a-b3c2-9e914608f4ee	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	9c8f1bd1-9a74-4e39-9f71-3adafe77a894	f	2026-02-18 09:27:08.323966
adc9ef12-24bf-4d23-a8aa-d33778c4e891	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	9c8f1bd1-9a74-4e39-9f71-3adafe77a894	f	2026-02-18 09:27:08.344249
92384e11-fa6c-4e17-a795-89bb67c8a531	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→大阪 食品 5t	6303a4d8-6815-46db-a02e-8669a3930c43	f	2026-02-18 09:34:38.979924
37b35daa-953d-4444-8893-3cbacff8f3b9	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→大阪 食品 5t	6303a4d8-6815-46db-a02e-8669a3930c43	f	2026-02-18 09:34:38.984476
932686cb-c819-4139-b525-064cde877c8d	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	3b96c882-d4e7-4cef-8192-72cee38ff41d	f	2026-02-18 09:49:04.431033
ad469524-c27b-4122-a5da-13ac9b13a08d	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	東京→茨城 ラック 	3b96c882-d4e7-4cef-8192-72cee38ff41d	f	2026-02-18 09:49:04.444973
d518d682-7cae-4376-a7d2-0d4c48cca7a7	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	f81ddc35-7dfa-4215-9a59-7f554daba06a	f	2026-02-18 11:29:09.5158
13aa669a-c54d-43f0-afe0-f5fee4d67364	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	f81ddc35-7dfa-4215-9a59-7f554daba06a	f	2026-02-18 11:29:09.519179
a36489a7-4c85-4312-b156-5fe5719cfa8a	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	628969bb-d1a7-48a3-97a5-e6c84dcfe263	f	2026-02-18 11:33:34.211779
f252a9ca-b44e-4906-a432-6ec95965464e	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	628969bb-d1a7-48a3-97a5-e6c84dcfe263	f	2026-02-18 11:33:34.224847
09ca306f-4e89-4da3-8b25-0ca3665a72ad	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	a316d95c-3f47-4e3a-9e03-94a35c1abdd3	f	2026-02-18 11:34:29.988523
30f30eee-2255-4c2f-9199-a4d0f9532f83	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	a316d95c-3f47-4e3a-9e03-94a35c1abdd3	f	2026-02-18 11:34:29.991465
23f00f1e-a65b-420a-aa06-0686b8cc4f9e	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	8ae77107-808f-4b52-919a-b3d0e29f2a3e	f	2026-02-18 11:35:39.68896
d8c64ec7-aefc-407d-888c-27b292142cbc	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	8ae77107-808f-4b52-919a-b3d0e29f2a3e	f	2026-02-18 11:35:39.693319
7ad1ecbc-8a0a-4a5e-86af-3eb07901effa	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	92e8a4db-8f85-4528-b7a9-f79a1c710440	f	2026-02-18 11:36:21.252539
b188d8d6-7492-4dda-9e84-b3947fbd18f1	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	92e8a4db-8f85-4528-b7a9-f79a1c710440	f	2026-02-18 11:36:21.256556
2b2ff257-3798-4029-b2bf-98eb9710667d	df5b3e74-7d02-4469-9c87-713f2a6b1326	truck_new	新しい空車が登録されました	東京→大阪 10t車 	2ea251cb-460d-4031-a23f-9e15399da185	f	2026-02-18 11:38:26.65243
6259fda5-22f5-458a-81bc-ddb80ec84b40	2daddea0-32eb-470e-bb11-4ea251257485	truck_new	新しい空車が登録されました	東京→大阪 10t車 	2ea251cb-460d-4031-a23f-9e15399da185	f	2026-02-18 11:38:26.655861
0105920d-0689-408c-a697-f42a39f85cd2	df5b3e74-7d02-4469-9c87-713f2a6b1326	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	f	2026-02-18 12:10:41.206403
7dc66ad0-b5f5-4498-ad3c-944fc04019b8	df5b3e74-7d02-4469-9c87-713f2a6b1326	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「サンプル」のユーザー追加申請がありました	42bf06bd-fc08-496e-a20b-9a90bbfdfcd4	f	2026-02-18 12:18:59.140314
adddf010-1cf9-494f-98d0-827ffde032a2	962f53e2-ae24-474a-9b7b-8d9a58c5c750	user_approved	アカウント承認	アカウントが承認されました。ログインしてサービスをご利用ください。	\N	f	2026-02-18 13:03:42.788611
091c7722-73e5-40ff-b6c2-cdc7768ca059	df5b3e74-7d02-4469-9c87-713f2a6b1326	user_registered	新規ユーザー登録	サンプル が新規登録しました。承認をお願いします。	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	f	2026-02-18 13:11:16.958754
5b3688cc-1051-4d3d-a7ec-90a2a0fe7211	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	user_approved	アカウント承認	アカウントが承認されました。ログインしてサービスをご利用ください。	\N	f	2026-02-18 13:12:28.93864
e91bae98-58c7-409b-8882-c791654fd73d	df5b3e74-7d02-4469-9c87-713f2a6b1326	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	f	2026-02-18 13:15:57.282569
e045d3e3-ae7c-440b-8a2d-b6c4b893d5c9	df5b3e74-7d02-4469-9c87-713f2a6b1326	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「a」のユーザー追加申請がありました	ffca69cd-7eb8-4e8c-941c-d21136c012b3	f	2026-02-18 13:16:37.995757
36d0a268-f40e-40b2-b462-0c7e014b8255	df5b3e74-7d02-4469-9c87-713f2a6b1326	plan_change	プラン変更申請	サンプルがプレミアムプラン（¥5,500/月）への変更を申請しました	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	f	2026-02-18 13:20:55.983011
930d45f7-ab7e-48c1-b4ac-79727bf1308e	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	f	2026-02-18 13:21:41.022917
800c0a10-f8d8-4b38-9073-8c78be1457d5	df5b3e74-7d02-4469-9c87-713f2a6b1326	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「テストログイン太郎」のユーザー追加申請がありました	3a34b255-1bf5-4fbb-a485-d1f4db86b3a2	f	2026-02-18 13:25:07.192636
d19698ed-8eed-401a-adbe-3e33f26d7a5f	df5b3e74-7d02-4469-9c87-713f2a6b1326	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	f	2026-02-18 13:49:34.897395
5411e285-49e6-496b-b419-29e81c542fc6	2daddea0-32eb-470e-bb11-4ea251257485	admin_notification	サンプル	サンプル\nサンプル	\N	f	2026-02-18 14:12:36.078353
70c34a13-fc39-4b56-9661-ea97c0fc27cc	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	admin_notification	サンプル	サンプル\nサンプル	\N	f	2026-02-18 14:12:37.213441
40368a36-6d14-438a-bc2d-5689c02d181c	424e7952-7c1d-4b88-badb-ee0bbe4e15fa	admin_notification	サンプル	サンプル\nサンプル	\N	f	2026-02-18 14:12:38.356341
9b2be32a-83ae-4abc-ac07-fd64f58b84ce	962f53e2-ae24-474a-9b7b-8d9a58c5c750	admin_notification	サンプル	サンプル\nサンプル	\N	f	2026-02-18 14:12:39.530546
83dd0874-967f-4a4e-b7cd-2d59f43a0a1a	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	t	2026-02-18 12:10:41.193025
1897a087-4c38-47d7-8115-9992565f0c94	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「サンプル」のユーザー追加申請がありました	42bf06bd-fc08-496e-a20b-9a90bbfdfcd4	t	2026-02-18 12:18:59.126842
ead599fd-f478-40f5-b556-e39e500a756e	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	t	2026-02-18 13:07:16.52172
0ed618fb-7797-4f9f-ad8d-c08c3dd9fcad	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	t	2026-02-18 13:10:01.728484
76b8b566-1efc-4c66-ab9e-48178dea26e3	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加承認	「サンプル」のユーザー追加申請が承認されました	\N	t	2026-02-18 13:10:09.77074
b739ec38-b789-442d-8071-6ec21b953cc0	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_registered	新規ユーザー登録	サンプル が新規登録しました。承認をお願いします。	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	t	2026-02-18 13:11:16.954947
6945788c-817a-44a2-8be4-ac33077fee67	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	t	2026-02-18 13:14:39.505556
91796190-3fea-47ea-8d2b-0e6d08db8e3c	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加承認	「テスト太郎」のユーザー追加申請が承認されました	\N	t	2026-02-18 13:15:02.07159
b5d87e25-1f72-45d0-8aca-d865a7e2920d	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	t	2026-02-18 13:15:57.278667
ab33ace8-aa92-4cd0-8aab-6b43c31f9a9b	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	t	2026-02-18 13:16:22.285933
e8f51497-9059-4fa2-b5fb-fd4b097a6f19	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「a」のユーザー追加申請がありました	ffca69cd-7eb8-4e8c-941c-d21136c012b3	t	2026-02-18 13:16:37.992256
14ed7eb4-819d-4a7d-92a6-04f99a22fec4	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加承認	「a」のユーザー追加申請が承認されました	\N	t	2026-02-18 13:17:00.815469
f9388280-6ebb-4be8-a597-332575438f23	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更申請	サンプルがプレミアムプラン（¥5,500/月）への変更を申請しました	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	t	2026-02-18 13:20:55.979312
1ad87a5a-7be7-4a2e-9b6f-5f9497db9591	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加申請	SIN JAPAN LLCから「テストログイン太郎」のユーザー追加申請がありました	3a34b255-1bf5-4fbb-a485-d1f4db86b3a2	t	2026-02-18 13:25:07.188197
8f37df6a-ca1c-431e-a36d-a724be20dd40	8524e6bc-44ec-4980-bd54-3f5b63d38c28	user_add_request	ユーザー追加承認	「テストログイン太郎」のユーザー追加申請が承認されました。ログイン可能です。	\N	t	2026-02-18 13:26:04.379675
e4c8817f-eb81-49b1-8ffa-5bdba0966574	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更申請	SIN JAPAN LLCがプレミアムプラン（¥5,500/月）への変更を申請しました	8524e6bc-44ec-4980-bd54-3f5b63d38c28	t	2026-02-18 13:49:34.901611
bd3bd0f3-612a-4fd6-ba0b-7cbd5d06e834	8524e6bc-44ec-4980-bd54-3f5b63d38c28	plan_change	プラン変更承認	プレミアムプラン（¥5,500/月）への変更が承認されました	\N	t	2026-02-18 13:49:40.411883
fb835e96-e8b0-44a7-9316-c75381c34719	8524e6bc-44ec-4980-bd54-3f5b63d38c28	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.383237
0aca7739-cdde-49cf-8c6a-f707e0336cef	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.387306
82613214-1820-4b68-843f-5922278f02ea	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.391228
6cbeb601-8009-485f-a23a-3f0ec3cd2320	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.394781
811e5def-394d-4993-9df2-7db2a15783a1	424e7952-7c1d-4b88-badb-ee0bbe4e15fa	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.398135
49d9c578-c79b-47bf-8c38-2fafe5e7b2aa	962f53e2-ae24-474a-9b7b-8d9a58c5c750	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.402197
7eb605b8-822a-4e20-8b67-8ee065eac27d	412bf243-e676-41f6-987c-b19341fa56f3	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.405963
b406fc7e-07c9-46c9-8ca0-08c7b5265add	be7eba29-3438-451a-89a0-dae268b590e1	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.409498
891a913f-981c-4936-9059-98450dbbabc0	c300ad86-244a-4495-9446-ffd4c50713ff	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.413157
49519298-4090-46dc-8b41-d5dd0bd1f44a	f060c152-3734-4c47-b26b-69db4154e8fd	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.416569
497b1303-2e63-48ec-9b8a-7d025eca023a	9aeb9f7f-0a79-47de-91bd-b260b9b57d75	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.420096
18221601-88d7-4974-817a-8fff8bd07d4d	cc5aca81-e569-446d-ad44-518de8e319e8	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.423816
c52cd8ff-2769-4f18-93ae-42c54782e0b7	e25dfea7-7c1d-4df4-be34-39ad2c11d60f	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.427652
8680b2ba-c386-441b-852c-69b1f776f1d8	5b040a32-0746-4259-bf6b-24f1319de036	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.431494
44040216-7036-452e-a291-e31328c8e6c1	cab87083-33c7-41ca-a5d6-2aa3306f7f3c	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.435263
f1b01dda-5757-44e3-bb02-af4f075b02d1	5f63224a-4cee-4fc1-a886-cc4ad446c374	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.43834
d73e2ed3-ce1b-484b-8913-aaa32a4c2325	f0c0bc3b-e38a-4065-8b5d-d64ea4817b20	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.441907
9ecdba22-7ba0-4136-8e1b-65dabb4b28e2	2b9728a1-8957-4c3a-8c55-bc027e58f3ae	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.445098
71e71224-2dca-4523-9940-7d9c6bee44b8	6e54a5bc-de1f-4b47-985b-026716eef691	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.448831
48e36931-cae1-4673-a6dd-63efa6892910	8b52aa33-ff87-448b-bac4-2946813865f2	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.452355
b6ffa5a7-6b66-40cf-a810-709d8ac8824f	7672141d-05c3-4354-8391-b1a591784314	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.456145
0cdede23-eca9-4b59-8982-c0c32e5a05ec	1e1e96c1-0b8c-4591-b8af-f0624eb9260f	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.459646
b213faf1-7ad1-4fcd-8c35-fca3281d2135	a41c254f-dc49-499f-ab56-2e10b4d97d07	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.462545
8f1e30a5-f31f-4c8d-a519-8a7430ec6a97	f07f6e3b-bb9b-4e73-9e8f-4332789a42d1	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.466527
97d2342a-cdde-4252-a9b3-3ec63ae65eaa	b08ad358-86b7-4a8f-b31c-46cd5df5bfd2	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.47055
57144a09-59d5-4ec3-8619-cd3447ecd471	b7beec3e-0544-4fcd-a2f3-d98429563aa6	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.474828
defe92e2-4eea-4494-a751-4fad5fb8b6bc	b0b8837a-69ca-42bc-b420-00e8ca20e14f	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.479452
946228ab-4647-47a3-a6e2-8c609f064e20	7df13401-3e72-44a9-b958-1caa43db68c5	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.484151
88f4e6d1-08ea-4203-96e0-290a0acc0b95	4e7c5d92-d814-4a00-946b-3b53bd9cb777	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.488811
bd913daa-4123-43c6-b4b1-a12de69a3b6b	30ef598a-0247-4940-84b5-1e9ddeeb10d5	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.492811
137503b7-01dc-403a-9330-259f3f47b6a2	75afed5b-0af2-46f6-b5ef-c2f784ccae83	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.496365
2734c2b8-7fd3-495a-9ec8-0081515d24e2	04e2660a-c43d-4376-8f6c-64f7636c666a	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.49978
e4d171e3-e5f9-40d7-9334-d0325cabe0a8	fcc02b8f-2310-4654-b806-f3ab07457e19	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.503342
0bddd635-39ca-486c-8406-91e71948f4aa	c600b749-b276-4708-90ca-be3e904d9639	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.507253
b6cea57f-2192-4c2a-bba7-e69d747fc2d3	aeffd472-8dea-4518-bbf8-cd346d788435	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.511477
0cb89fb3-e473-420c-aca3-e8197c877474	79b95cf1-b59c-4c88-ac39-004b09a80121	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.515377
c0275cf8-17d0-485f-b4c8-66c8edc96843	a6220bb0-a46e-4a98-be66-e5b3cd44ac93	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.519169
eb3fd4b8-04c1-4830-8e97-97947ffdf693	57c956f6-868c-4df0-8bdd-64a630f7ed2b	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.523079
a3ac8dce-13ed-4b4e-b557-a3055f8a9a35	ee32adbc-700a-4986-b3f0-d24619d4eaad	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.527142
14839509-d7f0-45f5-a748-2227dc313601	a1da15c8-5699-4553-8a81-3999fc9b7565	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.532307
ad96d926-1131-4fe7-a0d2-6a74b89fee7a	53546504-54d7-46c6-8602-975bdf35bb85	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.535765
a7478a1c-b064-4ff3-bc4e-4fb1f8433fd1	5716ab67-dced-48e5-b128-2d6e883dc83e	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.538924
bfc97b51-ce96-45b7-89d1-87c0579dffc1	fbc52150-0350-4fce-9ad3-29b0e1ff1f29	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.542621
a0b82c2b-af28-438a-911e-83e85ddcfcae	33dfb624-cd15-40ca-a751-60fd9db154a3	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.545726
d8b062a9-768f-4a9a-aad3-de64d9ae23a4	05b7b730-ddce-459d-b39c-6cf3a5f74e28	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.548579
e879cb77-4e45-48b9-94ca-49abab8c2cca	01858591-b44a-401a-ad76-fceafd531179	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.551878
aeb78fa2-fc9e-442e-a562-8a57939d4d97	611e4a1d-fe13-4f8c-9f18-8842e7d1066c	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.554755
55a521e9-f1d4-4002-8d85-2262bf46b4ef	97e05289-1639-4dd2-b2b8-d0c0de82b329	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.558285
9891fde4-530e-4b86-87f0-f7154d0d8e0b	0320493f-754b-4c58-a46e-f8ec01c2b6ed	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.561863
09d1f844-c2d5-4cb9-b1fc-f148688d054e	4208046b-4d32-490a-8949-9096592f6324	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.565367
d0db97b7-f54c-490e-9af6-b3cab27c7b3a	72edd7f6-39d6-4066-a131-efd39e0b1bea	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.568764
633b643c-9cd6-4ebf-a93c-f9158c9ed8e7	03b3c350-a37c-48b2-9f58-e2a4ca3ef396	cargo_new	新しい荷物が登録されました	→  	8989e6b4-d40b-4407-8b50-a59bbb51e6e5	f	2026-02-18 16:05:02.57182
2ae1fc3c-c425-4cb3-9bfb-23f4dea651b8	8524e6bc-44ec-4980-bd54-3f5b63d38c28	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.014423
e2c7de27-65c8-4ffe-929b-cecc245cfea0	df5b3e74-7d02-4469-9c87-713f2a6b1326	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.019511
adce7376-a383-4e5d-96df-f513533a8c9a	2daddea0-32eb-470e-bb11-4ea251257485	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.024578
513d83e9-7c8c-4389-8574-7aeb8a1a1a14	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.028391
c3f0f99b-db07-4f94-bfbc-c5ca7354c32f	424e7952-7c1d-4b88-badb-ee0bbe4e15fa	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.032516
6c1b1a06-cc65-44a5-9be9-fe1e31c4792d	962f53e2-ae24-474a-9b7b-8d9a58c5c750	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.035459
f3249500-fc33-4fc3-82f6-2faf95aa771f	412bf243-e676-41f6-987c-b19341fa56f3	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.039355
69ca88e4-627a-48f2-aa84-44ad614bad2b	be7eba29-3438-451a-89a0-dae268b590e1	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.043003
7f7d67ae-c54c-412a-a8b6-29ba8e35e987	c300ad86-244a-4495-9446-ffd4c50713ff	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.046506
ea5bc080-e60a-4cfa-b399-e0fca7165db2	f060c152-3734-4c47-b26b-69db4154e8fd	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.050037
aa284ded-1989-4c1b-b7f4-31b8ee4b00cf	9aeb9f7f-0a79-47de-91bd-b260b9b57d75	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.054226
365faf05-250b-43f3-9e99-8c01b3473ba0	cc5aca81-e569-446d-ad44-518de8e319e8	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.058459
88219efa-d1bf-4f85-861a-db3fe26f8b08	e25dfea7-7c1d-4df4-be34-39ad2c11d60f	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.06289
cc010a30-ad1c-4b75-b6c7-3cbc3e98da85	5b040a32-0746-4259-bf6b-24f1319de036	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.068238
78ea9e12-a0bb-4107-877a-d18f53dfb900	cab87083-33c7-41ca-a5d6-2aa3306f7f3c	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.073817
c0b74229-8711-4ca2-8d65-337f77dfe6fb	5f63224a-4cee-4fc1-a886-cc4ad446c374	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.078904
453e1b8c-9fc1-4bf9-a88c-0c69ab9be558	f0c0bc3b-e38a-4065-8b5d-d64ea4817b20	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.083738
5d1fa9f0-3d2f-4791-a4ab-76392ca2197f	2b9728a1-8957-4c3a-8c55-bc027e58f3ae	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.088298
0ec9e5ba-27f5-4118-ae44-c51d1c47eaf7	6e54a5bc-de1f-4b47-985b-026716eef691	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.092176
c90e4607-0598-4e02-b130-0423ab152509	8b52aa33-ff87-448b-bac4-2946813865f2	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.096538
6357c7dd-5a82-4d81-9a3d-061656a69566	7672141d-05c3-4354-8391-b1a591784314	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.100108
46cce970-b10a-44db-9323-1896cc90470a	1e1e96c1-0b8c-4591-b8af-f0624eb9260f	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.103514
c4172497-8018-41fe-9ec2-8479bea7ae80	a41c254f-dc49-499f-ab56-2e10b4d97d07	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.107443
aef74686-e4b7-4da7-aacb-fbcf24308486	f07f6e3b-bb9b-4e73-9e8f-4332789a42d1	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.111292
72801b53-6a52-4cfb-b42e-67f5a92c3567	b08ad358-86b7-4a8f-b31c-46cd5df5bfd2	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.114939
e5538910-e92e-417f-bb5b-40d2dee4ca1e	b7beec3e-0544-4fcd-a2f3-d98429563aa6	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.118478
f350a5a9-6ef8-423a-ad7a-e11f26241d22	b0b8837a-69ca-42bc-b420-00e8ca20e14f	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.121673
d1fe858b-1605-48cf-860e-10544d2875f3	7df13401-3e72-44a9-b958-1caa43db68c5	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.127807
26cbcd3f-1043-45a1-b922-1f82e2dd0925	4e7c5d92-d814-4a00-946b-3b53bd9cb777	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.130867
ea4d0d75-aecb-4ff4-aa0f-7e1b1386cf82	30ef598a-0247-4940-84b5-1e9ddeeb10d5	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.137633
9702b192-df15-4afe-a50e-fefc0e157eb7	75afed5b-0af2-46f6-b5ef-c2f784ccae83	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.141322
b80ff09e-1089-4278-bc8c-60b0618e4396	04e2660a-c43d-4376-8f6c-64f7636c666a	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.145007
07074b3e-1f7b-4dad-8fb2-6026f4a2976f	fcc02b8f-2310-4654-b806-f3ab07457e19	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.14806
33977764-2ae9-4863-bc22-dd9ea551d2f8	c600b749-b276-4708-90ca-be3e904d9639	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.151524
299b734a-1aa6-4d61-aac7-c0529db7df01	aeffd472-8dea-4518-bbf8-cd346d788435	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.154469
3d65fe89-2478-4428-ae65-2b79cc0f3fe7	79b95cf1-b59c-4c88-ac39-004b09a80121	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.157806
c69c40da-0d47-4ca6-8183-a17e6ac6a2f9	a6220bb0-a46e-4a98-be66-e5b3cd44ac93	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.161186
3bf39086-7816-4e45-ab79-ad2712ae222f	57c956f6-868c-4df0-8bdd-64a630f7ed2b	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.164027
f9021a50-f817-492b-a136-21b4cf368451	ee32adbc-700a-4986-b3f0-d24619d4eaad	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.167289
de848ae5-2481-45b3-9ad7-470866b45984	a1da15c8-5699-4553-8a81-3999fc9b7565	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.170672
b9323ab0-15fc-45d1-ac7a-0c93d8251e19	53546504-54d7-46c6-8602-975bdf35bb85	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.174143
21de7c02-4abb-4212-b4a5-f6e027be0714	5716ab67-dced-48e5-b128-2d6e883dc83e	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.177593
6ff49ff5-2346-4f8f-bd19-66a5a39e1bc4	fbc52150-0350-4fce-9ad3-29b0e1ff1f29	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.181094
1c73efcf-72a6-4d39-b5ef-26af9606b7db	33dfb624-cd15-40ca-a751-60fd9db154a3	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.184378
e9a3ae1e-8187-47ca-b7e7-fa5311c2cba7	05b7b730-ddce-459d-b39c-6cf3a5f74e28	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.187136
e0227723-d6b7-4e54-a441-2b6ec6b64c40	01858591-b44a-401a-ad76-fceafd531179	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.190852
cd4a0ed6-cb25-4f3a-893b-efd9744be818	611e4a1d-fe13-4f8c-9f18-8842e7d1066c	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.193821
978a2c07-67a4-42b4-bafa-2597ec8bcf35	97e05289-1639-4dd2-b2b8-d0c0de82b329	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.197407
2e7f4eba-9096-4beb-90ea-8f0c823d522f	0320493f-754b-4c58-a46e-f8ec01c2b6ed	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.200734
92a02a31-17fb-448b-a639-efac6dd1b159	4208046b-4d32-490a-8949-9096592f6324	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.204127
14ac97ef-2cfa-4502-974d-7adf27d4b499	72edd7f6-39d6-4066-a131-efd39e0b1bea	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.206918
7cdf7b54-9f4c-420f-9952-63629775fa50	03b3c350-a37c-48b2-9f58-e2a4ca3ef396	cargo_new	新しい荷物が登録されました	→  	332b9a24-f56e-4e0c-ac68-2aaf115a28fa	f	2026-02-18 16:10:38.210376
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partners (id, user_id, company_name, company_name_kana, representative, contact_name, phone, fax, email, postal_code, address, business_type, truck_count, notes, created_at) FROM stdin;
19f3634c-4f06-45a1-bbaa-b4a3b3d5e485	8524e6bc-44ec-4980-bd54-3f5b63d38c28	あ									運送会社			2026-02-18 11:49:43.638119
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, used, created_at) FROM stdin;
21a6de48-74d2-4080-a63f-14c923738dbc	8524e6bc-44ec-4980-bd54-3f5b63d38c28	f10ce19b29f1436efeea0b4a19a6c6359e4b3e3c179566767a1070ed5de45c5c	2026-02-18 09:13:40.607	f	2026-02-18 08:13:40.608211
85425923-ef1c-471e-b6fb-1bb36c467c51	8524e6bc-44ec-4980-bd54-3f5b63d38c28	729c466753c644445ad52b9e034aba7eaa36e6d4ac29399141cf7f0d948c3037	2026-02-18 09:44:02.706	f	2026-02-18 08:44:02.707772
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, amount, currency, square_payment_id, status, description, created_at) FROM stdin;
9a429204-8a4b-4fbf-aabe-bdabf3e3c62c	8524e6bc-44ec-4980-bd54-3f5b63d38c28	5500	JPY	\N	pending	β版プレミアムプラン月額料金	2026-02-18 12:36:15.717856
267ed78f-a27f-4988-a5cb-6a3641d531d5	8524e6bc-44ec-4980-bd54-3f5b63d38c28	5500	JPY	\N	pending	β版プレミアムプラン月額料金	2026-02-18 12:37:00.288386
b067d7b0-f7b4-4c0e-9931-bf5d5ab73c2f	8524e6bc-44ec-4980-bd54-3f5b63d38c28	5500	JPY	\N	pending	β版プレミアムプラン月額料金	2026-02-18 12:37:23.642388
fd4d9e67-24f0-429b-8014-2726220aaf79	8524e6bc-44ec-4980-bd54-3f5b63d38c28	5500	JPY	\N	pending	β版プレミアムプラン月額料金	2026-02-18 12:37:32.408516
f8c90894-0784-47a1-8f85-25bb4d8263f3	8524e6bc-44ec-4980-bd54-3f5b63d38c28	5500	JPY	\N	pending	β版プレミアムプラン月額料金	2026-02-18 12:39:12.024997
\.


--
-- Data for Name: plan_change_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plan_change_requests (id, user_id, current_plan, requested_plan, status, admin_note, created_at, reviewed_at) FROM stdin;
938c3f7f-fffd-422f-8fec-5020394c7f49	8524e6bc-44ec-4980-bd54-3f5b63d38c28	premium	premium_full	approved	\N	2026-02-18 12:10:41.151996	2026-02-18 13:07:16.516
test-plan-req-001	8524e6bc-44ec-4980-bd54-3f5b63d38c28	premium	premium_full	approved	\N	2026-02-18 13:07:48.317038	2026-02-18 13:10:01.719
test-plan-002	8524e6bc-44ec-4980-bd54-3f5b63d38c28	premium	premium_full	approved	\N	2026-02-18 13:11:23.051886	2026-02-18 13:14:39.499
9a3872a6-0e59-44cc-b9e9-9f263384353e	8524e6bc-44ec-4980-bd54-3f5b63d38c28	premium	premium_full	approved	\N	2026-02-18 13:15:57.272704	2026-02-18 13:16:22.249
b1cf390b-b272-4c8e-821a-c864f4aeb944	9143865e-70dd-4f7c-88a4-c5d5e80eaf06	premium	premium_full	approved	\N	2026-02-18 13:20:55.974151	2026-02-18 13:21:41.018
3c704f0a-c168-4390-85d6-5887cef24691	8524e6bc-44ec-4980-bd54-3f5b63d38c28	premium	premium_full	approved	\N	2026-02-18 13:49:34.89115	2026-02-18 13:49:40.406
\.


--
-- Data for Name: seo_articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seo_articles (id, topic, keywords, title, content, status, created_at, slug, meta_description, auto_generated) FROM stdin;
c6ec235c-6edd-4e2c-b42e-8b2d6495262e	求荷求車マッチングサービスの活用方法	求荷求車, マッチング, 運送, 物流	求荷求車マッチングサービスの活用方法 - トラマッチが物流業界を変える	# 求荷求車マッチングサービスの活用方法 - トラマッチが物流業界を変える\n\n現代の物流業界において、効率的な輸送手段が求められています。しかし、運送会社と荷主との適切なマッチングが行われないと、コストの増加や納期遅延が発生するリスクも高まります。そこで注目されているのが「求荷求車」マッチングサービスです。中でも「トラマッチ」は、運送業界の情報を簡単につなぐ重要なプラットフォームです。本記事では、トラマッチの活用法やその効果について詳しく解説します。\n\n## H2: 求荷求車マッチングサービスとは？\n\n### H3: 求荷求車の基本概念\n\n求荷求車とは、荷主が輸送を必要とする貨物を求め、運送会社が運搬可能な車両を求めるプロセスを指します。この双方向のマッチングによって、物流の効率性が大幅に向上します。特にトラマッチは、リアルタイムに情報を更新し、ユーザーが瞬時に情報を収集できることが特徴です。\n\n### H3: 利用するメリット\n\n求荷求車マッチングサービスを活用することにより、多くのメリットが期待できます。主な利点は以下の通りです。\n\n- **輸送コストの削減**: トラマッチを活用すると、適切な車両を迅速に見つけることができるため、空車の状態を減少させ、コストを抑えることが可能です。\n- **効率的なマッチング**: 利用者同士の情報が豊富であるため、必要な輸送手段を迅速に見つけられます。\n- **時間の節約**: オンラインで簡単に利用できるため、従来の方法よりも時間が大幅に短縮できます。\n\n## H2: トラマッチの特徴と活用法\n\n### H3: 特徴1: ユーザーフレンドリーなインターフェース\n\nトラマッチは、同期的な情報更新が可能なプラットフォームです。ユーザーは画面を通じて、豊富な情報にアクセスでき、自分に合ったマッチングを実現できます。特にスマートフォンからもアクセスできるため、出先での利用も可能です。\n\n### H3: 特徴2: 正確な情報提供\n\nトラマッチでは、ユーザーが求める情報がカテゴリー別に整理されており、簡単に検索できます。これにより、希望する運送条件や地域での需要に応じたマッチングがスムーズに行えるのです。\n\n### H3: 特徴3: 多彩な業種への対応\n\nトラマッチは、飲料、食品、建材、機械など多様な業種にわたって活用されています。実際のデータによれば、トラマッチを通じて運搬された貨物の中で、食品関係の輸送案件は年々増加傾向にあります。\n\n## H2: 求荷求車マッチングの成功事例\n\n### H3: 事例1: 小規模運送会社の活用\n\nある小規模運送会社がトラマッチを導入したところ、平均45%の運送コスト削減を実現しました。この会社は、トラマッチを通じて適切な輸送依頼を受けて、新たなクライアントを獲得した結果、売上も約30%増加しました。\n\n### H3: 事例2: 繁忙期における需要と供給の調整\n\n繁忙期の物流ニーズは変動が激しいですが、トラマッチによって需要と供給のバランスを把握することができ、スムーズな運送を実現しています。このデータを基に、運送会社は柔軟な対応が可能となり、顧客満足度の向上にも寄与しています。\n\n## H2: トラマッチを利用するためのステップ\n\n### H3: ステップ1: アカウント登録\n\nまずはトラマッチの公式ウェブサイトよりアカウントを登録します。登録は簡単で、必要な情報を入力するだけで完了します。\n\n### H3: ステップ2: 求荷または求車の掲載\n\n次に、求荷または求車の情報を掲載します。必要な条件や地域を明確に提示することで、より適切なマッチングが期待できます。\n\n### H3: ステップ3: 成果の確認と評価\n\n最後に、マッチング結果を確認し、自らのニーズに合った最適な運送パートナーを見つけます。利用後は評価を行うことで、より良いサービスの向上に貢献できます。\n\n## まとめ\n\n求荷求車マッチングサービスは、物流業界に新たな風を吹き込んでいます。トラマッチは、その使いやすさと高いマッチング精度から、多くの運送業者や荷主に支持されています。利用することで、コスト削減や時間の効率化が可能となります。求荷求車の効果を最大限に引き出すためにも、トラマッチの活用をぜひ検討してみてください。	published	2026-02-18 05:22:24.422064	2026-02-18-419e-求荷求車マッチングサービスの活用方法---トラマッチが物流業界を変える	トラマッチの求荷求車マッチングサービスを活用し、効率的な運送を実現する方法を解説します。物流業界での成功事例も紹介。	t
c3ddfb69-9342-4109-b168-c050b48e73e4	共同配送のメリットとデメリット	共同配送, コスト削減, 物流効率, 混載	共同配送のメリットとデメリット	## 共同配送のメリットとデメリット\n\n物流業界において、共同配送はますます注目を浴びています。複数の企業が物流資源を共有することで、コスト削減や物流効率の向上を図るこの手法ですが、実際にどのような利点や欠点があるのでしょうか？今回は、共同配送のメリットとデメリットを詳しく見ていきます。そして、求荷求車マッチングプラットフォーム「トラマッチ」を利用することで、これらの問題をどのように解決できるかを考察します。\n\n## 共同配送とは\n\n共同配送とは、異なる企業が同じ物流ネットワークを利用して商品の配送を行うことです。これにより、それぞれの企業が個別に行っていた配送をまとめて行うことが可能になります。例えば、異なる企業が同じ目的地に商品を送りたい場合、その商品を一緒に混載して運ぶことができます。このアプローチは、過剰な運行コストを削減し、環境への負担も軽減することが期待されます。\n\n### 共同配送のメリット\n\n1. **コスト削減**\n\n共同配送の最も大きなメリットは、コスト削減です。配送を共同で行うことで、輸送コストが分散され、一台のトラックで運ぶことができる貨物の量が増え、空車率が低下します。実際、ある調査によれば、共同配送を導入した企業では、トラックの走行距離が25%も減少したというデータがあります。\n\n2. **物流効率の向上**\n\n共同配送により、物品の配送が効率化されます。一つのトラックが複数の荷物を運ぶことで、配送の回数が減り、時間の節約にもつながります。物流効率の向上は、顧客へのサービス向上にも寄与し、納期短縮が実現できます。\n\n3. **環境負荷の軽減**\n\n複数の荷物を一度に運ぶことで、トン数あたりのCO2排出量が減少します。このため、企業は環境への配慮を示すことができ、企業イメージを向上させることが可能です。\n\n### 共同配送のデメリット\n\n1. **競合の協力が難しい**\n\n共同配送を行うには、競合同士が協力し合う必要があります。しかし、企業の営業秘密や顧客情報が漏れるリスクがあるため、実際には企業同士での信頼関係が必要不可欠です。また、自社の利益を最優先するあまり、相手との協調が難しくなる場合もあります。\n\n2. **混載の調整が必要**\n\n異なる企業の荷物を混載することで、混載の調整が難しくなる場合があります。荷物の種類やサイズ、重量によって適切な積載方法を考えなければならず、運送会社にとっては手間が増えることもあります。\n\n3. **柔軟性の欠如**\n\n共同配送では、各企業の配送スケジュールに合わせる必要があります。そのため、急な変更や柔軟な対応が難しくなることがあります。また企業ごとのニーズに応じたサービスが提供できなくなることもあります。\n\n## トラマッチによる解決策\n\nこれらのメリットとデメリットを考慮すると、共同配送を円滑に進めるためには、効率的なマッチングシステムが重要です。そこで、求荷求車マッチングプラットフォーム「トラマッチ」を活用することで、共同配送のプロセスがスムーズに行えるようになります。\n\n### トラマッチの特徴\n\nトラマッチは、リアルタイムでの需給情報を提供するプラットフォームです。例えば、現在運行しているトラックの空車情報や、運びたい荷物の状況を瞬時に把握することができます。これにより、運送会社は他の企業と簡単に情報を共有し、共同配送を行う際の荷物の混載がスムーズになります。\n\n### トラマッチの利点\n\n1. **広範なネットワーク**\n\nトラマッチには多くの運送会社や荷主が登録しており、広範なネットワークを活用することで、効率的な物流が実現します。複数の荷物をまとめて運搬することで、コスト削減にも寄与します。\n\n2. **透明性の確保**\n\n他の企業との協力が求められる中で、トラマッチは透明性の高い環境を提供します。価格やサービス内容が明確化されるため、信頼関係を築きやすくなります。\n\n3. **迅速なマッチング**\n\nリアルタイムでのマッチングによって、急なニーズにも迅速に対応できます。これにより、共同配送の柔軟性が向上し、顧客満足度の向上にもつながります。\n\n## まとめ・結論\n\n共同配送は、コスト削減や物流効率の向上を実現する画期的な方法ですが、実現には企業間の協力や調整が不可欠です。トラマッチのような求荷求車マッチングプラットフォームを利用することで、これらの課題をクリアにし、効率的な共同配送を可能にします。今後の物流業界において、共同配送はますます重要な役割を果たすことになるでしょう。	published	2026-02-18 14:25:48.87265	2026-02-18-xgfu-共同配送のメリットとデメリット	共同配送のメリットとデメリットを解説。トラマッチを活用してコスト削減と物流効率を向上させる方法を紹介。	t
e8bd471d-b4cc-49c6-8b2b-5caa2f071295	軽貨物運送で独立開業するステップガイド	軽貨物, 独立, 開業, フリーランス	軽貨物運送で独立開業するステップガイド	## 軽貨物運送で独立開業するステップガイド\n\n軽貨物運送は、少ない初期投資で独立できる人気の高いビジネスモデルです。不景気な時代においても需要が途切れないこの業界で、フリーランスとしての成功を目指すための具体的なステップを解説します。また、物流業界における求荷求車マッチングプラットフォーム「トラマッチ」の活用法についてもご紹介します。\n\n## 軽貨物運送の魅力\n\n### 軽貨物運送とは\n\n軽貨物運送とは、バンや軽トラックなどを利用して小口貨物を運ぶサービスのことを指します。一般的に、積載量は3トン以下とされ、個人事業主として開業するのに最適なモデルです。近年、ネットショッピングやデリバリーサービスの増加に伴い、軽貨物の需要は急増しています。\n\n### 独立開業のメリット\n\n軽貨物運送では、独立してフリーランスとして働くことにさまざまな利点があります。まず、比較的低コストで始められるため、資金を用意しやすい点が挙げられます。また、時間や労働条件を自分で選べるため、柔軟な働き方が可能です。さらに、自分のブランドを持つことで、仕事のスケジュールや収入をコントロールする自由も手に入れられます。\n\n## 軽貨物運送での開業ステップ\n\n### ステップ1: ビジネスプランの策定\n\n独立開業をする前に、まずはしっかりとしたビジネスプランを策定することが重要です。具体的な内容には、提供するサービスの種類、ターゲット市場、競合他社の分析、予算、収支計画などを含めます。例えば、周辺の地域に特化した配送を行うことにより、競争を避けつつ安定した顧客を確保する戦略が考えです。\n\n### ステップ2: 必要な許可と登録の取得\n\n軽貨物運送を行うには、運送業の許可を取得する必要があります。具体的には、運送業者登録や貨物自動車運送業者の資格が必要です。また、ビジネスとしての登録も行います。多くの場合、これには数週間から数ヶ月の時間がかかるため、早めに手続きを進めることが大切です。\n\n### ステップ3: 車両と保険の準備\n\n業務に使用するための車両を準備します。軽貨物運送では、軽トラックやバンが一般的です。運転者としての仕事に必要な適切な保険にも加入することが求められます。これは顧客からの信頼を得るためにも非常に重要です。\n\n## トラマッチの活用法\n\n### 求荷求車マッチングの仕組み\n\n開業した後は、荷物を運ぶことが最も重要な業務となります。ここで活用したいのが「トラマッチ」という求荷求車マッチングプラットフォームです。このサービスは、荷主と運送業者を直接つなぐため、無駄な中間手数料を省き、より効率的に仕事を得ることが可能です。\n\n### マッチングのメリット\n\nトラマッチを利用することで、希望する条件に合った荷物を簡単に見つけることができます。例えば、特定の時間帯やエリアで運べる荷物を検索できるため、自分のスケジュールに合わせた仕事が増え、収入の増加にもつながります。また、利用者同士の評価機能により、取引先の信頼性を事前に確認できる点も大きなメリットです。\n\n## 成功事例の紹介\n\n実際にトラマッチを利用して成功した事例を紹介します。ある軽貨物運送業者は、トラマッチを活用することで、開業初月から3万円の売上を上げ、その後も順調に新規顧客を獲得しています。クライアントとの信頼関係が築けたため、リピーターも増加し、安定した収入を確保できています。このように、正しいツールを使うことで、ビジネスの成長が加速することが実証されています。\n\n## まとめ・結論\n\n軽貨物運送は、コストパフォーマンスが高く、フリーランスとしての独立にはうってつけのビジネスです。しっかりとした計画と準備を行い、トラマッチのようなプラットフォームを活用することで、よりスムーズに事業を運営することができます。このステップガイドを参考にして、成功する軽貨物運送業者への第一歩を踏み出しましょう。	published	2026-02-18 14:26:06.311966	2026-02-18-ihqw-軽貨物運送で独立開業するステップガイド	軽貨物運送で独立開業するためのステップガイド。ビジネスプラン作成からトラマッチの活用法まで解説します。	t
aa1284d3-c828-45ca-a408-a0a928828952	物流コンプライアンスと法令遵守の重要性	コンプライアンス, 法令遵守, 運送業法, 罰則	物流コンプライアンスと法令遵守の重要性	## 物流コンプライアンスと法令遵守の重要性\n\n物流業界において、コンプライアンスや法令遵守の重要性は増す一方です。運送業法をはじめとする様々な規制に従わなければ、企業は厳しい罰則に直面する可能性があります。このような状況を避けるためには、企業は何をすべきか、そしてどのようにして法令遵守を確実に実施することができるのかを考える必要があります。今回は、物流コンプライアンスの重要性と、トラマッチがどのようにその実現を支援しているのかについて詳しく解説します。\n\n## コンプライアンスとは\n\nコンプライアンスとは、法律や規制、業界内の標準、企業の内部規程を遵守することを指します。物流業界では、特に運送業法や関連法令の遵守が求められます。これにより、安全で効率的な運営が促進され、顧客の信頼を獲得することができるのです。\n\n### コンプライアンスの重要性\n\nコンプライアンスが重要な理由は、主に以下の3点が挙げられます。\n\n1. **法的リスクの回避**: 遵守しない場合、厳しい罰則が課せられる可能性があります。具体的には、運送業法に違反すると、最大で10万円の罰金が科されることもあるため、事業運営に大きな影響を及ぼします。\n\n2. **安全性の向上**: コンプライアンスを徹底することで、運送中の事故を防ぎ、労働者や一般市民の安全を確保することができます。これにより、企業の評判を守り、高い顧客満足度を維持できます。\n\n3. **競争力の強化**: コンプライアンスを遵守する企業は、透明性が高く信頼性があると見なされ、競合他社と差別化することができます。顧客や取引先からの信頼を獲得することで、ビジネスチャンスが広がります。\n\n## 法令遵守と運送業法\n\n運送業法は、物流業界において特に重要な法律の一つです。この法律は運送業者が遵守すべき基準や運営方法を定めています。例えば、運送業者は適切な資格を持つ運転手を雇用し、車両の定期点検を実施しなければなりません。また、運送業者の運賃やサービス内容についても透明性が求められています。\n\n### 運送業法に基づく主な規定\n\n運送業法にはいくつかの重要な規定が含まれており、コンプライアンスを実現するためにはこれらを正確に理解し、実践することが不可欠です。以下は主な規定です。\n\n- **運転手の資格要件**: 運転手は適正な免許を保有し、法律で定められた健康診断を受ける必要があります。\n- **車両管理**: 車両は定期的に点検・整備されており、整備不良の車両による事故を防止するための措置が求められます。\n- **運賃の表示**: 運送業者は、運賃や支払条件を明確に顧客に示さなければなりません。透明性を持つことで顧客の信頼感が得られます。\n\n## 罰則とその影響\n\nコンプライアンスが不十分な場合、企業は様々な罰則に直面します。例えば、運送業法に違反して運行することで、最大で10万円の罰金が科せられる他、免許の停止や業務改善命令を受けることもあります。罰則は短期的なものだけではなく、長期的に見ると企業のブランド価値にも悪影響を与え、顧客の信頼が損なわれる可能性があります。\n\n## トラマッチのサービスとコンプライアンス\n\nトラマッチは、求荷求車マッチングプラットフォームとして、物流業界のコンプライアンス向上に寄与するサービスを提供しています。具体的には、以下のような機能を通じて、法令遵守を支援します。\n\n### マッチング機能\n\nトラマッチは、運送業者と荷主の最適なマッチングを実現します。このプラットフォームを利用することで、運送業者は自身の車両情報や運賃を透明に提示することができ、荷主も適切な運送業者を見つけやすくなります。この透明性がコンプライアンスの一環として重要です。\n\n### データ管理と分析\n\nトラマッチは、マッチングデータを元に運送業者の活動をモニタリングし、必要に応じてアドバイスを行います。これにより、運送業者はコンプライアンスの遵守状況を確認しやすく、法令からの逸脱を防ぐことが可能です。\n\n## まとめ\n\n物流業界におけるコンプライアンスと法令遵守は、企業の持続的な成長にとって欠かせない要素です。運送業法の遵守が企業に与える影響は大きく、罰則リスクを回避し、顧客の信頼を獲得するためには、積極的な取り組みが求められます。トラマッチのようなマッチングプラットフォームを活用することで、効率的にコンプライアンスを管理し、ビジネスの競争力を高める助けになるでしょう。	published	2026-02-18 14:26:28.643162	2026-02-18-8zuw-物流コンプライアンスと法令遵守の重要性	物流業界におけるコンプライアンスと法令遵守の重要性について解説し、トラマッチのサービスがどのように支援するかを紹介します。	t
a7f60824-a178-4cf8-a3ea-7dd049009f01	引越し業界と運送業の違いと共通点	引越し, 運送, 業界比較, 許認可	引越し業界と運送業の違いと共通点	## 引越し業界と運送業の違いと共通点\n\n引越し業界と運送業は一見似ているようで、その実、異なる側面を持っています。どちらも貨物を運ぶ業務ですが、ターゲット顧客や許認可の違い、サービス内容において多くの違いがあります。また、最近のデジタルプラットフォームの発展により、これらの業界の効率性が向上しています。特に、トラマッチのような求荷求車マッチングプラットフォームは、引越しと運送業界の連携を強化する助けとなっています。この記事では、引越し業界と運送業の違いと共通点を詳しく見ていきます。\n\n## 引越し業界とは\n\n### 引越しサービスの特色\n\n引越し業界は、主に個人や法人が新しい場所に移動する際に必要なサービスを提供します。典型的な引越し作業は、荷物の梱包、運搬、荷解き、そして新居でのセッティングが含まれます。さらに、引越しの際には特殊な技術や機器が必要になることもあります。たとえば、ピアノや美術品を運ぶ際には、専門のスキルを持つスタッフが必要です。\n\n### 知っておきたい許認可\n\n引越し業を行うには、特定の許認可が必要です。各都道府県での運輸局へ申請し、「引越運送業の許可」を取得しなければなりません。この許可を得ることで、顧客からの信頼を得ることができ、安心したサービス提供が可能になります。特に、悪質な業者によるトラブルが多かったため、許可制度は非常に重要です。\n\n## 運送業界とは\n\n### 運送サービスの特徴\n\n運送業は、引越しを含むさまざまな貨物を運搬するサービス全般を指します。ここでは、物流センターや商業施設への商品の配送、工場間の部品移動などが含まれます。運送業務は多岐にわたるため、より多くのトラックや車両が必要とされ、それに応じた物流システムも必要です。\n\n### 許認可についての重要性\n\n運送業も、特定の許可が必要になります。貨物自動車運送事業の許可を取得し、適切な運行管理を行うことが求められます。違反すると重い罰則が科せられるため、業者は常に法令を遵守する責任があります。\n\n## 引越し業界と運送業界の共通点\n\n### 業務運営の効率化\n\n引越し業界と運送業界は、デジタル化が進む中でどちらも効率化を求められています。例えば、トラマッチのような求荷求車マッチングプラットフォームは、引越しや運送のニーズを結びつけ、無駄なコストを削減します。これにより、双方にとってメリットが生まれます。\n\n### 顧客サービスの重要性\n\n両業界ともに、顧客サービスが重要です。顧客の期待を超えるサービス提供が求められています。特に、引越しにおいては顧客の思い出が詰まった荷物を扱うため、細やかな配慮が必要です。運送業においても、配送の正確さや迅速さが顧客からの信頼を得る要素になります。\n\n## 引越し業界と運送業界の違い\n\n### 顧客層の違い\n\n引越し業界は、個人や法人の「移動」をメインとしたサービスを提供するため、特定のシーズン（春の引越しシーズンなど）にピークが集中します。一方、運送業は、特定の季節に依存せず、継続的に運営されるため、需要の変動が小さいです。\n\n### 運搬量とコストの違い\n\n引越しでは、家財一式を運搬するため、運搬量が大きく、コストも高くなる傾向があります。対する運送業は、軽量貨物が多く、運搬コストも相対的に抑えられます。たとえば、一般的な配送においては、1トン以下の貨物が多く、引越しと比べると運搬費用は安価になります。\n\n## まとめ・結論\n\n引越し業界と運送業界は、業務内容や許認可、顧客層において明確な違いがありますが、共通して効率化や顧客サービスの向上が求められる点も多くあります。最近では、トラマッチのようなプラットフォームを活用することで、両業界間の連携が強化され、さらなる効率化が進んでいます。将来的には、このようなデジタル技術が引越しと運送業界の発展を促すことが期待されています。	published	2026-02-18 14:27:00.088729	2026-02-18-ieor-引越し業界と運送業の違いと共通点	引越し業界と運送業の違いや共通点を知り、トラマッチのサービスを利用した効率的な物流を解説します。	t
40716ad3-db9d-4721-8aef-4035dbe4db78	長距離輸送の効率化テクニック	長距離, 輸送, 中継輸送, 効率化	長距離輸送の効率化テクニック	## 長距離輸送の効率化テクニック\n\n長距離輸送は、多くの物流企業にとってコストと時間の大きな課題です。無駄なコストを削減し、円滑な物流を実現するために、効率化テクニックが求められています。最近では、テクノロジーの進化や新たなプラットフォームの登場により、長距離輸送も大きく変化しています。その中でも「トラマッチ」という求荷求車マッチングプラットフォームは、効率的な輸送を可能にするツールとして注目を集めています。本記事では、長距離輸送の効率化に向けた具体的なテクニックとトラマッチの活用方法について詳しく解説していきます。\n\n## 長距離輸送の現状\n\n長距離輸送は、国内外の物流において重要な役割を果たしています。2022年の物流市場に関する調査によると、日本の長距離輸送は前年比で約10%の成長を遂げ、多くの企業が競争力を高めるために戦略を見直しています。特に、費用対効果を重視する企業が増加しており、効率化は急務です。 \n\n一方で、長距離輸送は以下のような課題があります。\n\n- **燃料コストの高騰**: 燃料価格の変動は、輸送コストに大きく影響します。\n- **運転手不足**: 運転手の確保が困難になっており、長距離運転を避ける企業も増えています。\n- **配送の遅延**: 道路の渋滞や天候の影響で、配送が遅れる事例が多発しています。\n\nこのような課題に直面する中で、効率的な輸送を実現するためのテクニックが求められています。\n\n## 効率化テクニック1: 中継輸送の活用\n\n中継輸送は、長距離輸送を効率化するための有力な手段です。この手法では、最終目的地まで直送するのではなく、一部の地点で貨物を中継地点に分けて運ぶことで、コストを削減します。例えば、東京から大阪までの輸送を考えた場合、途中の名古屋で中継し、そこから大阪への配送を行うことで、効率的なルートを選択できる場合があります。\n\n中継輸送における具体的なデータとして、物流企業Aがこの手法を取り入れた結果、配送コストが15%削減され、納品時間も平均2日短縮されたことが挙げられます。中継輸送を行うことで、輸送ルートや運転手の負担を軽減し、全体の効率を向上させることが可能です。\n\n## 効率化テクニック2: データ分析の活用\n\n長距離輸送を効率化するためには、詳細なデータ分析が欠かせません。運行管理システムを利用して、リアルタイムで輸送状況を把握することで、問題が発生する前に対策を講じることができます。例えば、ある物流企業では、過去の配送データを分析することで、特定の時間帯やルートでの渋滞を予測し、運行スケジュールを最適化することに成功しました。\n\nさらに、データ分析をトラマッチに組み合わせることで、需要予測も可能になります。トラマッチは、全国の荷主とトラックのオーナーをつなぐプラットフォームであり、荷物のニーズをリアルタイムで把握できるため、効率的なマッチングが実現します。このように、データ分析により、具体的な数値を元にした効率的な輸送が可能となります。\n\n## 効率化テクニック3: ルート最適化\n\nルートの選択は、長距離輸送の効率に直結します。無駄な移動を減らし、最短距離で目的地に到達するためには、ルート最適化が必要です。近年では、AI（人工知能）を利用したルート最適化アルゴリズムが注目されています。これにより、リアルタイムの交通情報を基に最適なルートを見つけ、配送効率を向上させることができます。\n\nトラマッチでは、運送業者が効率的なルートを見つけやすくするための機能が用意されています。求荷求車の情報を集約し、最適な配送計画を立てる手助けをします。これにより、企業は輸送コストを削減し、顧客満足度を高めることができます。\n\n## まとめ・結論\n\n長距離輸送の効率化は、現代の物流業界において不可欠なテーマです。中継輸送の活用、データ分析の導入、ルート最適化の実施など、さまざまなテクニックを駆使することで、コスト削減と納期短縮が実現可能です。特に、トラマッチのような求荷求車マッチングプラットフォームは、効率的なマッチングを通じて、長距離輸送の課題を解決する力を持っています。今後の物流業界における効率化は、このようなテクノロジーの活用によって加速するでしょう。	published	2026-02-18 14:27:19.063077	2026-02-18-7xe3-長距離輸送の効率化テクニック	長距離輸送の効率化テクニックを解説し、トラマッチの活用法について紹介します。	t
47f4cbb4-4911-49fd-8fd4-118977b2fa90	2024年問題と運送業界の対策	2024年問題, ドライバー不足, 働き方改革, 運送	2024年問題と運送業界の対策	## 2024年問題と運送業界の対策\n\n2024年に控える運送業界の「2024年問題」は、業界全体に大きな影響を及ぼすとされています。特にドライバー不足や働き方改革に伴う労働環境の変化は、運送事業者に新たな課題をもたらします。今回は、これらの問題に対する各社の対策や解決策、そして「トラマッチ」がどのように貢献できるのかについてご紹介します。\n\n## 2024年問題とは\n\n2024年問題とは、主に運送業界においてドライバー不足が顕在化し、労働環境が著しく変化することを指します。2024年4月から、運転手の労働時間に対する規制が強化され、長時間労働が難しくなることが予想されています。この規制により、特に中小の運送業者は、人手不足に悩まされることが必至です。\n\n### ドライバー不足の現状\n\n国土交通省のデータによれば、全体の輸送業界では約40,000人のドライバーが不足すると見込まれています。さらに、現役ドライバーの高齢化が進行し、若い人材の確保がますます課題となっています。2024年問題によって、ドライバーの労働環境が厳しくなることで、ますます人手不足が深刻化する恐れがあります。\n\n## 働き方改革による影響\n\n### 労働時間の制約\n\n2024年問題に関連する働き方改革は、運送業界においても影響が大きくなっています。ドライバーの労働時間が制限されることで、輸送能力の低下や納期の遅延が予想されます。このため、運送事業者は効率的な運行管理を迫られることになります。\n\n### 業界の変革\n\n一部の企業は、AIを活用した運行管理や、デジタルツールによる業務効率化を進めています。これにより、限られたリソースを最適に活用するための工夫が求められています。こうした流れは、運送業界の働き方改革にもつながり、ドライバーの負担軽減が期待されます。\n\n## トラマッチによる解決策\n\n### 求荷求車マッチングサービス\n\n「トラマッチ」は、需要と供給が効率的にマッチングされることで、運送業界のドライバー不足解消に寄与するプラットフォームです。特に、運送業者が必要とするトラックやドライバーを素早く見つけることができます。これにより、輸送の効率化・迅速化が進み、ドライバーの働き方改革にも対応できます。\n\n### ケーススタディ\n\n実際にトラマッチを利用した運送業者の事例を紹介します。ある会社がトラマッチを導入することで、ドライバー不足を解消するための適正な荷物マッチングを実現しました。結果として、運行効率が30%向上し、ドライバーの負担も軽減されました。このように、トラマッチは運送業界の急速な変化に対応する有力な手段です。\n\n## 実用的な対策と今後の展望\n\n### 積極的なテクノロジー導入\n\n運送業界の労働環境を整えるには、積極的なテクノロジー導入が欠かせません。トラマッチのようなマッチングプラットフォームを利用することで、ドライバーの労働条件を改善し、持続可能な運行を実現することができます。\n\n### 教育と育成の強化\n\nドライバー不足を解消するためには、教育と育成にも注力する必要があります。業界全体で新たな人材の育成に取り組むことが急務です。企業が連携し、効率的な研修制度を構築することで、次世代のドライバーを確保する道筋が見えてきます。\n\n## まとめ・結論\n\n2024年問題は、運送業界に多くの挑戦をもたらす一方で、新たなビジネスチャンスも生まれます。働き方改革による労働環境の変化に対しては、トラマッチのようなマッチングプラットフォームを利用することで、効率的にドライバーを確保し、業務の効率化が図れます。これからの運送業界においては、柔軟な働き方と新たな技術の導入が不可欠であり、各社が変革に取り組む姿勢が求められることでしょう。	published	2026-02-18 14:27:36.597841	2026-02-18-rj6a-2024年問題と運送業界の対策	2024年問題に直面する運送業界の対策について解説し、トラマッチのマッチングサービスを紹介します。	t
0b6c0a58-bbb2-47d7-80e4-770a61401927	グリーン物流の推進と環境対策	グリーン物流, 環境, CO2削減, エコドライブ	グリーン物流の推進と環境対策	## グリーン物流の推進と環境対策：持続可能な未来へ\n\n物流業界は、環境への影響が大きな課題となっている中で、グリーン物流の推進が求められています。CO2削減やエコドライブの取り組みは必須であり、多くの企業がこれを意識しています。特に、「トラマッチ」という求荷求車マッチングプラットフォームは、環境負荷を軽減するための新しい解決策として注目されています。本記事では、グリーン物流の重要性とトラマッチがどのように環境対策に寄与できるのかについて掘り下げます。\n\n## グリーン物流とは\n\nグリーン物流は、物流業務における環境負荷を軽減するための取り組みを指します。この取り組みは、温室効果ガスの排出量を削減し、持続可能な開発を目指すものです。近年、消費者や企業からも環境への配慮が求められており、これに応じて多くの物流会社が革新を試みています。\n\n### グリーン物流の鍵となる要素\n\nグリーン物流の推進にはいくつかの要素があります。以下に主要なものを挙げます。\n\n- **CO2削減**：物流業界は、全体のCO2排出量の約14%を占めています。したがって、効率的な輸送方法の導入が急務です。\n- **エコドライブ**：運転技術の向上により燃費を改善することがエコドライブの重要なプロセスです。具体的には、加速や減速をスムーズに行うことが求められます。\n- **輸送効率の向上**：積載率を高めること、新たな輸送ルートの検討は、CO2削減に直結します。\n\n## トラマッチの役割\n\nトラマッチは、求荷求車マッチングプラットフォームとして、企業が効率的な物流を実現する手助けをしています。物流業務は往々にして無駄が多く、輸送コストが高くなる原因となりますが、トラマッチの活用により、これらの課題を解決できます。\n\n### 効率的なマッチング\n\nトラマッチは、荷主と運送会社を瞬時にマッチングするため、必要な輸送リソースを効果的に配分できます。これにより、無駄な輸送時間が削減され、CO2排出量の低減に寄与します。\n\n### リアルタイムでの情報提供\n\nトラマッチはリアルタイムでの情報供給が可能です。荷物の状況や運送会社の車両状態を把握することで、適切な行動を選択することができます。これにより、無駄な輸送を避けることが可能となり、環境負荷を軽減します。\n\n## エコドライブの推進\n\nエコドライブの重要性は、トラマッチの利用においても顕著です。運送会社は、トラマッチを利用することで、エコドライブを意識した運行計画を立てられます。\n\n### エコドライブのメリット\n\nエコドライブを実施することにより、以下のようなメリットがあります。\n\n- **燃費向上**：運転技術の改善によりコスト削減が期待できる。\n- **事故の減少**：安全運転を促すことで、事故を防ぐことができる。\n- **環境への配慮**：CO2削減により企業の環境への責任を果たすことができる。\n\n## 具体的な事例\n\n実際にトラマッチを活用している企業の中には、顕著な成果を上げている例もあります。ある運送会社は、トラマッチを導入したことで、マッチング精度が向上し、配車効率が30%以上改善されました。この結果、年間で数十トンのCO2削減を達成しています。\n\n### 数字で見るグリーン物流の効果\n\n1. **CO2排出削減**：効率的な配送により、10%のCO2削減につながった。\n2. **コスト削減**：物流コストを最大15%削減。\n3. **顧客満足度向上**：迅速な配送が可能となり顧客からの評価が向上。\n\n## まとめ\n\nグリーン物流の推進と環境対策は、今後の持続可能な社会に不可欠な要素です。トラマッチの活用により、効率的な求荷求車マッチングが実現し、CO2削減やエコドライブの推進に寄与します。企業はこれを機に、環境負荷を軽減しつつ、コスト効率の良い物流を実現していくべきです。持続可能な未来を見据えて、今こそアクションを起こす時です。	published	2026-02-18 14:27:54.916373	2026-02-18-zs8u-グリーン物流の推進と環境対策	グリーン物流の推進と環境対策が求められる中、トラマッチがどのようにCO2削減やエコドライブを実現するのか探ります。	t
13e5600e-9575-4d61-95b1-6fbb1c2efbcc	運送業界のDX化と求荷求車プラットフォーム	物流DX, デジタル化, 求荷求車, テクノロジー	運送業界のDX化と求荷求車プラットフォーム	## 運送業界のDX化と求荷求車プラットフォーム\n\n運送業界におけるDX（デジタルトランスフォーメーション）は、業務効率向上やコスト削減だけでなく、競争力強化においても欠かせない要素です。特に「求荷求車」プラットフォームは、運送業界のデジタル化を促進する重要なツールとして注目を集めています。今や、テクノロジーを駆使した効率的な荷物のマッチングは、物流業務のコアとなっているのです。\n\n## 物流DXとは\n\nデジタル化が進む現代、物流業界も例外ではありません。物流DXとは、テクノロジーを活用して物流業務を変革することを指します。このプロセスは、業務の効率化、リアルタイム情報の提供、顧客サービスの向上に寄与します。\n\n### 物流DXの現状と課題\n\n国土交通省の調査によると、日本の物流業界は依然として人手不足や効率の低い運用が問題視されています。例えば、トラック運転手の高齢化や慢性的なドライバー不足がすすみ、需要に応じた柔軟な対応が求められています。この現状を打破するために、業界全体でのデジタル化が急務とされています。\n\n## 求荷求車プラットフォームの重要性\n\n求荷求車プラットフォームとは、荷主と運送業者をマッチングするためのオンラインシステムです。このシステムを導入することで、業務の効率が飛躍的に向上します。テクノロジーを活用し、必要な荷物と運送できるトラックをスピーディに結びつけることが可能です。\n\n### トラマッチの特徴\n\n「トラマッチ」は、求荷求車マッチングプラットフォームとして、ユーザビリティを重視した設計がなされています。ユニークなアルゴリズムにより、運送業者は最適な荷物を瞬時に見つけ出すことができ、荷主は素早く見積もりを受け取ることができます。さらに、口コミや評価制度を通じて信頼性のある業者と出会えるのも大きな魅力です。\n\n### 効果的な活用方法\n\nトラマッチを利用する際の具体的なステップとして、まずは自社のニーズを明確にし、プラットフォームに荷物情報を登録します。次に、マッチングされた運送業者とのコミュニケーションを行い、受注を確定させます。これにより、時間とコストを大幅に削減することが可能です。\n\n## デジタル化による業務効率の向上\n\n物流DXと求荷求車プラットフォームの導入により、多くの企業が業務効率を向上させています。ある物流会社では、トラマッチの活用により、従来の手動でのマッチング作業を50％以上削減しました。また、荷主側も短時間で適正価格の提示を受けられるため、満足度も向上しています。\n\n### ケーススタディ：成功事例\n\n物流業者A社は、トラマッチを導入したことで、新規受注の獲得スピードが約3倍に向上しました。これにより、運転手の空車時間を減少させ、結果的に業務全体の生産性が改善しました。さらに、デジタル化によってデータ分析が可能となり、次の取引に向けた戦略の立案もスムーズに行えるようになりました。\n\n## まとめ\n\n運送業界のDX化は、テクノロジーの進展とともに必然的な流れとなっています。求荷求車プラットフォームはその中核を成し、新たなビジネスチャンスへの扉を開く存在です。トラマッチのようなサービスは、業務の効率化を実現し、運送業界全体の発展に寄与しています。今後の物流業界において、デジタル化の波を捉えることが求められています。これを機に、貴社もDXへの第一歩を踏み出してみませんか。	published	2026-02-18 14:28:12.119057	2026-02-18-sr4f-運送業界のdx化と求荷求車プラットフォーム	運送業界のデジタル化について、求荷求車プラットフォームの重要性とトラマッチの利点を解説するコラムです。	t
3a35c121-30a7-47ec-ba67-d08c0f5eea78	帰り便を活用した物流コスト削減術	帰り便, 空車, コスト削減, 求荷求車	帰り便を活用した物流コスト削減術	## 帰り便を活用した物流コスト削減術\n\n物流業界では、効率的な運用が求められています。その中でも「帰り便」は、運送料金の削減に大きな影響を与える要素の一つです。空車での帰路を活用することで、企業はコストを大幅に削減できる可能性があります。今回は、帰り便のメリットを詳しく解説し、求荷求車マッチングプラットフォーム「トラマッチ」の活用法を紹介します。\n\n## 帰り便とは\n\n帰り便とは、輸送業者が荷物を配送した後、空車のまま帰るのではなく、帰路で他の荷物を運ぶことを指します。この方式は、物流コストを削減し、効率的な輸送を実現するために非常に有効です。\n\n### 帰り便のメリット\n\n1. **コスト削減**  \n   空車で帰る場合、ほぼ全ての運営コストが無駄になります。しかし、帰り便を利用することで、運送料金を相手側に請求できるため、実質的なコストを削減できます。あるデータによると、帰り便を活用することで平均15%の運送コストが削減されることが確認されています。\n\n2. **環境への配慮**  \n   空車での走行は、二酸化炭素の排出を増加させ環境に悪影響を及ぼします。帰り便を利用することで、無駄なトン数を減らし、環境負荷を軽減することが可能です。\n\n3. **効率的な運用**  \n   複数の荷主のニーズを同時に満たすことができるため、運送業者にとっても効率的です。特に繁忙期には、帰り便をうまく活用することで、競争力を高めることができます。\n\n## 求荷求車の重要性\n\n帰り便を効率的に活用するためには、輸送先のニーズを迅速に把握する必要があります。そこで重要になるのが「求荷求車」です。これは、荷主と運送業者が荷物の発注と受注をマッチングさせるシステムです。\n\n### トラマッチのサービスを活用する\n\nトラマッチは、求荷求車のニーズに応じたマッチングプラットフォームを提供しています。このプラットフォームを利用することで、運送業者は帰り便のニーズをリアルタイムで把握できるため、効率よく荷物を運ぶことが可能です。\n\n#### トラマッチのメリット\n\n1. **効率的なマッチング**  \n   トラマッチは、膨大なデータを用いて、最適な荷物を迅速にマッチングします。運送業者は、空車の状態で帰るのではなく、効率的に帰り便を利用できるようになります。\n\n2. **コスト透明性**  \n   トラマッチでは、運送料金が明確に表示されるため、予算内での輸送を計画しやすくなります。この透明性が、高いコスト削減を実現する要因の一つです。\n\n### 実例：帰り便とトラマッチの活用事例\n\n実際に、トラマッチを活用しているある運送業者では、帰り便を効率化することで、年間で約500万円のコスト削減に成功しました。この業者は、トラマッチを利用することで、リアルタイムで荷物を見つけ、帰り便をスムーズに運用することができたのです。\n\n## トラマッチを利用した具体的なコスト削減法\n\n1. **データ分析の活用**  \n   トラマッチを通じて、過去の配車履歴や荷主のニーズを分析することで、将来の帰り便の見込みを立てることができます。これにより、計画的に運営することが可能になります。\n\n2. **ネットワークの拡大**  \n   トラマッチでは多くの荷主や運送業者が参加しています。この広範なネットワークを利用することで、より多くの帰り便のマッチングが可能になります。\n\n3. **利用者同士のコミュニケーション**  \n   トラマッチ内でのメッセージ機能を使い、荷主と運送業者が直接コミュニケーションを取ることで、ニーズをきめ細かく把握し、帰り便のマッチングを最適化できます。\n\n## まとめ・結論\n\n帰り便を活用することで、物流コストを効率的に削減することが可能です。また、トラマッチの求荷求車マッチングプラットフォームを利用することで、リアルタイムでのマッチングが実現し、さらなるコスト削減が期待できます。帰り便を最大限活かし、物流業界の競争力を高めましょう。	published	2026-02-18 14:28:30.571257	2026-02-18-r6mn-帰り便を活用した物流コスト削減術	帰り便を利用した物流コスト削減の術と、求荷求車マッチングプラットフォーム「トラマッチ」の活用法について解説します。	t
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
tuFLKuqa042DbVALFiDFiKREAy2Oh0CC	{"cookie":{"originalMaxAge":2591999999,"expires":"2026-03-20T16:14:19.807Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"8524e6bc-44ec-4980-bd54-3f5b63d38c28","role":"admin"}	2026-03-20 16:27:42
rbr-3LbL7sSTDK5_7yGKfUuUzsVU3G5G	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-03-20T16:14:02.413Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"df5b3e74-7d02-4469-9c87-713f2a6b1326","role":"admin"}	2026-03-20 16:14:26
79dQXtUdWW5tF2Zj2lYChYw5co0tM8bF	{"cookie":{"originalMaxAge":2592000000,"expires":"2026-03-20T13:26:47.522Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":"424e7952-7c1d-4b88-badb-ee0bbe4e15fa","role":"user"}	2026-03-20 13:26:48
\.


--
-- Data for Name: transport_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport_records (id, user_id, cargo_id, transport_company, shipper_name, driver_name, driver_phone, vehicle_number, vehicle_type, departure_area, arrival_area, transport_date, cargo_description, fare, status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: truck_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.truck_listings (id, title, current_area, destination_area, vehicle_type, max_weight, available_date, price, description, company_name, contact_phone, contact_email, status, created_at, user_id, body_type) FROM stdin;
037b9077-6cff-4d3e-9a85-8973d7592162	10t車 関東→関西 空車あり	東京	大阪	10t車	10t	2026/03/06	100,000	ウイング車。パレット対応可能。翌日着可。高速道路利用。	首都圏運送株式会社	03-9876-5432	dispatch@shutoken-unsou.co.jp	active	2026-02-16 18:17:51.100862	\N	\N
542ef9c9-bda1-4015-b0ae-c6925a138b64	4t車 大阪→名古屋 空車	大阪	愛知	4t車	4t	2026/03/07	45,000	箱車。冷蔵機能なし。午前中出発可能。ドライバー1名。	大阪ロジスティクス株式会社	06-1111-2222	info@osaka-logistics.co.jp	active	2026-02-16 18:17:51.100862	\N	\N
c19b75a2-a02a-4964-98e9-efcef12136a0	大型トレーラー 九州→関東	福岡	東京	トレーラー	20t	2026/03/09	200,000	海上コンテナ輸送対応。20ftコンテナ可能。福岡港付近から出発。	九州物流株式会社	092-333-4444	haisha@kyushu-butsuryu.co.jp	active	2026-02-16 18:17:51.100862	\N	\N
5cd8ea12-174b-4801-8642-c5f1f87feeff	2t車 東京都内 空車	東京	東京	2t車	2t	2026/03/05	25,000	都内配送専門。狭い道路も対応可能。引越し・小口配送に最適。ゲート車。	東京デリバリー株式会社	03-5555-6666	delivery@tokyo-delivery.co.jp	active	2026-02-16 18:17:51.100862	\N	\N
ba0b9c50-3833-4a80-b0a9-5a538ae99b05	冷蔵10t車 東北→関東	宮城	埼玉	10t車	10t	2026/03/11	130,000	冷蔵冷凍車。-20度まで対応。食品輸送実績多数。HACCP対応ドライバー。	東北冷蔵運輸株式会社	022-888-9999	reizo@tohoku-reizo.co.jp	active	2026-02-16 18:17:51.100862	\N	\N
92e8a4db-8f85-4528-b7a9-f79a1c710440	10t車 東京→大阪 空車あり	東京	大阪	10t車		2023/03/05			SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 11:36:21.247033	8524e6bc-44ec-4980-bd54-3f5b63d38c28	
2ea251cb-460d-4031-a23f-9e15399da185	10t車 東京→大阪 空車あり	東京	大阪	10t車		2026/03/05	1		SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	active	2026-02-18 11:38:26.645598	8524e6bc-44ec-4980-bd54-3f5b63d38c28	
\.


--
-- Data for Name: user_add_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_add_requests (id, requester_id, name, email, role, note, status, admin_note, created_at, reviewed_at, password) FROM stdin;
42bf06bd-fc08-496e-a20b-9a90bbfdfcd4	8524e6bc-44ec-4980-bd54-3f5b63d38c28	サンプル	サンプル	member	\N	approved	\N	2026-02-18 12:18:59.059571	2026-02-18 13:10:09.752	
test-useradd-002	8524e6bc-44ec-4980-bd54-3f5b63d38c28	テスト太郎	test@example.com	member	\N	approved	\N	2026-02-18 13:11:27.112929	2026-02-18 13:15:02.065	
ffca69cd-7eb8-4e8c-941c-d21136c012b3	8524e6bc-44ec-4980-bd54-3f5b63d38c28	a	a	member	a	approved	\N	2026-02-18 13:16:37.98398	2026-02-18 13:17:00.809	
3a34b255-1bf5-4fbb-a485-d1f4db86b3a2	8524e6bc-44ec-4980-bd54-3f5b63d38c28	テストログイン太郎	login-test-BfAUka@example.com	member	\N	approved	\N	2026-02-18 13:25:07.179393	2026-02-18 13:26:04.375	$2b$10$i92UBgsCzLujeKcKt.5..ulQyRCi3Rfbx9y9FoJptWeWSdRR1WcfG
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, company_name, phone, email, user_type, role, address, contact_name, fax, truck_count, permit_file, approved, payment_terms, business_description, company_name_kana, postal_code, website_url, invoice_registration_number, registration_date, representative, established_date, capital, employee_count, office_locations, annual_revenue, bank_info, major_clients, closing_day, payment_month, business_area, auto_invoice_acceptance, member_organization, transport_license_number, digital_tachograph_count, gps_count, safety_excellence_cert, green_management_cert, iso9000, iso14000, iso39001, cargo_insurance, plan, closing_month, payment_day, bank_name, bank_branch, account_type, account_number, account_holder_kana, accounting_contact_name, accounting_contact_email, accounting_contact_phone, accounting_contact_fax, line_user_id, notify_system, notify_email, notify_line, added_by_user_id) FROM stdin;
8524e6bc-44ec-4980-bd54-3f5b63d38c28	info@sinjapan.jp	$2b$10$VrxWeMUCYnTf6NuJu7/7W.PnU4FC9TXK1vki90wKlQ3TnHphYW84m	SIN JAPAN LLC	046-212-2325	info@sinjapan.jp	admin	admin	神奈川県愛甲郡愛川町中津7287	\N	046-212-2326	0	\N	t	\N	サンプル	\N	2430303		サンプル	\N	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	末日	翌々月	サンプル	\N	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	サンプル	premium	当月	末日	相愛信用組合（2318）	本店（003）	普通	0170074	ド）シン　ジャパン	サンプル	サンプル	サンプル	サンプル		t	t	t	\N
df5b3e74-7d02-4469-9c87-713f2a6b1326	admin	$2b$10$vDDqoSa7pwdk9YtS9HeNF.lhqd9fYpWuNRsuqkKMHgQldGwLjeQtS	トラマッチ運営	03-0000-0000	admin@tramatch.jp	admin	admin	東京都渋谷区テスト2-3-4	\N		\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
2daddea0-32eb-470e-bb11-4ea251257485	sample_company	$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12	大和エクスプレス株式会社	03-5678-1234	info@yamato-express.co.jp	carrier	user	東京都品川区東品川3-15-8	佐藤 健太	03-5678-1235	45	\N	t	\N	一般貨物自動車運送事業、引越運送、倉庫業	ヤマトエクスプレスカブシキガイシャ	\N	\N	\N	\N	田中 太郎	\N	\N	\N	\N	\N	\N	\N	\N	\N	関東・東北・中部	\N	\N	関自貨第1234号	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
9143865e-70dd-4f7c-88a4-c5d5e80eaf06	a@aa.com	$2b$10$YYPyZWbuZz9oasxe3p4KDeWgzR.fgOw6/vjwC1yoQxQ7dN0QyJO3e	サンプル	サンプル	a@aa.com	carrier	user	サンプル	サンプル	サンプル	サンプル		t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium_full	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
424e7952-7c1d-4b88-badb-ee0bbe4e15fa	login-test-BfAUka@example.com	$2b$10$i92UBgsCzLujeKcKt.5..ulQyRCi3Rfbx9y9FoJptWeWSdRR1WcfG	SIN JAPAN LLC	046-212-2325	login-test-BfAUka@example.com	admin	user	\N	テストログイン太郎	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	8524e6bc-44ec-4980-bd54-3f5b63d38c28
962f53e2-ae24-474a-9b7b-8d9a58c5c750	testuser_gGB6cC	$2b$10$nvuXKVjbLHn1XVlIfguIYeDCV0ydHYXoy3bUeL5qmEhyE/09zNaDC	テスト運送株式会社	03-1111-2222	test@example.co.jp	shipper	user	\N	\N	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
412bf243-e676-41f6-987c-b19341fa56f3	agent_三重_1771429161600	$2b$10$eq2gFEUvDic5.QfTFhXE2.n9jFopH/mgmTN5VfYE/v147Vq2vcM.C	SIN JAPAN 三重配車センター		agent-mie@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
be7eba29-3438-451a-89a0-dae268b590e1	agent_京都_1771429161687	$2b$10$zanLHoBU6D6b8mON2x518u6gGMfFO3kwD98PAjuZ7VgLZKfe6RcEy	SIN JAPAN 京都配車センター		agent-kyoto@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
c300ad86-244a-4495-9446-ffd4c50713ff	agent_佐賀_1771429161778	$2b$10$gLzcI85jont3VGgCXV4lA.jm5sVlLlG16BnJamOvjEKnbU3p8KlIq	SIN JAPAN 佐賀配車センター		agent-saga@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
f060c152-3734-4c47-b26b-69db4154e8fd	agent_埼玉_1771429162144	$2b$10$n/66L7U1PzhyE7kEGDUZkef4Wf/xsQx7IcpDXaMNJkZAnZr88pDMq	SIN JAPAN 埼玉配車センター		agent-saitama@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
9aeb9f7f-0a79-47de-91bd-b260b9b57d75	agent_兵庫_1771429161856	$2b$10$Ncuyg.AUJTF/0ewV7bT8.O6VEOwzwW5NPqU7vyLbBdwhaSa1kQZwS	SIN JAPAN 兵庫配車センター		agent-hyogo@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
cc5aca81-e569-446d-ad44-518de8e319e8	agent_広島_1771429163265	$2b$10$v.t4enaYqUEw6ONwV5GxBeRNSSM2p1gbCZ34ETC0ghqP1Xk0p2TNG	SIN JAPAN 広島配車センター		agent-hiroshima@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
e25dfea7-7c1d-4df4-be34-39ad2c11d60f	agent_千葉_1771429161997	$2b$10$ASEFl3e87Hp4eSdX3i4kZuU3Rm4EJIJ9kPdQWrFasIqbDjDJevQHi	SIN JAPAN 千葉配車センター		agent-chiba@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
5b040a32-0746-4259-bf6b-24f1319de036	agent_和歌山_1771429162069	$2b$10$iWL7.7cmDQL8Xw0wz84aLe7rmUCwwsAV8T7IlFihBFT1SiZ6EtIIa	SIN JAPAN 和歌山配車センター		agent-wakayama@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
cab87083-33c7-41ca-a5d6-2aa3306f7f3c	agent_大分_1771429162226	$2b$10$p6FmYF1gN2.5uDrU62TfNO2efcytQSZ5cXW/cUUZlQkfKJ7YWk9He	SIN JAPAN 大分配車センター		agent-oita@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
5f63224a-4cee-4fc1-a886-cc4ad446c374	agent_大阪_1771429162310	$2b$10$kXjgvPToaWZnSrjRtkMc1elPBQjYzidn/ikA8phuI/.gym.5ZyG3.	SIN JAPAN 大阪配車センター		agent-osaka@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
f0c0bc3b-e38a-4065-8b5d-d64ea4817b20	agent_奈良_1771429162384	$2b$10$JuTUr07T/xPmhAEQmn5z1.R39fbeMAHnM2I4r0j6mbcud7yOuy4ze	SIN JAPAN 奈良配車センター		agent-nara@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
2b9728a1-8957-4c3a-8c55-bc027e58f3ae	agent_宮城_1771429162465	$2b$10$LuL7Rv5iCuB7eaiSI6HiS.kx1orhNY85WNUsG3/1Tba9GoFjhPnUG	SIN JAPAN 宮城配車センター		agent-miyagi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
6e54a5bc-de1f-4b47-985b-026716eef691	agent_宮崎_1771429162543	$2b$10$2YdM.DqqDe3ljrJrdg5s2OK6WsIfPQGyvHil644Dup2ewrme.sHHy	SIN JAPAN 宮崎配車センター		agent-miyazaki@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
8b52aa33-ff87-448b-bac4-2946813865f2	agent_富山_1771429162620	$2b$10$Dllrd1Kvk0pzF455Sl52We/MWH2ZojiE.eu/oOLRSyfLsVlRYoATa	SIN JAPAN 富山配車センター		agent-toyama@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
7672141d-05c3-4354-8391-b1a591784314	agent_山口_1771429162708	$2b$10$NsG0Gs77kBTLksBxsp2Cr.enINo56KOup9nBq/0xnqevQi3KqK2O.	SIN JAPAN 山口配車センター		agent-yamaguchi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
1e1e96c1-0b8c-4591-b8af-f0624eb9260f	agent_山形_1771429162787	$2b$10$0SZAUfUB/6K.qXlFXUaWruX5vYS9BLTl.Cs4caa3TaROvioVEH.06	SIN JAPAN 山形配車センター		agent-yamagata@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
a41c254f-dc49-499f-ab56-2e10b4d97d07	agent_山梨_1771429162879	$2b$10$k2zVjhZKnyNrK9jZZHOS/OfASaphqHutJBiYolAibfSvorHHwDWuC	SIN JAPAN 山梨配車センター		agent-yamanashi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
f07f6e3b-bb9b-4e73-9e8f-4332789a42d1	agent_岐阜_1771429162964	$2b$10$NhORqNTJynZAJ/6X9g9Re.SZIYUG3ehhXD1bxpkSKfTjUTrAptTOW	SIN JAPAN 岐阜配車センター		agent-gifu@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
b08ad358-86b7-4a8f-b31c-46cd5df5bfd2	agent_岡山_1771429163036	$2b$10$7cyj3yNoiF.kI9vsS50dbesY.gCL.xsWcMUiXmTUROAkitJ9vF8Ki	SIN JAPAN 岡山配車センター		agent-okayama@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
b7beec3e-0544-4fcd-a2f3-d98429563aa6	agent_岩手_1771429163111	$2b$10$JMtUXm/kCagPhSo0SoMF4eHQpxqECuRZUgGCA6Z7BTvreoK6QV.Gm	SIN JAPAN 岩手配車センター		agent-iwate@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
b0b8837a-69ca-42bc-b420-00e8ca20e14f	agent_島根_1771429163183	$2b$10$.73jSc8q0U6TN8qZVWlidO4e43Avn3dHKv7sj01BmiflYyE/YGW92	SIN JAPAN 島根配車センター		agent-shimane@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
7df13401-3e72-44a9-b958-1caa43db68c5	agent_徳島_1771429163346	$2b$10$ctV15hdTst8mlkubLWq5AOOrTZBagK2CPQRubaA7tTW4kgNPU6Hye	SIN JAPAN 徳島配車センター		agent-tokushima@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
4e7c5d92-d814-4a00-946b-3b53bd9cb777	agent_愛媛_1771429163427	$2b$10$FCK4ncdIvgl7LO3ICpeCl.rsHh/ihF0laxAwH0gTf0.2ZQf8MVTPm	SIN JAPAN 愛媛配車センター		agent-ehime@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
30ef598a-0247-4940-84b5-1e9ddeeb10d5	agent_愛知_1771429163506	$2b$10$l1MT7frElR/umQCTTF6dsuVvFdnILtbFs6huD51PRA94NDFhtQcNq	SIN JAPAN 愛知配車センター		agent-aichi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
75afed5b-0af2-46f6-b5ef-c2f784ccae83	agent_新潟_1771429163586	$2b$10$CV9EwN3Cw0Pu4lKTLyBA9.HTQ.6C4Us5D/DZDjOecy0EPtH.JXOjS	SIN JAPAN 新潟配車センター		agent-niigata@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
fcc02b8f-2310-4654-b806-f3ab07457e19	agent_栃木_1771429163741	$2b$10$Jnus2Cv6CB8/fNZBbRJl2O8IqK/RuInq/htmTMNK/MW9eRiY4lQ7C	SIN JAPAN 栃木配車センター		agent-tochigi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
c600b749-b276-4708-90ca-be3e904d9639	agent_沖縄_1771429163818	$2b$10$y4rTw2j9SQNI8RGdfIkDuu4awnAyyyuobfmC6OxLon0CL2AtrgJBm	SIN JAPAN 沖縄配車センター		agent-okinawa@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
aeffd472-8dea-4518-bbf8-cd346d788435	agent_滋賀_1771429163900	$2b$10$i2dJqcbbPKNyCFsJ65E3mujXGIa.K8WxwTsu5fRTNpdR1cOS6Lk3S	SIN JAPAN 滋賀配車センター		agent-shiga@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
79b95cf1-b59c-4c88-ac39-004b09a80121	agent_熊本_1771429164021	$2b$10$ImCgAKo0PXhzvCLsJT3VZuRrCEkrVpzCQH5b3WSq8iJFokQTZza2m	SIN JAPAN 熊本配車センター		agent-kumamoto@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
a6220bb0-a46e-4a98-be66-e5b3cd44ac93	agent_石川_1771429164100	$2b$10$Z08SF/JZ10NCUy5Pj6cYUO7srghSak0UyKtKzATNXq9IM0HVAIUVG	SIN JAPAN 石川配車センター		agent-ishikawa@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
57c956f6-868c-4df0-8bdd-64a630f7ed2b	agent_神奈川_1771429164310	$2b$10$qAumVuI6/sEtPXlMPS.4OOXyv1Lf2hP56VbMYTvvaQ/eeM9K71H.a	SIN JAPAN 神奈川配車センター		agent-kanagawa@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
ee32adbc-700a-4986-b3f0-d24619d4eaad	agent_福井_1771429164384	$2b$10$aLH08aAQVDL6Avw9Bt52geyZ5jbxIUJoKdt/ycyclgTSB7ePCwtmm	SIN JAPAN 福井配車センター		agent-fukui@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
a1da15c8-5699-4553-8a81-3999fc9b7565	agent_福岡_1771429164462	$2b$10$ZQi3HhMX2KklwNJYi5HRf.ACDv6K7zZ/pK8BlBPrHvXJ5Au2bbSpS	SIN JAPAN 福岡配車センター		agent-fukuoka@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
53546504-54d7-46c6-8602-975bdf35bb85	agent_福島_1771429164535	$2b$10$BVrbU3u40niJ1rs43i.ITe1kP3.mq4NrXQ5OPFsbp2PSk5ASi0p5a	SIN JAPAN 福島配車センター		agent-fukushima@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
5716ab67-dced-48e5-b128-2d6e883dc83e	agent_秋田_1771429164615	$2b$10$2caEMPtlgic.QCFxk/uIV.Z6OX21KVyZGg7WXP1M98SXpU8JlDTv2	SIN JAPAN 秋田配車センター		agent-akita@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
fbc52150-0350-4fce-9ad3-29b0e1ff1f29	agent_群馬_1771429164695	$2b$10$AU4ULPgTVMV6relKHwDxx.Y80cM5Nw/lPCxODRLQajW7tLQys1Cb.	SIN JAPAN 群馬配車センター		agent-gunma@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
04e2660a-c43d-4376-8f6c-64f7636c666a	agent_東京_1771429163666	$2b$10$XnuVgBmklaJ7A/zKzW0EBujuQoBIUUmcG11ZH0rnPuAXIAQSuGF1q	SIN JAPAN 東京配車センター	03-1234-5678	agent-tokyo@tramatch.jp	carrier	user		山田太郎	\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
33dfb624-cd15-40ca-a751-60fd9db154a3	agent_茨城_1771429164772	$2b$10$12s3o5EbgOzRZQSeQIZbfesMqV0IRkvmriS.XA1mL0DIuLcm3oVp6	SIN JAPAN 茨城配車センター		agent-ibaraki@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
05b7b730-ddce-459d-b39c-6cf3a5f74e28	agent_長崎_1771429164848	$2b$10$1UHnN0vBnnJJlddcqQilLeW8QzO7KdlYxqZoptnr9fmw6Q9gkfw.6	SIN JAPAN 長崎配車センター		agent-nagasaki@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
01858591-b44a-401a-ad76-fceafd531179	agent_長野_1771429164921	$2b$10$OkJLi92ui1Szz5kuxdIGSuapMmd4i5yrEq4iSbKB1dlQUBjnxfFv6	SIN JAPAN 長野配車センター		agent-nagano@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
611e4a1d-fe13-4f8c-9f18-8842e7d1066c	agent_青森_1771429165020	$2b$10$XcJ1qhS1tlDWZeYBsO6De.Magy/TyVLENZe1UWlE210gejSndk1Wi	SIN JAPAN 青森配車センター		agent-aomori@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
97e05289-1639-4dd2-b2b8-d0c0de82b329	agent_静岡_1771429165104	$2b$10$ypD9Yv.6DCRtRynRI7HKROrazjXhtuYvcbAcyYI7ez3nidCtinnia	SIN JAPAN 静岡配車センター		agent-shizuoka@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
0320493f-754b-4c58-a46e-f8ec01c2b6ed	agent_香川_1771429165178	$2b$10$qPlb9KKYdZyAPrt3t7iGkeTmTJRc3.Qcaw9mG9SY8vG11wvNaVHAG	SIN JAPAN 香川配車センター		agent-kagawa@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
4208046b-4d32-490a-8949-9096592f6324	agent_高知_1771429165248	$2b$10$U9Qxn8h6AXNWeoyxi7sX0Of5tXRcYXhQDxEtVlui.3s2yt/FbSXgG	SIN JAPAN 高知配車センター		agent-kochi@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
72edd7f6-39d6-4066-a131-efd39e0b1bea	agent_鳥取_1771429165319	$2b$10$laLFm32pHdEHfkauoKgdN.VZwFQ85vgUl0.5ETfUp/utd2XrO6Znm	SIN JAPAN 鳥取配車センター		agent-tottori@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
03b3c350-a37c-48b2-9f58-e2a4ca3ef396	agent_鹿児島_1771429165400	$2b$10$YutUwd5cMJkbawjEomHEROjgfDr0e97hmaG5MfJhnktGOLer7H8RW	SIN JAPAN 鹿児島配車センター		agent-kagoshima@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
3834cf6e-94d0-4a3d-b94c-487d25b0759c	agent_北海道_1771429161926	$2b$10$11aF.LDT42k.J3au3.AfVe45qrzY390Av26eZlIasjhhFqaBUBagy	SIN JAPAN 北海道配車センター		agent-hokkaido@tramatch.jp	carrier	user			\N	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	premium	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	t	t	f	\N
\.


--
-- Name: cargo_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cargo_number_seq', 7891246, true);


--
-- Name: admin_settings admin_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_key_unique UNIQUE (key);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cargo_listings cargo_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cargo_listings
    ADD CONSTRAINT cargo_listings_pkey PRIMARY KEY (id);


--
-- Name: contact_inquiries contact_inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_inquiries
    ADD CONSTRAINT contact_inquiries_pkey PRIMARY KEY (id);


--
-- Name: dispatch_requests dispatch_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispatch_requests
    ADD CONSTRAINT dispatch_requests_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: plan_change_requests plan_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plan_change_requests
    ADD CONSTRAINT plan_change_requests_pkey PRIMARY KEY (id);


--
-- Name: seo_articles seo_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seo_articles
    ADD CONSTRAINT seo_articles_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: transport_records transport_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_records
    ADD CONSTRAINT transport_records_pkey PRIMARY KEY (id);


--
-- Name: truck_listings truck_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.truck_listings
    ADD CONSTRAINT truck_listings_pkey PRIMARY KEY (id);


--
-- Name: user_add_requests user_add_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_add_requests
    ADD CONSTRAINT user_add_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- PostgreSQL database dump complete
--

\unrestrict Znd8SGFggCHs60byz74T4YJjmIzJfcHk8LWCSNcov5gASesVARfdPNzzAYyoxYd

