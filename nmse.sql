--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

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
-- Name: add_newcar(text, text, text, integer, double precision, text, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_newcar(carname text, brand text, type text, year integer, price double precision, des text, qut integer, smid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
carID integer;
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
insert into car(car_name,brand,type,year,price,description,quantity) values(carname,brand,"type","year",price,des, qut) returning id into carID;
insert into car_import_invoice(sm_id) values (smid) returning importinvoice_id into invoiceID;
insert into car_import_report(importinvoice_id,car_id,quantity,date) values(invoiceID, carID,qut,current_date_var);
return 1;
END;
$$;


--
-- Name: add_newitem(text, text, double precision, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_newitem(apname text, supplier text, price double precision, qut integer, smid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
apID integer;
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
insert into auto_part("name",supplier,price,quantity) values(apname,supplier,price, qut) returning ap_id into apID;
insert into ap_import_invoice(sm_id) values (smid) returning importinvoice_id2 into invoiceID;
insert into ap_import_report(importinvoice_id,ap_id,date,quantity) values(invoiceID, apID,current_date_var,qut);
return 1;
END;
$$;


--
-- Name: add_oldcar(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_oldcar(carid integer, qut integer, smid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
update car 
set quantity = quantity + qut
where "id" = carID;
insert into car_import_invoice(sm_id) values (smid) returning importinvoice_id into invoiceID;
insert into car_import_report(importinvoice_id,car_id,quantity,date) values(invoiceID, carID,qut,current_date_var);
return 1;
END;
$$;


--
-- Name: add_olditem(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_olditem(apid integer, qut integer, smid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
update auto_part 
set quantity = quantity + qut
where "ap_id" = apID;
insert into ap_import_invoice(sm_id) values (smid) returning importinvoice_id2 into invoiceID;
insert into ap_import_report(importinvoice_id,ap_id,date,quantity) values(invoiceID, apID,current_date_var,qut);
return 1;
END;
$$;


--
-- Name: calculate_ap_import_total_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_ap_import_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update ap_import_invoice
  set total = (SELECT SUM(c.price*sd.quantity) FROM ap_import_report sd, auto_part c WHERE c.ap_id = sd.ap_id and sd.importinvoice_id=new.importinvoice_id)
  where importinvoice_id = new.importinvoice_id;
  RETURN new ;
END;
$$;


--
-- Name: calculate_car_import_total_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_car_import_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update car_import_invoice
  set total = (SELECT SUM(c.price*sd.quantity) FROM car_import_report sd, car c WHERE c.id = sd.car_id and sd.importinvoice_id=new.importinvoice_id)
  where importinvoice_id = new.importinvoice_id;
  RETURN new ;
END;
$$;


--
-- Name: calculate_sale_record_total_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_sale_record_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  update sale_record
  set total_price = (SELECT SUM(c.price*sd.quantity) FROM sale_detail sd, car c WHERE c.id = sd.car_id and sd.salerecord_id=new.salerecord_id)
  where salerecord_id = new.salerecord_id;
  RETURN new ;
END;
$$;


--
-- Name: check_car_quantity_on_import(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_car_quantity_on_import() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.QUANTITY <= 0 THEN
    RAISE EXCEPTION 'Số lượng xe phải lớn hơn 0';
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: delete_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_user() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.PERMISSION = 'sm' THEN
        DELETE FROM storage_manager WHERE ID = OLD.ID;
    ELSIF OLD.PERMISSION = 'cus' THEN
        DELETE FROM customer WHERE ID = OLD.ID;
	ELSIF OLD.PERMISSION = 'mec' THEN
        DELETE FROM mechanic WHERE ID = OLD.ID;
	ELSIF OLD.PERMISSION = 'sa' THEN
        DELETE FROM sales_assistant WHERE ID = OLD.ID;
    END IF;
    RETURN OLD;
END;
$$;


--
-- Name: purchase_car(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.purchase_car(carid integer, cusid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
sr_ID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
insert into sale_record(cus_id,date) values (cusID,current_date_var) returning salerecord_id into sr_ID ;
insert into sale_detail(salerecord_id,car_id) values (sr_ID,carID);
return 1;
END;
$$;


--
-- Name: purchase_cart(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.purchase_cart(carid integer, cusid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE 
sr_ID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
insert into sale_record(cus_id,date) values (cusID,current_date_var) returning salerecord_id into sr_ID ;
insert into sale_detail(salerecord_id,car_id) values (sr_ID,carID);
return 1;
END;
$$;


--
-- Name: role_distribute(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.role_distribute() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.PERMISSION = 'sm' THEN
        INSERT INTO storage_manager (ID)
        VALUES (NEW.ID);
    ELSIF NEW.PERMISSION = 'cus' THEN
        INSERT INTO customer (ID)
       VALUES (NEW.ID);
	ELSIF NEW.PERMISSION = 'sa' THEN
        INSERT INTO sales_assistant (ID)
       VALUES (NEW.ID);
	ELSIF NEW.PERMISSION = 'mec' THEN
        INSERT INTO mechanic (ID)
        VALUES (NEW.ID);
	END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_ap_quantity_on_fix(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_ap_quantity_on_fix() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE auto_part
  SET quantity = quantity - 1
  WHERE ap_id = (SELECT ap_id FROM fix_detail WHERE fixdetail_id = NEW.fixdetail_id);
  
  RETURN NEW;
END;
$$;


--
-- Name: update_car_quantity_on_import(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_car_quantity_on_import() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  --INSERT INTO car_import_invoice (id)
  --UPDATE car_import_report
  --SET quantity = quantity + NEW.quantity;
  
  RETURN new;
END;
$$;


--
-- Name: update_car_quantity_on_sale(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_car_quantity_on_sale() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE car
  SET quantity = quantity - 1
  WHERE id = new.car_id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_fix_record_total_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_fix_record_total_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE fix_record
  SET total_price = (SELECT SUM(price) FROM fix_detail WHERE fixrecord_id = NEW.fixrecord_id)
  WHERE fixrecord_id = NEW.fixrecord_id;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ap_import_invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ap_import_invoice (
    importinvoice_id integer NOT NULL,
    sm_id integer NOT NULL,
    total double precision DEFAULT 0
);


--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ap_import_invoice_importinvoice_id2_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ap_import_invoice_importinvoice_id2_seq OWNED BY public.ap_import_invoice.importinvoice_id;


--
-- Name: ap_import_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ap_import_report (
    importinvoice_id integer NOT NULL,
    ap_id integer NOT NULL,
    date date,
    quantity integer
);


--
-- Name: auto_part; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auto_part (
    name text,
    supplier text,
    price double precision,
    ap_id integer NOT NULL,
    quantity integer
);


--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auto_part_ap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auto_part_ap_id_seq OWNED BY public.auto_part.ap_id;


--
-- Name: car; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car (
    car_name text,
    brand text,
    type text,
    year integer,
    price double precision,
    description text,
    quantity integer,
    id integer NOT NULL
);


--
-- Name: car_car_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_car_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_car_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_car_id_seq OWNED BY public.car.id;


--
-- Name: car_import_invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_import_invoice (
    importinvoice_id integer NOT NULL,
    sm_id integer NOT NULL,
    total double precision
);


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.car_import_invoice_importinvoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.car_import_invoice_importinvoice_id_seq OWNED BY public.car_import_invoice.importinvoice_id;


--
-- Name: car_import_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_import_report (
    importinvoice_id integer NOT NULL,
    car_id integer NOT NULL,
    quantity integer,
    date date
);


--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    "customer_ID" integer NOT NULL,
    "car_ID" integer NOT NULL,
    quantity integer
);


--
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer (
    id integer NOT NULL
);


--
-- Name: federated_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.federated_credentials (
    id integer NOT NULL,
    user_id integer,
    provider text,
    subject text
);


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.federated_credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.federated_credentials_id_seq OWNED BY public.federated_credentials.id;


--
-- Name: fix_detail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fix_detail (
    date date,
    detail text,
    price double precision,
    fixdetail_id integer NOT NULL,
    fixrecord_id integer NOT NULL,
    ap_id integer,
    mec_id integer NOT NULL,
    "Status" text,
    quantity integer DEFAULT 1 NOT NULL
);


--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fix_detail_fixdetail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fix_detail_fixdetail_id_seq OWNED BY public.fix_detail.fixdetail_id;


--
-- Name: fix_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fix_record (
    fixrecord_id integer NOT NULL,
    car_plate text NOT NULL,
    date date,
    total_price double precision,
    status text,
    pay boolean DEFAULT false
);


--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fix_record_fixrecord_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fix_record_fixrecord_id_seq OWNED BY public.fix_record.fixrecord_id;


--
-- Name: fixed_car; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fixed_car (
    car_plate text NOT NULL,
    id integer NOT NULL
);


--
-- Name: mechanic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mechanic (
    id integer NOT NULL
);


--
-- Name: sale_detail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_detail (
    salerecord_id integer NOT NULL,
    car_id integer NOT NULL,
    quantity integer DEFAULT 1
);


--
-- Name: sale_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sale_record (
    salerecord_id integer NOT NULL,
    cus_id integer NOT NULL,
    date date,
    total_price double precision DEFAULT 0
);


--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sale_record_salerecord_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sale_record_salerecord_id_seq OWNED BY public.sale_record.salerecord_id;


--
-- Name: sales_assistant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_assistant (
    id integer NOT NULL
);


--
-- Name: storage_manager; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.storage_manager (
    id integer NOT NULL
);


--
-- Name: user_info; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_info (
    username text,
    password text,
    permission text,
    id integer NOT NULL,
    firstname text,
    phonenumber text,
    dob date,
    address text,
    lastname text
);


--
-- Name: user_info_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_info_id_seq OWNED BY public.user_info.id;


--
-- Name: ap_import_invoice importinvoice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_invoice ALTER COLUMN importinvoice_id SET DEFAULT nextval('public.ap_import_invoice_importinvoice_id2_seq'::regclass);


--
-- Name: auto_part ap_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_part ALTER COLUMN ap_id SET DEFAULT nextval('public.auto_part_ap_id_seq'::regclass);


--
-- Name: car id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car ALTER COLUMN id SET DEFAULT nextval('public.car_car_id_seq'::regclass);


--
-- Name: car_import_invoice importinvoice_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_invoice ALTER COLUMN importinvoice_id SET DEFAULT nextval('public.car_import_invoice_importinvoice_id_seq'::regclass);


--
-- Name: federated_credentials id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federated_credentials ALTER COLUMN id SET DEFAULT nextval('public.federated_credentials_id_seq'::regclass);


--
-- Name: fix_detail fixdetail_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_detail ALTER COLUMN fixdetail_id SET DEFAULT nextval('public.fix_detail_fixdetail_id_seq'::regclass);


--
-- Name: fix_record fixrecord_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_record ALTER COLUMN fixrecord_id SET DEFAULT nextval('public.fix_record_fixrecord_id_seq'::regclass);


--
-- Name: sale_record salerecord_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_record ALTER COLUMN salerecord_id SET DEFAULT nextval('public.sale_record_salerecord_id_seq'::regclass);


--
-- Name: user_info id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_info ALTER COLUMN id SET DEFAULT nextval('public.user_info_id_seq'::regclass);


--
-- Data for Name: ap_import_invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ap_import_invoice (importinvoice_id, sm_id, total) FROM stdin;
201	4	0
202	51	0
203	66	0
204	40	0
205	3	0
206	45	0
207	68	0
208	40	0
209	71	0
210	45	0
211	88	0
212	88	0
213	71	0
214	66	0
215	77	0
216	81	0
217	40	0
218	88	0
219	73	0
220	32	0
221	5	0
222	3	0
223	31	0
224	49	0
225	73	0
226	9	0
227	51	0
228	56	0
229	56	0
230	56	0
231	5	0
232	9	0
233	71	0
234	68	0
235	73	0
236	81	0
237	31	0
238	49	0
239	81	0
240	73	0
241	60	0
242	38	0
243	22	0
244	51	0
245	9	0
246	67	0
247	56	0
248	19	0
249	3	0
250	60	0
251	67	0
252	63	0
253	66	0
254	19	0
255	22	0
256	5	0
257	77	0
258	49	0
259	22	0
260	22	0
261	71	0
262	38	0
263	31	0
264	88	0
265	67	0
266	49	0
267	13	0
268	19	0
269	9	0
270	32	0
271	77	0
272	45	0
273	67	0
274	13	0
275	4	0
276	4	0
277	63	0
278	5	0
279	77	0
280	66	0
281	3	0
282	13	0
283	32	0
284	19	0
285	38	0
286	45	0
287	51	0
288	38	0
289	63	0
290	60	0
291	4	0
292	32	0
293	81	0
294	13	0
295	63	0
296	40	0
297	68	0
298	60	0
299	68	0
300	31	0
301	88	0
302	67	0
303	66	0
304	51	0
305	49	0
306	13	0
307	71	0
308	56	0
309	9	0
310	66	0
311	4	0
312	66	0
313	77	0
314	73	0
315	68	0
316	60	0
317	77	0
318	40	0
319	81	0
320	88	0
321	88	0
322	3	0
323	88	0
324	22	0
325	32	0
326	9	0
327	38	0
328	4	0
329	71	0
330	4	0
331	32	0
332	51	0
333	31	0
334	5	0
335	56	0
336	31	0
337	66	0
338	31	0
339	5	0
340	51	0
341	19	0
342	31	0
343	3	0
344	63	0
345	68	0
346	19	0
347	38	0
348	19	0
349	63	0
350	51	0
351	67	0
352	3	0
353	67	0
354	22	0
355	67	0
356	13	0
357	45	0
358	40	0
359	45	0
360	22	0
361	38	0
362	22	0
363	40	0
364	77	0
365	56	0
366	19	0
367	38	0
368	3	0
369	60	0
370	73	0
371	73	0
372	49	0
373	45	0
374	68	0
375	60	0
376	5	0
377	9	0
378	49	0
379	5	0
380	45	0
381	13	0
382	77	0
383	32	0
384	9	0
385	73	0
386	13	0
387	63	0
388	4	0
389	71	0
390	81	0
391	32	0
392	60	0
393	56	0
394	71	0
395	40	0
396	68	0
397	63	0
398	81	0
399	81	0
400	49	0
\.


--
-- Data for Name: ap_import_report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ap_import_report (importinvoice_id, ap_id, date, quantity) FROM stdin;
206	19	2023-12-17	6
291	16	2024-01-13	4
238	14	2024-01-21	7
255	20	2024-01-13	7
240	15	2023-12-23	0
211	21	2023-12-31	6
300	18	2023-12-30	8
251	13	2023-12-04	4
297	17	2023-12-23	5
247	16	2024-01-06	8
281	14	2023-12-19	10
299	20	2024-01-01	0
201	15	2023-12-14	3
236	21	2024-01-08	2
205	18	2024-01-22	4
218	13	2023-11-30	4
264	17	2023-12-17	9
241	19	2024-01-14	5
257	14	2024-01-01	0
228	20	2023-12-02	6
208	15	2023-12-22	6
217	21	2023-12-18	2
233	18	2023-12-05	2
242	13	2023-12-05	8
219	17	2023-12-19	5
244	19	2024-01-09	8
224	16	2023-12-21	8
270	20	2023-12-09	10
204	15	2023-12-08	4
254	21	2023-12-01	7
293	18	2023-12-29	7
213	13	2024-01-11	3
280	17	2023-11-30	7
256	19	2023-12-07	7
222	16	2024-01-20	3
288	14	2023-12-17	6
243	15	2023-12-29	2
277	21	2024-01-08	4
261	18	2023-12-27	1
246	13	2023-12-22	1
226	17	2023-11-25	2
237	19	2024-01-18	3
234	16	2023-12-26	8
298	14	2023-12-13	2
283	20	2024-01-15	1
230	21	2023-11-29	8
287	18	2023-12-11	4
203	13	2024-01-09	3
212	17	2023-12-12	10
285	19	2024-01-13	8
227	16	2024-01-20	10
232	14	2023-12-30	5
258	20	2023-12-25	8
294	15	2023-12-25	5
260	18	2023-12-30	7
252	13	2023-12-26	2
292	17	2024-01-02	3
225	19	2023-12-23	10
268	16	2023-12-14	7
269	14	2023-12-02	2
202	20	2024-01-23	2
253	15	2023-12-15	10
279	21	2024-01-14	10
267	13	2023-12-15	8
250	17	2023-11-25	4
229	19	2024-01-20	2
235	16	2023-12-26	8
276	14	2023-11-29	10
282	20	2023-12-24	2
286	15	2023-11-28	9
249	21	2024-01-19	9
295	18	2023-12-20	0
284	17	2024-01-02	5
265	19	2024-01-08	4
223	16	2023-12-09	7
289	14	2023-12-04	2
239	20	2023-12-01	5
290	15	2023-12-09	4
220	21	2023-12-09	3
278	18	2024-01-09	3
210	13	2024-01-22	3
296	19	2023-12-20	1
274	16	2023-12-20	0
221	14	2023-12-02	3
214	20	2024-01-01	9
266	15	2023-12-22	3
231	21	2024-01-13	9
263	18	2023-12-27	10
271	13	2024-01-10	5
207	17	2023-12-02	7
245	16	2023-12-26	0
273	14	2024-01-06	9
262	20	2024-01-15	10
275	15	2024-01-18	9
209	21	2023-12-27	1
272	18	2024-01-20	9
215	13	2023-11-30	6
248	17	2024-01-13	7
216	19	2023-11-29	10
259	14	2024-01-07	9
\.


--
-- Data for Name: auto_part; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auto_part (name, supplier, price, ap_id, quantity) FROM stdin;
Spark Plugs	XYZ Motors	6	14	6
Air Filter	AutoTech Supplies	13	15	8
Fuel Pump	CarCare Depot	60	17	4
Brake Pads	ABC Auto Parts	50	13	5
Radiator	PartsRUs	80	16	1
Timing Belt	Speedy Auto	26	18	6
Oil Filter	Superior Parts	9	19	10
Shock Absorbers	Global Automotive	35	20	12
Battery	PowerDrive Inc.	100	21	20
\.


--
-- Data for Name: car; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.car (car_name, brand, type, year, price, description, quantity, id) FROM stdin;
Tesla Model 3	Tesla	Electric	2022	45000	An electric sedan with cutting-edge technology and impressive performance.	3	5
Volkswagen Golf	Volkswagen	Hatchback	2023	23000	A versatile hatchback with a comfortable ride and European styling.	3	6
Jeep Wrangler	Jeep	Off-Road	2022	35000	An iconic off-road vehicle with a removable top and rugged design.	6	7
Nissan Altima	Nissan	Sedan	2023	27000	A midsize sedan with a smooth ride and a spacious comfortable interior.	6	8
BMW X5	BMW	Luxury SUV	2022	60000	A luxury SUV with a premium interior advanced tech features  and strong performance.	6	9
Hyundai Tucson	Hyundai	Crossover	2022	25000	A compact crossover with a stylish design and a range of safety features.	2	11
Mercedes-Benz E-Class	Mercedes-Benz	Luxury Sedan	2023	65000	A luxurious sedan with a refined interior and advanced driver-assistance systems.	7	12
Chevrolet Corvette	Chevrolet	Sports Car	2022	60000	A high-performance sports car with a sleek design and impressive speed.	5	13
Toyota Camry	Toyota	Sedan	2022	25000	A popular midsize sedan known for reliability and fuel efficiency.	0	1
Chevrolet Silverado	Chevrolet	Truck	2023	35000	A rugged pickup truck known for its towing capacity and durability.	8	4
Honda CR-V	Honda	SUV	2022	30000	A compact SUV that offers a spacious interior and advanced safety features.	1	3
Ford Mustang	Ford	Sports Car	2023	45000	A classic American muscle car with a powerful engine and iconic design.	-1	2
\.


--
-- Data for Name: car_import_invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.car_import_invoice (importinvoice_id, sm_id, total) FROM stdin;
201	32	\N
202	56	\N
203	3	\N
204	5	\N
205	81	\N
206	49	\N
207	19	\N
208	77	\N
209	31	\N
210	40	\N
211	71	\N
212	19	\N
213	13	\N
214	49	\N
215	38	\N
216	73	\N
217	67	\N
218	13	\N
219	31	\N
220	51	\N
221	4	\N
222	60	\N
223	19	\N
224	63	\N
225	60	\N
226	45	\N
227	5	\N
228	66	\N
229	45	\N
230	66	\N
231	38	\N
232	68	\N
233	71	\N
234	45	\N
235	68	\N
236	67	\N
237	68	\N
238	5	\N
239	19	\N
240	38	\N
241	31	\N
242	3	\N
243	9	\N
244	56	\N
245	3	\N
246	49	\N
247	9	\N
248	63	\N
249	9	\N
250	88	\N
251	88	\N
252	22	\N
253	38	\N
254	22	\N
255	73	\N
256	77	\N
257	40	\N
258	67	\N
259	5	\N
260	13	\N
261	88	\N
262	73	\N
263	71	\N
264	71	\N
265	51	\N
266	63	\N
267	81	\N
268	77	\N
269	56	\N
270	49	\N
271	31	\N
272	4	\N
273	40	\N
274	63	\N
275	66	\N
276	4	\N
277	3	\N
278	73	\N
279	56	\N
280	4	\N
281	51	\N
282	81	\N
283	45	\N
284	22	\N
285	77	\N
286	32	\N
287	60	\N
288	40	\N
289	32	\N
290	81	\N
291	51	\N
292	13	\N
293	88	\N
294	22	\N
295	32	\N
296	60	\N
297	68	\N
298	67	\N
299	66	\N
300	9	\N
301	67	\N
302	73	\N
303	5	\N
304	38	\N
305	45	\N
306	4	\N
307	38	\N
308	40	\N
309	51	\N
310	88	\N
311	88	\N
312	22	\N
313	3	\N
314	63	\N
315	60	\N
316	49	\N
317	73	\N
318	51	\N
319	66	\N
320	13	\N
321	63	\N
322	60	\N
323	49	\N
324	88	\N
325	38	\N
326	45	\N
327	63	\N
328	9	\N
329	67	\N
330	9	\N
331	40	\N
332	77	\N
333	5	\N
334	51	\N
335	4	\N
336	73	\N
337	88	\N
338	5	\N
339	68	\N
340	13	\N
341	3	\N
342	40	\N
343	31	\N
344	60	\N
345	68	\N
346	73	\N
347	40	\N
348	3	\N
349	81	\N
350	66	\N
351	32	\N
352	32	\N
353	4	\N
354	22	\N
355	77	\N
356	31	\N
357	71	\N
358	56	\N
359	51	\N
360	81	\N
361	3	\N
362	5	\N
363	9	\N
364	66	\N
365	56	\N
366	49	\N
367	22	\N
368	49	\N
369	19	\N
370	38	\N
371	81	\N
372	63	\N
373	56	\N
374	45	\N
375	56	\N
376	22	\N
377	9	\N
378	13	\N
379	31	\N
380	4	\N
381	32	\N
382	32	\N
383	71	\N
384	77	\N
385	66	\N
386	81	\N
387	31	\N
388	19	\N
389	60	\N
390	19	\N
391	13	\N
392	68	\N
393	67	\N
394	67	\N
395	71	\N
396	77	\N
397	45	\N
398	19	\N
399	71	\N
400	68	\N
401	9	\N
\.


--
-- Data for Name: car_import_report; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.car_import_report (importinvoice_id, car_id, quantity, date) FROM stdin;
294	11	5	2023-11-25
251	13	8	2024-01-21
228	3	4	2024-01-09
256	12	5	2023-12-30
215	6	6	2023-12-15
216	9	10	2024-01-23
297	5	10	2024-01-21
255	4	2	2023-12-02
271	2	0	2024-01-17
257	8	7	2023-12-30
236	7	7	2023-12-24
250	1	4	2023-12-04
238	13	3	2024-01-19
264	3	6	2023-12-29
219	12	9	2024-01-16
223	6	6	2024-01-04
210	9	1	2023-12-29
299	5	10	2023-12-26
285	4	10	2024-01-15
202	2	10	2023-12-02
244	8	6	2024-01-07
247	7	7	2023-12-31
272	1	5	2024-01-01
268	11	7	2023-12-20
279	3	3	2023-11-28
287	12	8	2023-12-29
248	6	8	2023-11-29
220	9	8	2023-11-25
204	5	2	2023-12-26
222	4	8	2023-11-27
300	2	7	2023-12-21
284	8	6	2023-12-26
226	7	5	2023-12-02
213	1	8	2023-12-06
288	11	2	2024-01-04
269	13	9	2024-01-23
207	12	3	2024-01-08
230	6	1	2023-12-06
237	9	5	2023-12-01
265	5	8	2023-12-22
278	4	4	2023-12-28
261	2	7	2023-12-01
211	8	0	2023-12-07
293	7	7	2023-12-15
274	1	9	2023-12-19
252	11	4	2023-12-19
217	13	9	2024-01-01
225	3	7	2023-12-14
239	6	9	2024-01-04
246	9	4	2024-01-04
298	5	0	2024-01-20
201	4	4	2023-12-01
212	2	4	2023-11-25
281	8	5	2024-01-04
241	7	10	2023-12-29
295	1	6	2023-12-29
245	11	4	2024-01-06
242	13	1	2024-01-18
263	3	10	2024-01-09
203	12	1	2023-12-10
214	9	8	2024-01-05
240	5	0	2024-01-11
235	4	1	2024-01-12
258	2	3	2024-01-18
291	8	2	2023-12-21
234	7	9	2023-12-31
286	1	9	2024-01-19
280	11	6	2024-01-20
262	13	7	2023-11-29
221	3	5	2024-01-02
267	12	1	2023-11-29
249	6	6	2023-12-28
254	5	6	2024-01-06
253	4	0	2023-11-30
224	2	10	2023-11-30
270	8	0	2023-12-10
229	7	1	2024-01-04
227	1	7	2024-01-23
290	11	1	2024-01-07
282	13	9	2024-01-16
266	3	4	2023-12-08
259	12	1	2024-01-08
292	6	0	2023-12-13
243	9	9	2023-12-08
296	4	6	2024-01-13
206	2	4	2023-12-17
277	8	10	2023-12-24
231	7	1	2023-12-08
283	1	9	2023-12-02
218	11	1	2023-12-26
289	13	7	2024-01-23
205	3	7	2023-11-25
275	12	7	2023-12-08
232	6	2	2024-01-01
276	9	9	2023-12-16
260	5	0	2023-12-07
208	2	4	2024-01-19
209	8	3	2023-11-30
273	7	7	2023-12-05
233	1	9	2024-01-03
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart ("customer_ID", "car_ID", quantity) FROM stdin;
93	6	8
7	11	9
62	5	9
99	9	0
83	3	2
87	11	1
87	3	10
47	2	10
42	4	2
93	7	5
48	13	10
99	5	9
95	7	6
36	4	8
47	13	9
24	8	5
24	13	7
2	5	1
2	9	0
16	11	10
36	13	0
93	11	5
8	3	4
46	2	1
86	8	0
7	4	5
79	12	5
61	4	6
86	3	0
94	5	5
7	7	4
95	8	2
8	6	10
7	8	3
48	4	3
94	11	2
1	1	1
48	3	1
16	7	1
2	7	5
37	2	6
93	13	7
91	8	1
61	12	8
83	6	7
14	2	7
83	2	9
42	2	6
98	12	5
47	11	2
8	4	4
61	6	3
37	9	6
42	1	6
47	7	10
94	9	0
8	5	9
98	2	8
99	1	4
91	9	8
98	13	6
62	6	10
83	9	5
14	1	10
95	2	8
86	5	6
95	13	1
46	5	10
46	1	4
98	6	7
62	7	1
37	3	3
42	8	8
24	12	1
79	6	0
2	3	1
87	13	2
14	4	7
62	1	0
46	7	6
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer (id) FROM stdin;
1
2
7
8
14
16
24
36
37
42
46
47
48
61
62
79
83
86
87
91
93
94
95
98
99
\.


--
-- Data for Name: federated_credentials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.federated_credentials (id, user_id, provider, subject) FROM stdin;
\.


--
-- Data for Name: fix_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fix_detail (date, detail, price, fixdetail_id, fixrecord_id, ap_id, mec_id, "Status", quantity) FROM stdin;
2023-01-05	Replaced brake pads	200	1	7	13	434	\N	1
2023-02-20	Engine diagnostic	150.5	2	8	\N	435	\N	1
2023-03-25	Oil filter change	80.25	3	9	19	436	\N	1
2023-12-09	Fix	2772.34	301	172	20	10	Fixed	1
2023-11-26	Fix	6798.97	302	201	19	34	Fixed	1
2023-12-04	Replace	4659.1	303	185	17	72	In progress	1
2023-12-19	Fix	8736.58	304	116	21	26	In progress	1
2024-01-13	Replace	6650.83	305	143	13	53	Fixed	1
2023-12-17	Replace	8634.06	306	133	14	80	Fixed	1
2023-12-25	Replace	5483.09	307	114	15	57	Fixed	1
2023-12-07	Fix	8132.05	308	129	21	20	Fixed	1
2023-12-05	Fix	3830.93	309	161	13	97	In progress	1
2024-01-09	Replace	9047.16	310	204	18	85	Fixed	1
2024-01-20	Fix	449.94	311	124	19	28	Fixed	1
2023-12-08	Fix	7220.95	312	165	17	20	In progress	1
2023-12-12	Replace	1941.34	313	118	16	84	In progress	1
2023-12-14	Replace	4512.57	314	10	21	74	In progress	1
2024-01-18	Replace	5357.01	315	126	14	57	In progress	1
2024-01-21	Replace	4860.6	316	109	21	25	Fixed	1
2023-12-30	Replace	6629.75	317	145	21	59	Fixed	1
2024-01-19	Fix	2814.71	318	112	15	75	In progress	1
2023-12-30	Replace	5865.36	319	123	20	96	In progress	1
2023-12-18	Replace	2307.33	320	174	15	59	Fixed	1
2023-12-19	Fix	1603.39	321	138	18	74	In progress	1
2024-01-06	Replace	3697.61	322	130	16	34	Fixed	1
2024-01-20	Fix	7198.71	323	111	16	72	Fixed	1
2023-12-10	Replace	2427.91	324	135	19	75	Fixed	1
2023-12-14	Fix	4589.56	325	11	14	20	In progress	1
2023-12-12	Replace	5546.31	326	104	17	58	Fixed	1
2023-11-26	Replace	1394.21	327	159	19	41	Fixed	1
2024-01-05	Fix	4475.68	328	105	21	96	In progress	1
2024-01-16	Replace	461.36	329	186	19	23	In progress	1
2023-12-24	Fix	2043.61	330	147	14	18	Fixed	1
2023-12-14	Replace	3707.58	331	177	21	72	In progress	1
2023-12-21	Replace	8213.94	332	136	21	80	Fixed	1
2024-01-22	Fix	3436.88	333	131	13	34	In progress	1
2024-01-05	Fix	7259.78	334	106	18	85	In progress	1
2023-11-30	Fix	4233.77	335	181	20	20	In progress	1
2024-01-14	Fix	41	336	113	13	96	In progress	1
2024-01-09	Replace	3093.47	337	128	15	33	Fixed	1
2023-12-31	Fix	4527.52	338	173	14	41	In progress	1
2024-01-16	Fix	2947.35	339	202	13	80	Fixed	1
2023-11-27	Replace	7090.1	340	182	14	58	Fixed	1
2023-12-04	Fix	9663.22	341	178	17	10	Fixed	1
2024-01-12	Replace	8852.33	342	119	20	25	Fixed	1
2024-01-16	Fix	3784.68	343	189	16	75	Fixed	1
2023-12-03	Replace	7161.57	344	149	16	78	Fixed	1
2024-01-09	Replace	9259.68	345	144	18	59	Fixed	1
2024-01-01	Fix	6800.32	346	148	15	33	In progress	1
2024-01-03	Fix	9556.97	347	162	16	23	Fixed	1
2023-12-27	Fix	1795.84	348	153	21	6	In progress	1
2024-01-03	Replace	9631.92	349	176	19	57	Fixed	1
2024-01-09	Fix	6180.91	350	164	20	97	Fixed	1
2024-01-07	Fix	3968.1	351	156	15	10	Fixed	1
2023-12-06	Fix	2235.97	352	101	20	58	In progress	1
2023-12-14	Fix	3028.78	353	158	18	84	In progress	1
2023-12-19	Replace	5824.37	354	205	19	41	In progress	1
2023-12-06	Replace	1778.19	355	168	15	10	In progress	1
2023-11-28	Replace	7759.97	356	160	16	59	Fixed	1
2024-01-01	Fix	6243.11	357	9	17	53	In progress	1
2024-01-16	Replace	5170.26	358	170	19	34	Fixed	1
2023-12-30	Fix	4652.54	359	184	21	85	Fixed	1
2023-12-26	Fix	2682.86	360	107	20	78	Fixed	1
2024-01-14	Replace	1387.8	361	110	18	33	In progress	1
2024-01-16	Fix	2463.27	362	171	16	58	Fixed	1
2024-01-02	Fix	1433.95	363	139	16	25	In progress	1
2023-11-26	Replace	2431.63	364	150	14	85	Fixed	1
2024-01-10	Fix	9698.06	365	167	17	18	In progress	1
2023-12-14	Replace	4646.91	366	132	17	35	In progress	1
2023-12-04	Replace	226.9	367	179	17	57	In progress	1
2023-12-18	Fix	3096.11	368	142	13	26	Fixed	1
2024-01-17	Replace	5757.29	369	169	13	6	In progress	1
2024-01-03	Fix	5822.27	370	108	15	28	In progress	1
2024-01-21	Fix	1328.73	371	137	18	53	In progress	1
2024-01-14	Replace	2435.38	372	187	13	35	In progress	1
2023-12-29	Replace	6959.88	373	103	19	75	Fixed	1
2024-01-12	Replace	6943.98	374	183	20	74	In progress	1
2024-01-21	Replace	1919.84	375	151	14	23	In progress	1
2023-12-15	Replace	4206.14	376	115	15	35	In progress	1
2023-12-17	Replace	1314.91	377	166	18	26	Fixed	1
2024-01-07	Replace	9743.43	378	157	18	97	Fixed	1
2023-12-03	Fix	1442.34	379	121	19	23	Fixed	1
2024-01-03	Replace	4376.81	380	206	20	28	Fixed	1
2023-12-18	Fix	3442.31	381	127	17	6	In progress	1
2023-12-14	Fix	7727.38	382	175	13	41	Fixed	1
2024-01-06	Fix	5471.29	383	8	13	28	In progress	1
2024-01-21	Replace	1956.55	384	180	13	78	Fixed	1
2024-01-05	Fix	7212.52	385	188	16	80	In progress	1
2023-12-06	Replace	233.89	386	155	17	6	In progress	1
2023-12-15	Replace	3091.83	387	102	15	18	Fixed	1
2024-01-20	Fix	3805.72	388	120	16	35	In progress	1
2024-01-08	Replace	1494.64	389	140	19	84	In progress	1
2024-01-07	Fix	1848.01	390	152	17	97	In progress	1
2023-12-17	Fix	1898.53	391	203	18	72	In progress	1
2023-12-27	Replace	4084.7	392	117	15	53	In progress	1
2024-01-23	Fix	8824.52	393	125	14	78	Fixed	1
2024-01-16	Fix	6711.45	394	146	21	18	Fixed	1
2023-12-03	Fix	4552.57	395	122	20	84	Fixed	1
2023-12-09	Fix	6515.24	396	154	18	33	In progress	1
2023-12-21	Replace	2318.98	397	141	14	25	Fixed	1
2023-12-24	Replace	4665.52	398	7	13	26	Fixed	1
2023-12-18	Fix	9897.09	399	163	20	96	In progress	1
2024-01-14	Replace	1071.2	400	134	14	74	In progress	1
\N	\N	\N	7	7	14	6	\N	1
\N	\N	\N	8	7	15	6	\N	1
\N	\N	\N	9	9	17	6	\N	1
\.


--
-- Data for Name: fix_record; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fix_record (fixrecord_id, car_plate, date, total_price, status, pay) FROM stdin;
9	18D3-23565	2023-01-11	6323.36	\N	f
190	68A1-87898	2023-12-19	3583.37	\N	f
191	63A1-88888	2023-12-28	1024.09	\N	f
192	68C1-87888	2023-12-14	3703.5	\N	f
193	63A1-88888	2024-01-14	6292.48	\N	f
194	63A1-88888	2024-01-19	8576.33	\N	f
195	73A7-22356	2024-01-04	2529.44	\N	f
196	18D3-23565	2024-01-23	1326.84	\N	f
197	63A1-88888	2023-12-21	5181.18	\N	f
198	73A7-22356	2024-01-01	5588.28	\N	f
199	68A1-87898	2024-01-20	272.21	\N	f
200	68C1-87888	2023-12-18	8002.76	\N	f
207	68A1-87898	2023-12-23	4781.95	\N	f
208	68C1-87888	2024-01-19	9503.58	\N	f
209	63A1-88888	2024-01-17	2905.4	\N	f
210	73A7-22356	2023-12-12	341.37	\N	f
211	68A1-87898	2024-01-19	8787.85	\N	f
212	68A1-87898	2023-12-07	4981.85	\N	f
213	68A1-87898	2023-12-17	8957.48	\N	f
214	68C1-87888	2023-12-04	1106.99	\N	f
215	68A1-87898	2024-01-22	7726.94	\N	f
216	68C1-87888	2023-12-19	6414.72	\N	f
217	73A7-22356	2024-01-21	7620.12	\N	f
218	73A7-22356	2024-01-15	4759.16	\N	f
219	63A1-88888	2024-01-23	6651.32	\N	f
220	63A1-88888	2024-01-03	2200.18	\N	f
221	68A1-87898	2023-12-16	5714.58	\N	f
222	73A7-22356	2023-11-25	8153.23	\N	f
223	73A7-22356	2023-12-06	8777.66	\N	f
224	68C1-87888	2024-01-12	9221.68	\N	f
225	68A1-87898	2024-01-14	1768.17	\N	f
226	68A1-87898	2023-12-17	4131.39	\N	f
227	68C1-87888	2023-12-04	2747.33	\N	f
228	68C1-87888	2023-12-27	7135.94	\N	f
229	68C1-87888	2023-12-28	1241.36	\N	f
230	18D3-23565	2023-11-25	1717.94	\N	f
231	18D3-23565	2024-01-08	7197.27	\N	f
232	73A7-22356	2023-12-14	2742.67	\N	f
233	63A1-88888	2024-01-06	2264.45	\N	f
234	18D3-23565	2023-12-19	6035.96	\N	f
235	68C1-87888	2023-11-28	3571.06	\N	f
236	68A1-87898	2024-01-03	3713.13	\N	f
237	73A7-22356	2023-12-08	8624.73	\N	f
238	18D3-23565	2024-01-08	5147.28	\N	f
239	18D3-23565	2023-12-18	773.05	\N	f
240	63A1-88888	2023-12-08	3840.29	\N	f
241	63A1-88888	2023-12-06	6629.88	\N	f
242	18D3-23565	2023-12-26	773.23	\N	f
243	63A1-88888	2023-12-04	1733.09	\N	f
244	68A1-87898	2023-11-25	8192.41	\N	f
245	73A7-22356	2024-01-09	3132.6	\N	f
246	18D3-23565	2023-12-24	9726.6	\N	f
247	73A7-22356	2023-12-02	973.76	\N	f
248	73A7-22356	2024-01-20	7008.11	\N	f
249	68C1-87888	2023-12-23	7561.7	\N	f
250	68C1-87888	2023-12-19	9598.26	\N	f
251	18D3-23565	2023-12-24	8919.29	\N	f
252	63A1-88888	2023-11-26	9523.52	\N	f
253	63A1-88888	2023-12-21	5636.3	\N	f
254	73A7-22356	2023-11-25	7221.07	\N	f
255	68A1-87898	2024-01-09	3952.35	\N	f
256	18D3-23565	2023-12-11	2363.1	\N	f
257	18D3-23565	2023-12-09	414.36	\N	f
258	63A1-88888	2023-12-30	4096.95	\N	f
259	68C1-87888	2023-12-22	561.42	\N	f
260	68C1-87888	2023-11-30	8777.45	\N	f
261	68C1-87888	2023-11-29	9454.74	\N	f
262	68A1-87898	2024-01-04	3915.84	\N	f
263	18D3-23565	2024-01-10	1895.56	\N	f
264	63A1-88888	2023-12-28	8908.65	\N	f
265	73A7-22356	2023-12-14	8886.68	\N	f
266	73A7-22356	2024-01-11	9930.49	\N	f
267	73A7-22356	2023-12-06	1258.68	\N	f
268	68A1-87898	2023-11-25	9468.4	\N	f
269	63A1-88888	2023-12-14	9750.81	\N	f
270	18D3-23565	2023-12-20	3052.83	\N	f
271	68A1-87898	2023-12-19	8874.5	\N	f
272	63A1-88888	2024-01-17	8474.22	\N	f
273	18D3-23565	2023-12-15	8040.59	\N	f
274	68A1-87898	2024-01-04	2160.44	\N	f
275	68A1-87898	2023-11-28	866.28	\N	f
276	68A1-87898	2023-12-26	4906.16	\N	f
277	18D3-23565	2024-01-18	1334.14	\N	f
278	18D3-23565	2023-11-25	1399.9	\N	f
279	68A1-87898	2023-12-06	5812.04	\N	f
280	68C1-87888	2023-12-26	3631.56	\N	f
281	18D3-23565	2024-01-22	3621.55	\N	f
282	73A7-22356	2023-12-13	8052.37	\N	f
283	18D3-23565	2023-12-24	4892.66	\N	f
284	73A7-22356	2024-01-21	3455.69	\N	f
285	68C1-87888	2023-12-31	3111.29	\N	f
286	63A1-88888	2023-11-25	6257.09	\N	f
287	63A1-88888	2024-01-03	8528.64	\N	f
288	63A1-88888	2023-12-10	8876.84	\N	f
289	63A1-88888	2023-12-05	5125.41	\N	f
290	68A1-87898	2023-12-02	6897.18	\N	f
291	63A1-88888	2023-12-11	7137.13	\N	f
292	68C1-87888	2024-01-15	1892.66	\N	f
293	73A7-22356	2023-12-04	5776.1	\N	f
294	18D3-23565	2023-12-14	1753.24	\N	f
295	73A7-22356	2023-12-23	1869.09	\N	f
296	18D3-23565	2024-01-13	1453.57	\N	f
297	68C1-87888	2023-12-04	5835	\N	f
298	73A7-22356	2023-12-23	4010.21	\N	f
299	68C1-87888	2024-01-18	6356.71	\N	f
300	68C1-87888	2024-01-11	1037.19	\N	f
172	68C1-87888	2023-12-24	2772.34	\N	f
201	63A1-88888	2023-12-31	6798.97	\N	f
185	73A7-22356	2024-01-19	4659.1	\N	f
116	63A1-88888	2023-12-10	8736.58	\N	f
143	18D3-23565	2023-12-14	6650.83	\N	f
133	18D3-23565	2024-01-21	8634.06	\N	f
114	18D3-23565	2023-12-12	5483.09	\N	f
129	68C1-87888	2023-12-19	8132.05	\N	f
161	18D3-23565	2023-12-18	3830.93	\N	f
204	68A1-87898	2023-12-07	9047.16	\N	f
124	18D3-23565	2023-12-20	449.94	\N	f
165	73A7-22356	2023-12-07	7220.95	\N	f
118	68A1-87898	2023-12-29	1941.34	\N	f
10	68C1-87888	2023-12-25	4512.57	\N	f
126	68A1-87898	2024-01-22	5357.01	\N	f
109	68C1-87888	2024-01-15	4860.6	\N	f
145	63A1-88888	2023-12-02	6629.75	\N	f
112	68A1-87898	2023-12-26	2814.71	\N	f
123	73A7-22356	2023-12-07	5865.36	\N	f
174	68A1-87898	2024-01-21	2307.33	\N	f
138	73A7-22356	2024-01-14	1603.39	\N	f
130	68A1-87898	2023-12-22	3697.61	\N	f
111	68A1-87898	2024-01-05	7198.71	\N	f
135	68A1-87898	2023-11-28	2427.91	\N	f
11	73A7-22356	2023-03-27	4589.56	\N	f
104	68A1-87898	2023-12-16	5546.31	\N	f
159	63A1-88888	2023-12-30	1394.21	\N	f
105	73A7-22356	2023-12-31	4475.68	\N	f
186	73A7-22356	2024-01-18	461.36	\N	f
147	68C1-87888	2024-01-12	2043.61	\N	f
177	68A1-87898	2023-12-28	3707.58	\N	f
136	68C1-87888	2023-12-01	8213.94	\N	f
131	73A7-22356	2024-01-23	3436.88	\N	f
106	63A1-88888	2023-12-31	7259.78	\N	f
181	68C1-87888	2024-01-18	4233.77	\N	f
113	68A1-87898	2024-01-04	41	\N	f
128	73A7-22356	2023-12-22	3093.47	\N	f
173	68C1-87888	2023-12-30	4527.52	\N	f
202	68C1-87888	2023-12-23	2947.35	\N	f
182	18D3-23565	2023-12-02	7090.1	\N	f
178	68C1-87888	2023-12-31	9663.22	\N	f
119	73A7-22356	2024-01-04	8852.33	\N	f
189	63A1-88888	2024-01-23	3784.68	\N	f
149	18D3-23565	2023-12-05	7161.57	\N	f
144	63A1-88888	2024-01-17	9259.68	\N	f
148	18D3-23565	2023-12-11	6800.32	\N	f
162	73A7-22356	2024-01-05	9556.97	\N	f
153	63A1-88888	2023-12-29	1795.84	\N	f
176	73A7-22356	2023-12-02	9631.92	\N	f
164	18D3-23565	2024-01-06	6180.91	\N	f
156	68C1-87888	2023-12-03	3968.1	\N	f
101	63A1-88888	2023-12-14	2235.97	\N	f
158	18D3-23565	2024-01-04	3028.78	\N	f
205	73A7-22356	2023-12-29	5824.37	\N	f
168	18D3-23565	2023-12-12	1778.19	\N	f
160	63A1-88888	2023-12-05	7759.97	\N	f
170	73A7-22356	2023-12-19	5170.26	\N	f
184	63A1-88888	2023-12-02	4652.54	\N	f
107	73A7-22356	2024-01-20	2682.86	\N	f
110	68C1-87888	2024-01-19	1387.8	\N	f
171	18D3-23565	2023-12-14	2463.27	\N	f
139	68A1-87898	2023-12-17	1433.95	\N	f
150	68A1-87898	2024-01-03	2431.63	\N	f
167	63A1-88888	2023-12-21	9698.06	\N	f
132	73A7-22356	2023-12-01	4646.91	\N	f
179	68A1-87898	2023-12-07	226.9	\N	f
142	63A1-88888	2023-12-04	3096.11	\N	f
169	68A1-87898	2023-12-11	5757.29	\N	f
108	68C1-87888	2023-12-27	5822.27	\N	f
137	68C1-87888	2024-01-02	1328.73	\N	f
187	18D3-23565	2024-01-14	2435.38	\N	f
103	73A7-22356	2023-12-28	6959.88	\N	f
183	18D3-23565	2024-01-21	6943.98	\N	f
151	18D3-23565	2023-12-28	1919.84	\N	f
115	68A1-87898	2024-01-14	4206.14	\N	f
166	68C1-87888	2023-12-22	1314.91	\N	f
157	18D3-23565	2023-12-16	9743.43	\N	f
121	73A7-22356	2023-12-05	1442.34	\N	f
206	18D3-23565	2023-12-26	4376.81	\N	f
127	63A1-88888	2024-01-05	3442.31	\N	f
175	68C1-87888	2024-01-04	7727.38	\N	f
8	68A1-87898	2023-02-15	5621.79	\N	f
180	68A1-87898	2023-12-10	1956.55	\N	f
188	18D3-23565	2023-12-27	7212.52	\N	f
155	68C1-87888	2023-11-25	233.89	\N	f
102	73A7-22356	2024-01-01	3091.83	\N	f
120	68C1-87888	2024-01-11	3805.72	\N	f
140	63A1-88888	2023-11-29	1494.64	\N	f
152	18D3-23565	2024-01-06	1848.01	\N	f
203	63A1-88888	2024-01-20	1898.53	\N	f
117	73A7-22356	2024-01-15	4084.7	\N	f
125	68C1-87888	2023-12-06	8824.52	\N	f
146	68C1-87888	2023-12-07	6711.45	\N	f
122	63A1-88888	2024-01-23	4552.57	\N	f
154	68A1-87898	2023-12-24	6515.24	\N	f
141	63A1-88888	2023-11-28	2318.98	\N	f
163	18D3-23565	2024-01-23	9897.09	\N	f
134	68A1-87898	2024-01-05	1071.2	\N	f
7	63A1-88888	2023-01-01	4865.52	\N	f
\.


--
-- Data for Name: fixed_car; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fixed_car (car_plate, id) FROM stdin;
63A1-88888	402
18D3-23565	403
68C1-87888	404
68A1-87898	405
73A7-22356	406
\.


--
-- Data for Name: mechanic; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mechanic (id) FROM stdin;
6
10
18
20
23
25
26
28
33
34
35
41
53
57
58
59
72
74
75
78
80
84
85
96
97
\.


--
-- Data for Name: sale_detail; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_detail (salerecord_id, car_id, quantity) FROM stdin;
314	1	1
315	4	1
316	3	1
317	2	1
317	9	1
280	11	1
235	3	1
262	4	1
300	5	1
288	7	1
228	12	1
218	13	1
275	6	1
282	8	1
232	2	1
272	1	1
299	11	1
293	3	1
225	4	1
287	5	1
316	7	1
237	12	1
230	13	1
266	6	1
256	8	1
295	2	1
226	1	1
204	9	1
211	3	1
242	4	1
224	5	1
281	7	1
290	12	1
252	13	1
274	6	1
283	8	1
214	2	1
241	1	1
212	9	1
213	11	1
253	4	1
207	5	1
210	7	1
259	12	1
277	13	1
296	6	1
244	8	1
264	2	1
231	1	1
279	9	1
260	11	1
289	3	1
286	5	1
255	7	1
273	12	1
216	13	1
265	6	1
276	8	1
206	2	1
263	1	1
254	9	1
219	11	1
239	3	1
205	4	1
270	7	1
220	12	1
258	13	1
208	6	1
238	8	1
250	2	1
284	1	1
271	9	1
247	11	1
222	3	1
217	4	1
240	5	1
201	12	1
229	13	1
236	6	1
297	8	1
268	2	1
291	1	1
233	9	1
314	11	1
249	3	1
292	4	1
261	5	1
221	7	1
203	13	1
285	6	1
298	8	1
267	2	1
223	1	1
248	9	1
202	11	1
227	3	1
209	4	1
269	5	1
245	7	1
243	12	1
257	6	1
215	8	1
278	2	1
234	1	1
\.


--
-- Data for Name: sale_record; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_record (salerecord_id, cus_id, date, total_price) FROM stdin;
314	402	\N	25000
315	403	\N	60000
316	404	\N	90000
317	405	\N	135000
201	46	2023-12-11	2749.28
202	42	2024-01-07	2854.72
203	48	2023-12-30	773.29
204	37	2024-01-14	9960.32
205	46	2023-11-27	8103.52
206	2	2024-01-08	9892.56
207	37	2023-11-28	2217.62
208	1	2023-12-11	6754.69
209	1	2023-12-23	9481.02
210	86	2023-12-09	7110.51
211	7	2023-12-21	1324.95
212	94	2023-12-02	9912.86
213	14	2023-12-15	2379.79
214	36	2023-12-06	3091.05
215	94	2024-01-09	7022.83
216	24	2023-12-14	5015.51
217	16	2023-12-19	5741.38
218	79	2023-11-27	9059.32
219	98	2023-11-27	705.62
220	87	2023-12-15	6566.59
221	93	2023-12-21	5078.4
222	24	2024-01-09	2063.25
223	99	2023-12-13	368.8
224	37	2023-12-06	943.94
225	8	2023-12-10	1039.53
226	7	2024-01-15	5323.71
227	42	2024-01-02	1900.35
228	48	2023-12-14	2354.33
229	98	2024-01-03	2782.83
230	8	2023-12-15	8611.35
231	86	2023-12-02	3209.27
232	87	2024-01-12	9851.51
233	2	2023-12-24	899.58
234	47	2024-01-07	5913.76
235	47	2024-01-12	1251.08
236	16	2023-12-03	8649.69
237	94	2023-12-31	5315.48
238	36	2023-11-28	8999.01
239	47	2024-01-14	7220.6
240	93	2023-12-17	575.15
241	61	2024-01-14	9308.34
242	46	2024-01-16	2248.65
243	87	2023-12-13	8007.28
244	46	2023-11-29	1339.84
245	91	2023-12-01	5805.88
246	61	2023-12-10	396.16
247	83	2023-12-16	9859.08
248	91	2023-12-14	5864.85
249	62	2023-12-12	6662.25
250	62	2024-01-12	1537.71
251	94	2023-12-04	5244.37
252	1	2024-01-07	9544.75
253	48	2023-12-11	6512.9
254	91	2023-12-30	7301.73
255	36	2024-01-15	5027.73
256	14	2023-12-16	9808.18
257	16	2023-11-26	1285.8
258	95	2023-12-10	8770.8
259	83	2024-01-03	6767.26
260	24	2024-01-15	3325.34
261	8	2023-12-21	7018.93
262	7	2024-01-19	1857.08
263	61	2024-01-08	6915.28
264	99	2023-12-17	8100.68
265	42	2023-12-26	9628.88
266	86	2023-12-09	5621.79
267	14	2023-12-14	6808.11
268	95	2023-12-29	5438.82
269	16	2023-12-07	5238.16
270	98	2023-12-17	8990.6
271	2	2024-01-02	5891.1
272	99	2023-12-31	1297.17
273	99	2023-12-25	4059.3
274	79	2023-11-25	3517.87
275	48	2024-01-20	5915.3
276	79	2023-12-04	1568.86
277	2	2023-12-19	5090.43
278	42	2023-12-14	8086.5
279	24	2023-12-24	8491.58
280	95	2023-12-22	1136.83
281	36	2024-01-20	6466.51
282	62	2023-11-28	7976.47
283	7	2023-12-28	5977.43
284	83	2023-12-06	9746.14
285	47	2023-12-03	9962.5
286	93	2023-12-19	1657.52
287	98	2023-12-20	1657.64
288	91	2024-01-01	2998.15
289	37	2023-11-27	5480.19
290	93	2023-12-02	6561.24
291	79	2023-12-20	9874.33
292	62	2023-12-23	9214.66
293	61	2024-01-08	6328.76
294	86	2023-12-23	2705.21
295	95	2024-01-15	5540.81
296	1	2023-11-27	1187.65
297	87	2023-12-12	5564.72
298	8	2023-12-08	8285.36
299	83	2023-11-29	4863.14
300	14	2023-11-29	6735.56
\.


--
-- Data for Name: sales_assistant; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sales_assistant (id) FROM stdin;
11
12
15
17
21
27
29
30
39
43
44
50
52
54
55
64
65
69
70
76
82
89
90
92
100
\.


--
-- Data for Name: storage_manager; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.storage_manager (id) FROM stdin;
3
4
5
9
13
19
22
31
32
38
40
45
49
51
56
60
63
66
67
68
71
73
77
81
88
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_info (username, password, permission, id, firstname, phonenumber, dob, address, lastname) FROM stdin;
adam_rock	trustno1	cus	1	Bích Huệ	0043928	2023-12-20	Cao Bằng	Hồng
steve_jobs	football	cus	2	Bảo Vy	32\r\n683\r\n8	2024-01-07	Quảng Ngãi	Tạ
luke_skywalker	asdfghjkl	sm	3	An Nhiên	884\r\n62\r\n	2023-12-20	Quảng Trị	Cung
sam_wise	1234567890	sm	4	Cát Linh	2\r\n1410550	2023-12-29	Hải Dương	Diêm
jessica_rabbit	monkey	sm	5	Bích Ngân	9\r\n66	2023-12-01	Điện Biên	Bành
taylor_swift	123123	mec	6	Bích San	71510926	2023-12-19	Hậu Giang	Phùng
sandy_sand	abc123	cus	7	An Nhàn	713450601	2023-11-28	Thái Nguyên	Văn
isabella_grace	shadow	cus	8	Anh Mai	98628	2023-12-07	Lai Châu	Cao
ricky_rico	123321	sm	9	An Di	652747\r\n	2024-01-13	Tây Ninh	Cấn
lily_lily	1234567	mec	10	Anh Thơ	905633	2023-12-22	Vĩnh Phúc	Hồng
danny_boy	12345	sa	11	Bảo Hà	8696973323	2023-12-20	Đồng Tháp	Hạc
jennifer_lopez	master	sa	12	An Bình	628\r\n322\r\n	2024-01-05	Cần Thơ	Phó
ruby_red	hunter	sm	13	Chi Mai	05963	2023-12-04	Yên Bái	Đới
emily_blunt	harley	cus	14	Bích Quyên	033560\r\n50	2023-11-27	Nghệ An	Tăng
noah_boat	qwerty	sa	15	Bảo Uyên	855426784	2024-01-19	Hà Giang	Vũ
james_james	123qwe	cus	16	Bạch Tuyết	37187\r\n\r\n5	2023-11-28	Hòa Bình	Chu
julia_roberts	baseball	sa	17	Bích Hảo	3398828483	2023-12-23	Hưng Yên	Cao
ryan_ryan	1234	mec	18	Bạch Mai	37738	2024-01-06	Bà Rịa - Vũng Tàu	Cao
jake_snake	qwertyuiop	sm	19	An Hằng	1\r\n\r\n76	2024-01-07	Gia Lai	Kỷ
george_clooney	12345678	mec	20	Bích Thủy	689\r\n3407	2024-01-09	Bình Thuận	Trương
daniel_tiger	buster	sa	21	Bích Châu	33967\r\n40	2024-01-16	Bình Phước	Đặng
antonio_789	123321	sm	22	Bích Ngọc	7110349293	2023-11-30	Đồng Nai	Đào
mia_sky	1234	mec	23	Anh Phương	8037873	2023-12-24	Bến Tre	Chu
peter_pan	letmein	cus	24	Bích Hiền	597683676	2024-01-18	Vĩnh Long	Lý
sara_star	freedom	mec	25	Bình Minh	75342663	2024-01-10	Phú Thọ	Trần
brad_pitt	000000	mec	26	Bích Trâm	2768\r\n7	2023-11-28	Hòa Bình	Khuất
kelly_kelly	bailey	sa	27	Chiêu Dương	778654	2023-12-20	Cao Bằng	Kiều
leo_leo	superman	mec	28	Chi Lan	0809993\r\n	2023-12-21	Sóc Trăng	Mạc
mike_mike	baseball	sa	29	Bích Lam	7745\r\n457	2023-12-27	Thanh Hóa	Tôn
kim_kardashian	jessica	sa	30	Anh Hương	99627	2023-12-14	Hải Phòng	Tiêu
zoe_zoe	bailey	sm	31	Bích Trang	1\r\n2140\r\n0	2024-01-03	Đắk Lắk	Lâm
ben_ben	azerty	sm	32	Anh Thảo	9\r\n936778	2024-01-02	Khánh Hòa	Chu
nick_nick	666666	mec	33	Anh Thy	140182224	2024-01-23	Tiền Giang	Tăng
bob_builder	freedom	mec	34	Băng Tâm	878456	2023-11-30	Bắc Giang	Lại
matt_damon	michael	mec	35	Bảo Trân	326489257	2023-12-20	Hà Tĩnh	Vương
nicole_kidman	trustno1	cus	36	Bảo Ngọc	57455\r\n6	2023-12-10	Đà Nẵng	Vương
billy_bob	dragon	cus	37	Bích Hà	34331	2023-12-28	Cà Mau	Ngô
leo_king	123456789	sm	38	An Khê	0171\r\n73	2024-01-19	Lai Châu	Quách
tommy_tomato	harley	sa	39	Bích Duyên	812486\r\n33	2024-01-04	Quảng Bình	Nguyễn
harry_potter	shadow	sm	40	Bảo Thoa	793\r\n203	2023-12-16	Lâm Đồng	Lữ
adam_adam	1q2w3e4r	mec	41	An Hạ	1104369288	2024-01-12	An Giang	Tô
jack_sparrow	welcome	cus	42	Bội Linh	6885883852	2024-01-22	Đắk Lắk	Hứa
chloe_chloe	michael	sa	43	Bảo Châu	1210\r\n614	2023-12-20	Hà Giang	Tống
angelina_jolie	qwerty123	sa	44	Bảo Huệ	708721\r\n	2024-01-03	Hà Nội	Khương
will_smith	1234567	sm	45	Bảo Thúy	409249	2023-12-31	Bắc Ninh	Văn
tyler_durden	zaq1zaq1	cus	46	Bạch Cúc	49603	2023-12-05	Bắc Kạn	Phan
alex_456	azerty	cus	47	Bích Như	964730	2023-12-21	Quảng Ninh	Phùng
ben_10	qwertyuiop	cus	48	Bích Vân	4140155729	2024-01-20	Hà Nam	Chu
lisa1990	666666	sm	49	Bảo Trúc	81\r\n7	2024-01-18	Kiên Giang	Hồ
claire_bear	iloveyou	sa	50	Anh Thư	753901	2024-01-19	Thái Bình	Triệu
lily_flower	sunshine	sm	51	Bích Ngà	63\r\n5\r\n8	2024-01-10	Tuyên Quang	Hà
charlie_brown	sunshine	sa	52	Bích Hạnh	9049336454	2024-01-05	Thừa Thiên Huế	Đồng
katie_kitty	qwerty123	mec	53	Bích Nga	35209278	2023-11-28	Bà Rịa - Vũng Tàu	Hồ
monica_geller	letmein	sa	54	Bạch Hoa	7144335	2023-12-30	Bắc Ninh	Từ
andy_candy	nicole	sa	55	Băng Băng	38\r\n9\r\n	2023-12-01	Đà Nẵng	Tào
jason_bourne	111111	sm	56	Cát Tiên	5241767067	2024-01-09	Đắk Nông	Phạm
hailey_bailey	abc123	mec	57	Bích Thoa	24009	2023-12-11	Bình Phước	Quách
kevin_bacon	1234567890	mec	58	Bạch Yến	8335006815	2023-12-03	Hưng Yên	Bùi
ella_bella	qwerty	mec	59	Bích Hằng	47\r\n703	2024-01-06	Bạc Liêu	Đàm
david123	hunter	sm	60	Bảo Trâm	4007167	2024-01-16	Bình Định	Hà
john_doe	daniel	cus	61	Cát Ly	6203517	2024-01-01	Đồng Nai	Trịnh
lucy_lu	superman	cus	62	Bích Ðiệp	139186866	2024-01-01	Ninh Thuận	Phổ
mike_jones	123456	sm	63	Bảo Quỳnh	7720050	2024-01-17	Lạng Sơn	Phan
josh_bosh	buster	sa	64	Anh Vũ	1\r\n96	2023-12-24	Lâm Đồng	Tống
rachel_green	password	sa	65	Bạch Trà	6133301	2023-12-07	Cà Mau	Hứa
abigail_baby	password1	sm	66	Cam Thảo	1351\r\n566	2023-12-21	Đắk Nông	Võ
molly_dolly	123qwe	sm	67	Bảo Tiên	863582000	2024-01-10	Gia Lai	Cao
hannah_montana	ranger	sm	68	Bạch Vân	2400495546	2024-01-21	Bạc Liêu	Quách
grace_kelly	daniel	sa	69	Bích Hồng	379\r\n1159	2023-12-02	Bình Dương	Huỳnh
laura_lee	654321	sa	70	Bảo Phương	50656	2023-12-11	Kon Tum	Dậu
marco_polo	1q2w3e4r	sm	71	Bạch Liên	2920655	2024-01-09	Bắc Giang	Uông
zoe_moon	ranger	mec	72	Bích Hậu	39940855	2023-12-15	Hải Phòng	Đoàn
chris_pratt	football	sm	73	Bảo Lan	70791524	2023-12-18	Bình Định	Quan
jade_jade	dragon	mec	74	Bích Phượng	7\r\n75682	2023-12-04	Hà Nam	Hoàng
amy_pond	monkey	mec	75	Bảo Vân	809796	2024-01-06	Hà Nội	Lưu
tom_cruise	welcome	sa	76	Bảo Quyên	16792\r\n34	2024-01-04	Hà Tĩnh	Hữu
ava_sun	123456789	sm	77	Bích Ty	582532706	2023-11-30	Kiên Giang	Dương
jack_jack	jessica	mec	78	Bảo Lễ	1597569	2023-12-12	Nam Định	Diệp
simon_says	password1	cus	79	Bảo Anh	59670\r\n4	2023-12-23	Ninh Bình	Vĩnh
anna_banana	123123	mec	80	Cát Cát	358617	2023-11-25	Quảng Nam	Dương
nora_norah	12345	sm	81	Bình Yên	509\r\n	2024-01-09	Sơn La	Đỗ
chloe_bear	zaq1zaq1	sa	82	Bích Chiêu	907552285	2023-12-04	Lạng Sơn	Diệp
max_power	princess	cus	83	Anh Ðào	35218658	2024-01-19	Hậu Giang	Phương
ryan_reynolds	asdfghjkl	mec	84	Anh Thi	70403	2023-12-11	Kon Tum	Mai
logan_wolverine	000000	mec	85	Bích Quân	1\r\n5302	2023-12-29	Phú Yên	Ngọc
lola_lola	master	cus	86	Ban Mai	331189134	2023-12-30	Điện Biên	Phí
ethan_hunt	nicole	cus	87	Bảo Hân	354024	2024-01-10	Lào Cai	Đinh
zoey_zooey	passw0rd	sm	88	Bích Loan	74\r\n01303	2023-12-13	Bình Thuận	Lê
tom_tom	passw0rd	sa	89	Bích Hải	9437687157	2023-12-11	TP Hồ Chí Minh	Chu
olivia_olive	flower	sa	90	Bích Thu	883\r\n64	2023-12-18	Trà Vinh	Khoa
james_bond	654321	cus	91	Bích Hợp	8\r\n05484	2023-12-31	Lào Cai	Mạch
jeremy_seattle	flower	sa	92	Bích Thảo	9166764208	2024-01-03	An Giang	Tạ
sara_sara	princess	cus	93	Anh Chi	0\r\n52	2023-12-29	Khánh Hòa	Diệp
maria_love	password	cus	94	Bích Liên	990075007	2024-01-14	Long An	Trang
emma_smith	123456	cus	95	Phương Chi	8425\r\n	2024-01-07	Bắc Kạn	Nghiêm
emma_emma	soccer	mec	96	Bạch Kim	6270118139	2023-12-06	Hải Dương	Đồng
mia_mia	soccer	mec	97	Bạch Loan	9\r\n7539646	2023-12-05	Bến Tre	Giang
laura_laura	111111	cus	98	Bạch Quỳnh	714\r\n916	2024-01-15	Đồng Tháp	Thanh
sophia_rose	12345678	cus	99	Bảo Bình	34755	2023-12-11	Bình Dương	Thái
alexander_great	iloveyou	sa	100	Bích Ðào	5432420\r\n	2023-11-29	Cần Thơ	Phùng
\.


--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ap_import_invoice_importinvoice_id2_seq', 401, true);


--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auto_part_ap_id_seq', 153, true);


--
-- Name: car_car_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.car_car_id_seq', 24, true);


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.car_import_invoice_importinvoice_id_seq', 402, true);


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.federated_credentials_id_seq', 1, false);


--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fix_detail_fixdetail_id_seq', 9, true);


--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fix_record_fixrecord_id_seq', 11, true);


--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sale_record_salerecord_id_seq', 317, true);


--
-- Name: user_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_info_id_seq', 438, true);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY ("customer_ID", "car_ID");


--
-- Name: customer customer_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: federated_credentials federated_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_pkey PRIMARY KEY (id);


--
-- Name: federated_credentials federated_credentials_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_user_id_key UNIQUE (user_id);


--
-- Name: mechanic mechanic_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanic
    ADD CONSTRAINT mechanic_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: ap_import_invoice pk_ap_import_invoice; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_invoice
    ADD CONSTRAINT pk_ap_import_invoice PRIMARY KEY (importinvoice_id);


--
-- Name: ap_import_report pk_ap_import_report; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT pk_ap_import_report PRIMARY KEY (importinvoice_id, ap_id);


--
-- Name: auto_part pk_auto_part; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auto_part
    ADD CONSTRAINT pk_auto_part PRIMARY KEY (ap_id);


--
-- Name: car pk_car; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT pk_car PRIMARY KEY (id);


--
-- Name: car_import_invoice pk_car_import_invoice; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_invoice
    ADD CONSTRAINT pk_car_import_invoice PRIMARY KEY (importinvoice_id);


--
-- Name: car_import_report pk_car_import_report; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT pk_car_import_report PRIMARY KEY (importinvoice_id, car_id);


--
-- Name: fix_detail pk_fix_detail; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT pk_fix_detail PRIMARY KEY (fixdetail_id);


--
-- Name: fix_record pk_fix_record; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_record
    ADD CONSTRAINT pk_fix_record PRIMARY KEY (fixrecord_id);


--
-- Name: fixed_car pk_fixed_car; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_car
    ADD CONSTRAINT pk_fixed_car PRIMARY KEY (car_plate);


--
-- Name: sale_detail pk_sale_detail; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT pk_sale_detail PRIMARY KEY (salerecord_id, car_id);


--
-- Name: sale_record pk_sale_record; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_record
    ADD CONSTRAINT pk_sale_record PRIMARY KEY (salerecord_id);


--
-- Name: storage_manager storage_manager_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.storage_manager
    ADD CONSTRAINT storage_manager_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: user_info user_info_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (id);


--
-- Name: user_info user_info_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_username_key UNIQUE (username);


--
-- Name: ap_import_invoice_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ap_import_invoice_pk ON public.ap_import_invoice USING btree (importinvoice_id);


--
-- Name: car_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX car_pk ON public.car USING btree (id);


--
-- Name: fix_detail_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fix_detail_pk ON public.fix_detail USING btree (fixdetail_id);


--
-- Name: fix_record_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fix_record_pk ON public.fix_record USING btree (fixrecord_id);


--
-- Name: fixed_car_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX fixed_car_pk ON public.fixed_car USING btree (car_plate);


--
-- Name: import_invoice_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX import_invoice_pk ON public.car_import_invoice USING btree (importinvoice_id);


--
-- Name: relationship_12_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_12_fk ON public.ap_import_report USING btree (importinvoice_id);


--
-- Name: relationship_12_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX relationship_12_pk ON public.ap_import_report USING btree (importinvoice_id, ap_id);


--
-- Name: relationship_13_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_13_fk ON public.car_import_report USING btree (importinvoice_id);


--
-- Name: relationship_13_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX relationship_13_pk ON public.car_import_report USING btree (importinvoice_id, car_id);


--
-- Name: relationship_19_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_19_fk ON public.ap_import_report USING btree (ap_id);


--
-- Name: relationship_20_fk2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_20_fk2 ON public.car_import_report USING btree (car_id);


--
-- Name: relationship_6_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_6_fk ON public.fix_detail USING btree (fixrecord_id);


--
-- Name: relationship_8_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX relationship_8_fk ON public.fix_record USING btree (car_plate);


--
-- Name: sale_detail2_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sale_detail2_fk ON public.sale_detail USING btree (car_id);


--
-- Name: sale_detail_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sale_detail_pk ON public.sale_detail USING btree (salerecord_id, car_id);


--
-- Name: sale_record_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX sale_record_pk ON public.sale_record USING btree (salerecord_id);


--
-- Name: user_pk; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX user_pk ON public.user_info USING btree (username, password, id);


--
-- Name: ap_import_report calculate_ap_import_price; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_ap_import_price AFTER INSERT ON public.ap_import_report FOR EACH ROW EXECUTE FUNCTION public.calculate_ap_import_total_price();


--
-- Name: car_import_report calculate_car_import_price; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_car_import_price AFTER INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.calculate_car_import_total_price();


--
-- Name: sale_detail calculate_sale_record_total_price_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_sale_record_total_price_trigger AFTER INSERT OR UPDATE ON public.sale_detail FOR EACH ROW EXECUTE FUNCTION public.calculate_sale_record_total_price();


--
-- Name: car_import_report check_car_quantity_on_import_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_car_quantity_on_import_trigger BEFORE INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.check_car_quantity_on_import();


--
-- Name: fix_detail update_ap_quantity_on_fix; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ap_quantity_on_fix AFTER INSERT ON public.fix_detail FOR EACH ROW EXECUTE FUNCTION public.update_ap_quantity_on_fix();


--
-- Name: car_import_report update_car_quantity_on_import; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_car_quantity_on_import AFTER INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.update_car_quantity_on_import();


--
-- Name: sale_detail update_car_quantity_on_sale_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_car_quantity_on_sale_trigger AFTER INSERT ON public.sale_detail FOR EACH ROW EXECUTE FUNCTION public.update_car_quantity_on_sale();


--
-- Name: fix_detail update_fix_record_total_price_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_fix_record_total_price_trigger AFTER INSERT OR UPDATE ON public.fix_detail FOR EACH ROW EXECUTE FUNCTION public.update_fix_record_total_price();


--
-- Name: user_info user_delete_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_delete_trigger BEFORE DELETE ON public.user_info FOR EACH ROW EXECUTE FUNCTION public.delete_user();


--
-- Name: user_info user_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_insert_trigger AFTER INSERT ON public.user_info FOR EACH ROW EXECUTE FUNCTION public.role_distribute();


--
-- Name: ap_import_invoice ap_import_invoice_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_invoice
    ADD CONSTRAINT ap_import_invoice_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.storage_manager(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: ap_import_report ap_import_report_ap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT ap_import_report_ap_id_fkey FOREIGN KEY (ap_id) REFERENCES public.auto_part(ap_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: ap_import_report ap_import_report_importinvoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT ap_import_report_importinvoice_id_fkey FOREIGN KEY (importinvoice_id) REFERENCES public.ap_import_invoice(importinvoice_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_invoice car_import_invoice_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_invoice
    ADD CONSTRAINT car_import_invoice_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.storage_manager(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_report car_import_report_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT car_import_report_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_report car_import_report_importinvoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT car_import_report_importinvoice_id_fkey FOREIGN KEY (importinvoice_id) REFERENCES public.car_import_invoice(importinvoice_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: cart cart_car_ID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "cart_car_ID_fkey" FOREIGN KEY ("car_ID") REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: cart cart_customer_ID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "cart_customer_ID_fkey" FOREIGN KEY ("customer_ID") REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: federated_credentials federated_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id);


--
-- Name: fix_detail fix_detail_ap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_ap_id_fkey FOREIGN KEY (ap_id) REFERENCES public.auto_part(ap_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_detail fix_detail_fixrecord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_fixrecord_id_fkey FOREIGN KEY (fixrecord_id) REFERENCES public.fix_record(fixrecord_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_detail fix_detail_mec_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_mec_id_fkey FOREIGN KEY (mec_id) REFERENCES public.mechanic(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_record fix_record_car_plate_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fix_record
    ADD CONSTRAINT fix_record_car_plate_fkey FOREIGN KEY (car_plate) REFERENCES public.fixed_car(car_plate) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fixed_car fixed_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fixed_car
    ADD CONSTRAINT fixed_car_id_fkey FOREIGN KEY (id) REFERENCES public.customer(id) NOT VALID;


--
-- Name: sale_detail sale_detail_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT sale_detail_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: sale_detail sale_detail_salerecord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT sale_detail_salerecord_id_fkey FOREIGN KEY (salerecord_id) REFERENCES public.sale_record(salerecord_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: sale_record sale_record_cus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_record
    ADD CONSTRAINT sale_record_cus_id_fkey FOREIGN KEY (cus_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- PostgreSQL database dump complete
--

