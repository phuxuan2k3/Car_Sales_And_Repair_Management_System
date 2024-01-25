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
-- Name: add_newcar(text, text, text, integer, double precision, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_newcar(carname text, brand text, type text, year integer, price double precision, des text, qut integer, smid integer) RETURNS integer
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
return carID;
END;
$$;


ALTER FUNCTION public.add_newcar(carname text, brand text, type text, year integer, price double precision, des text, qut integer, smid integer) OWNER TO postgres;

--
-- Name: add_newitem(text, text, double precision, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_newitem(apname text, supplier text, price double precision, qut integer, smid integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE 
apID integer;
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
insert into auto_part("name",supplier,price,quantity) values(apname,supplier,price, qut) returning ap_id into apID;
insert into ap_import_invoice(sm_id) values (smid) returning importinvoice_id into invoiceID;
insert into ap_import_report(importinvoice_id,ap_id,date,quantity) values(invoiceID, apID,current_date_var,qut);
return apID;
END;
$$;


ALTER FUNCTION public.add_newitem(apname text, supplier text, price double precision, qut integer, smid integer) OWNER TO postgres;

--
-- Name: calculate_ap_import_total_price(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.calculate_ap_import_total_price() OWNER TO postgres;

--
-- Name: calculate_car_import_total_price(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.calculate_car_import_total_price() OWNER TO postgres;

--
-- Name: calculate_sale_record_total_price(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.calculate_sale_record_total_price() OWNER TO postgres;

--
-- Name: check_car_quantity_on_import(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.check_car_quantity_on_import() OWNER TO postgres;

--
-- Name: delete_user(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.delete_user() OWNER TO postgres;

--
-- Name: purchase_car(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.purchase_car(carid integer, cusid integer) OWNER TO postgres;

--
-- Name: purchase_cart(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.purchase_cart(carid integer, cusid integer) OWNER TO postgres;

--
-- Name: role_distribute(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.role_distribute() OWNER TO postgres;

--
-- Name: update_ap(text, text, double precision, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_ap(apname text, csupplier text, cprice double precision, apid integer, qut integer, smid integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE 
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;
if (qut=0) then

	update auto_part
	set "name" = apname,"supplier"=csupplier,"price"=cprice
	where "ap_id" = apid;
else
update auto_part
set "name" = apname,"supplier"=csupplier,"price"=cprice
where "ap_id" = apid;

update auto_part 
set quantity = quantity + qut
where "ap_id" = apID;

insert into ap_import_invoice(sm_id) values (smid) returning importinvoice_id into invoiceID;
insert into ap_import_report(importinvoice_id,ap_id,date,quantity) values(invoiceID, apID,current_date_var,qut);
end if;
return apID;

END;
$$;


ALTER FUNCTION public.update_ap(apname text, csupplier text, cprice double precision, apid integer, qut integer, smid integer) OWNER TO postgres;

--
-- Name: update_ap_quantity_on_fix(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.update_ap_quantity_on_fix() OWNER TO postgres;

--
-- Name: update_car(text, text, text, integer, double precision, text, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_car(carname text, cbrand text, ctype text, cyear integer, cprice double precision, des text, carid integer, qut integer, smid integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE 
invoiceID integer;
current_date_var DATE;
BEGIN
current_date_var := CURRENT_DATE;

if (qut=0) then

	update car
	set "car_name" = carname,"brand"=cbrand,"type"=ctype,"price"=cprice,"description"=des
	where "id" = carID;
else
update car
set "car_name" = carname,"brand"=cbrand,"type"=ctype,"price"=cprice,"description"=des,quantity = quantity + qut
where "id" = carID;

insert into car_import_invoice(sm_id) values (smid) returning importinvoice_id into invoiceID;
insert into car_import_report(importinvoice_id,car_id,quantity,date) values(invoiceID, carID,qut,current_date_var);
end if;
return carID;

END;
$$;


ALTER FUNCTION public.update_car(carname text, cbrand text, ctype text, cyear integer, cprice double precision, des text, carid integer, qut integer, smid integer) OWNER TO postgres;

--
-- Name: update_car_quantity_on_import(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.update_car_quantity_on_import() OWNER TO postgres;

--
-- Name: update_car_quantity_on_sale(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_car_quantity_on_sale() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE car
  SET quantity = quantity - new.quantity
  WHERE id = new.car_id;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_car_quantity_on_sale() OWNER TO postgres;

--
-- Name: update_fix_record_total_price(); Type: FUNCTION; Schema: public; Owner: postgres
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


ALTER FUNCTION public.update_fix_record_total_price() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ap_import_invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ap_import_invoice (
    importinvoice_id integer NOT NULL,
    sm_id integer NOT NULL,
    total double precision DEFAULT 0
);


ALTER TABLE public.ap_import_invoice OWNER TO postgres;

--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ap_import_invoice_importinvoice_id2_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ap_import_invoice_importinvoice_id2_seq OWNER TO postgres;

--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ap_import_invoice_importinvoice_id2_seq OWNED BY public.ap_import_invoice.importinvoice_id;


--
-- Name: ap_import_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ap_import_report (
    importinvoice_id integer NOT NULL,
    ap_id integer NOT NULL,
    date date,
    quantity integer
);


ALTER TABLE public.ap_import_report OWNER TO postgres;

--
-- Name: auto_part; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auto_part (
    name text,
    supplier text,
    price double precision,
    ap_id integer NOT NULL,
    quantity integer
);


ALTER TABLE public.auto_part OWNER TO postgres;

--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auto_part_ap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auto_part_ap_id_seq OWNER TO postgres;

--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auto_part_ap_id_seq OWNED BY public.auto_part.ap_id;


--
-- Name: car; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car (
    car_name text,
    brand text NOT NULL,
    type text NOT NULL,
    year integer,
    price double precision,
    description text,
    quantity integer,
    id integer NOT NULL,
    CONSTRAINT car_qunt CHECK ((quantity >= 0))
);


ALTER TABLE public.car OWNER TO postgres;

--
-- Name: car_brand; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_brand (
    brand text NOT NULL
);


ALTER TABLE public.car_brand OWNER TO postgres;

--
-- Name: car_car_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_car_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.car_car_id_seq OWNER TO postgres;

--
-- Name: car_car_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_car_id_seq OWNED BY public.car.id;


--
-- Name: car_import_invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_import_invoice (
    importinvoice_id integer NOT NULL,
    sm_id integer NOT NULL,
    total double precision DEFAULT 0
);


ALTER TABLE public.car_import_invoice OWNER TO postgres;

--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_import_invoice_importinvoice_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.car_import_invoice_importinvoice_id_seq OWNER TO postgres;

--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_import_invoice_importinvoice_id_seq OWNED BY public.car_import_invoice.importinvoice_id;


--
-- Name: car_import_report; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_import_report (
    importinvoice_id integer NOT NULL,
    car_id integer NOT NULL,
    quantity integer,
    date date
);


ALTER TABLE public.car_import_report OWNER TO postgres;

--
-- Name: car_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_type (
    type text NOT NULL
);


ALTER TABLE public.car_type OWNER TO postgres;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart (
    "customer_ID" integer NOT NULL,
    "car_ID" integer NOT NULL,
    quantity integer
);


ALTER TABLE public.cart OWNER TO postgres;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id integer NOT NULL
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- Name: federated_credentials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.federated_credentials (
    id integer NOT NULL,
    user_id integer,
    provider text,
    subject text
);


ALTER TABLE public.federated_credentials OWNER TO postgres;

--
-- Name: federated_credentials_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.federated_credentials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.federated_credentials_id_seq OWNER TO postgres;

--
-- Name: federated_credentials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.federated_credentials_id_seq OWNED BY public.federated_credentials.id;


--
-- Name: fix_detail; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.fix_detail OWNER TO postgres;

--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fix_detail_fixdetail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fix_detail_fixdetail_id_seq OWNER TO postgres;

--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fix_detail_fixdetail_id_seq OWNED BY public.fix_detail.fixdetail_id;


--
-- Name: fix_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fix_record (
    fixrecord_id integer NOT NULL,
    car_plate text NOT NULL,
    date date,
    total_price double precision,
    status text,
    pay boolean DEFAULT false
);


ALTER TABLE public.fix_record OWNER TO postgres;

--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fix_record_fixrecord_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fix_record_fixrecord_id_seq OWNER TO postgres;

--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fix_record_fixrecord_id_seq OWNED BY public.fix_record.fixrecord_id;


--
-- Name: fixed_car; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fixed_car (
    car_plate text NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.fixed_car OWNER TO postgres;

--
-- Name: mechanic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mechanic (
    id integer NOT NULL
);


ALTER TABLE public.mechanic OWNER TO postgres;

--
-- Name: sale_detail; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_detail (
    salerecord_id integer NOT NULL,
    car_id integer NOT NULL,
    quantity integer DEFAULT 1
);


ALTER TABLE public.sale_detail OWNER TO postgres;

--
-- Name: sale_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_record (
    salerecord_id integer NOT NULL,
    cus_id integer NOT NULL,
    date date,
    total_price double precision DEFAULT 0
);


ALTER TABLE public.sale_record OWNER TO postgres;

--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_record_salerecord_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_record_salerecord_id_seq OWNER TO postgres;

--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_record_salerecord_id_seq OWNED BY public.sale_record.salerecord_id;


--
-- Name: sales_assistant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_assistant (
    id integer NOT NULL
);


ALTER TABLE public.sales_assistant OWNER TO postgres;

--
-- Name: storage_manager; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.storage_manager (
    id integer NOT NULL
);


ALTER TABLE public.storage_manager OWNER TO postgres;

--
-- Name: user-session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user-session" (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public."user-session" OWNER TO postgres;

--
-- Name: user_info; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.user_info OWNER TO postgres;

--
-- Name: user_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_info_id_seq OWNER TO postgres;

--
-- Name: user_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_info_id_seq OWNED BY public.user_info.id;


--
-- Name: ap_import_invoice importinvoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_invoice ALTER COLUMN importinvoice_id SET DEFAULT nextval('public.ap_import_invoice_importinvoice_id2_seq'::regclass);


--
-- Name: auto_part ap_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_part ALTER COLUMN ap_id SET DEFAULT nextval('public.auto_part_ap_id_seq'::regclass);


--
-- Name: car id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car ALTER COLUMN id SET DEFAULT nextval('public.car_car_id_seq'::regclass);


--
-- Name: car_import_invoice importinvoice_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_invoice ALTER COLUMN importinvoice_id SET DEFAULT nextval('public.car_import_invoice_importinvoice_id_seq'::regclass);


--
-- Name: federated_credentials id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_credentials ALTER COLUMN id SET DEFAULT nextval('public.federated_credentials_id_seq'::regclass);


--
-- Name: fix_detail fixdetail_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_detail ALTER COLUMN fixdetail_id SET DEFAULT nextval('public.fix_detail_fixdetail_id_seq'::regclass);


--
-- Name: fix_record fixrecord_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_record ALTER COLUMN fixrecord_id SET DEFAULT nextval('public.fix_record_fixrecord_id_seq'::regclass);


--
-- Name: sale_record salerecord_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_record ALTER COLUMN salerecord_id SET DEFAULT nextval('public.sale_record_salerecord_id_seq'::regclass);


--
-- Name: user_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info ALTER COLUMN id SET DEFAULT nextval('public.user_info_id_seq'::regclass);


--
-- Data for Name: ap_import_invoice; Type: TABLE DATA; Schema: public; Owner: postgres
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
224	49	0
225	73	0
227	51	0
228	56	0
229	56	0
230	56	0
231	5	0
233	71	0
234	68	0
235	73	0
236	81	0
238	49	0
239	81	0
240	73	0
241	60	0
242	38	0
243	22	0
244	51	0
246	67	0
247	56	0
249	3	0
250	60	0
251	67	0
252	63	0
253	66	0
255	22	0
256	5	0
257	77	0
258	49	0
259	22	0
260	22	0
261	71	0
262	38	0
264	88	0
265	67	0
266	49	0
267	13	0
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
301	88	0
302	67	0
303	66	0
304	51	0
305	49	0
306	13	0
307	71	0
308	56	0
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
327	38	0
328	4	0
329	71	0
330	4	0
331	32	0
332	51	0
334	5	0
335	56	0
337	66	0
339	5	0
340	51	0
343	3	0
344	63	0
345	68	0
347	38	0
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
378	49	0
379	5	0
380	45	0
381	13	0
382	77	0
383	32	0
385	73	0
299	68	130
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
402	3	100
403	5	144
404	3	0
405	5	13
406	5	42435
\.


--
-- Data for Name: ap_import_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ap_import_report (importinvoice_id, ap_id, date, quantity) FROM stdin;
206	19	2023-12-17	6
291	16	2024-01-13	4
238	14	2024-01-21	7
255	20	2024-01-13	7
240	15	2023-12-23	0
211	21	2023-12-31	6
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
234	16	2023-12-26	8
298	14	2023-12-13	2
283	20	2024-01-15	1
230	21	2023-11-29	8
287	18	2023-12-11	4
203	13	2024-01-09	3
212	17	2023-12-12	10
285	19	2024-01-13	8
227	16	2024-01-20	10
258	20	2023-12-25	8
294	15	2023-12-25	5
260	18	2023-12-30	7
252	13	2023-12-26	2
292	17	2024-01-02	3
225	19	2023-12-23	10
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
265	19	2024-01-08	4
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
271	13	2024-01-10	5
207	17	2023-12-02	7
273	14	2024-01-06	9
262	20	2024-01-15	10
275	15	2024-01-18	9
209	21	2023-12-27	1
272	18	2024-01-20	9
215	13	2023-11-30	6
216	19	2023-11-29	10
259	14	2024-01-07	9
402	14	2024-01-22	10
403	157	2024-01-23	12
299	18	2024-01-24	5
405	15	2024-01-24	1
406	158	2024-01-24	345
\.


--
-- Data for Name: auto_part; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auto_part (name, supplier, price, ap_id, quantity) FROM stdin;
Fuel Pump	CarCare Depot	60	17	4
Brake Pads	ABC Auto Parts	50	13	5
Battery	PowerDrive Inc.	100	21	20
Air Filter	AutoTech Supplies	13	15	9
new	1213	123	158	345
12	12	12	157	0
Timing Belt	Speedy Auto	26	18	1
Spark Plugs	abc	10	14	0
Radiator	PartsRUs	80	16	0
Shock Absorbers	Global Automotive	35	20	0
Oil Filter	Superior Parts	9	19	6
\.


--
-- Data for Name: car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car (car_name, brand, type, year, price, description, quantity, id) FROM stdin;
Jeep Wrangler	Jeep	Off-Road	2022	35000	An iconic off-road vehicle with a removable top and rugged design.	6	7
Nissan Altima	Nissan	Sedan	2023	27000	A midsize sedan with a smooth ride and a spacious comfortable interior.	6	8
BMW X5	BMW	Luxury SUV	2022	60000	A luxury SUV with a premium interior advanced tech features  and strong performance.	6	9
Hyundai Tucson	Hyundai	Crossover	2022	25000	A compact crossover with a stylish design and a range of safety features.	2	11
Mercedes-Benz E-Class	Mercedes-Benz	Luxury Sedan	2023	65000	A luxurious sedan with a refined interior and advanced driver-assistance systems.	7	12
Toyota Camry	Toyota	Sedan	2022	25000	A popular midsize sedan known for reliability and fuel efficiency.	0	1
Honda CR-V	Honda	SUV	2022	30000	A compact SUV that offers a spacious interior and advanced safety features.	100	3
Chevrolet Silverado	Chevrolet	Truck	2023	35000	A rugged pickup truck known for its towing capacity and durability.	7	4
Volkswagen Golf	Volkswagen	Hatchback	2023	23000	A versatile hatchback with a comfortable ride and European styling.	0	6
Tesla Model 3	Tesla	Electric	2022	45000	An electric sedan with cutting-edge technology and impressive performance.	2	5
ok\n	Honda	SUV	\N	\N	\N	\N	38
\.


--
-- Data for Name: car_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_brand (brand) FROM stdin;
Mercedes-Benz
Honda
BMW
Jeep
Volkswagen
Ford
Nissan
Hyundai
Toyota
Chevrolet
Tesla
\.


--
-- Data for Name: car_import_invoice; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_import_invoice (importinvoice_id, sm_id, total) FROM stdin;
415	5	3000000
\.


--
-- Data for Name: car_import_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_import_report (importinvoice_id, car_id, quantity, date) FROM stdin;
415	3	100	2024-01-24
\.


--
-- Data for Name: car_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_type (type) FROM stdin;
Crossover
Hatchback
SUV
Electric
Luxury SUV
Sedan
Off-Road
Truck
Luxury Sedan
\.


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart ("customer_ID", "car_ID", quantity) FROM stdin;
93	6	8
62	5	9
99	9	0
83	3	2
87	11	1
87	3	10
42	4	2
93	7	5
99	5	9
95	7	6
36	4	8
24	8	5
93	11	5
86	8	0
79	12	5
61	4	6
86	3	0
94	5	5
95	8	2
48	4	3
94	11	2
48	3	1
91	8	1
61	12	8
83	6	7
98	12	5
47	11	2
61	6	3
37	9	6
42	1	6
47	7	10
94	9	0
99	1	4
91	9	8
62	6	10
83	9	5
14	1	10
86	5	6
46	5	10
46	1	4
98	6	7
62	7	1
37	3	3
42	8	8
24	12	1
79	6	0
14	4	7
62	1	0
46	7	6
1	4	3
1	3	24
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id) FROM stdin;
1
14
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
439
441
449
450
452
\.


--
-- Data for Name: federated_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_credentials (id, user_id, provider, subject) FROM stdin;
1	450	facebook	1587045301832696
2	452	https://accounts.google.com	116287136621512967237
\.


--
-- Data for Name: fix_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_detail (date, detail, price, fixdetail_id, fixrecord_id, ap_id, mec_id, "Status", quantity) FROM stdin;
2024-01-24	hello	150	10	12	14	18	Ok	15
2024-01-24	dsf	144	11	12	157	18	Ok	12
2024-01-24	sdf	130	12	12	18	18	Ok	5
2024-01-24	dsfdsf	10	13	12	14	18	Ok	1
2024-01-24	34dsfdsf	80	14	13	16	18	Ok	1
2024-01-24	dsfsd	420	15	13	20	18	Ok	12
2024-01-24	Ok	18	16	14	19	18	Ok	2
2024-01-24	ok	9	17	14	19	18	Ok	1
2024-01-24	ok	9	18	14	19	18	Ok	1
\.


--
-- Data for Name: fix_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_record (fixrecord_id, car_plate, date, total_price, status, pay) FROM stdin;
12	68X-12345	2024-01-24	434	Done	t
13	54K-12345	2024-01-24	500	Done	f
14	68K-12345	2024-01-24	36	Done	t
\.


--
-- Data for Name: fixed_car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fixed_car (car_plate, id) FROM stdin;
63A1-88888	402
68C1-87888	404
68A1-87898	405
73A7-22356	406
18D3-23565	1
68X-12345	450
54K-12345	1
68K-12345	1
\.


--
-- Data for Name: mechanic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mechanic (id) FROM stdin;
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
453
\.


--
-- Data for Name: sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_detail (salerecord_id, car_id, quantity) FROM stdin;
319	4	1
320	6	3
321	5	1
318	3	1
\.


--
-- Data for Name: sale_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_record (salerecord_id, cus_id, date, total_price) FROM stdin;
319	1	2024-01-24	35000
320	1	2024-01-24	69000
321	1	2024-01-25	45000
318	450	2024-01-24	30000
\.


--
-- Data for Name: sales_assistant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_assistant (id) FROM stdin;
12
21
27
29
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
-- Data for Name: storage_manager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_manager (id) FROM stdin;
3
4
5
13
22
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
-- Data for Name: user-session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user-session" (sid, sess, expire) FROM stdin;
-7-UexiHR40W606Z_6ZApJkS5hSrIyEO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:12:33
umkn__6Ohk4U4_KskBJ-U48JYC7W9LE2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:12:33
IqnWCo4AahhUbwJjxT82eV36Glq3vVC8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:14:36
RzkFtMvePC2lZWMiy0pDsdqnC-4FtPX-	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
b-h9h6jqQdYy29m6pfej4qvKYPa1Wi7U	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
Swg8UPyKgHzHags8v-V_lAnzSlmAKNRr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
ehaLjqgLpvhvLZYV_bKVh5fAw4KKgFRa	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":4,"permission":"sa","nameOfUser":"Diêm Cát Linh"}},"flash":{}}	2024-01-25 00:47:59
gDPdvg1FMZvA9fOWbrKnFQ07wzagdFSA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":4,"permission":"sa","nameOfUser":"Diêm Cát Linh"}},"flash":{}}	2024-01-25 01:36:01
WkLXIXaI5R__yx9zkDuqhs7wFDeVLWN9	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":5,"permission":"ad","nameOfUser":"Bành Bích Ngân"}},"flash":{}}	2024-01-26 14:35:00
ISeharPYcUEqzrKJPcL__OiTS8_pOGVQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:00
usBMNyLJt61GMLbZABYxPayHBXYNXm42	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:00
QoAbgxHMq7F3xTndYUrACT1alJsytdYT	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:10
ZQaweHfUATitpI0k5vzKhl9LTYJPhLaS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:10
ksEN6sq60Vge7djGS07OjUBupGhkLSjP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:10
d_MEBxGE75OagD0_mONDZwX5j7e30BOK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:10
8UeW_xrtMaZa4SiJicu5AWBkvxesFnNa	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:20
HwTBO0yIjFsn5vHc4Lvt1hpbo677wplh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:20
dBtBK_T2CStSnCeFdEZ9G9LWrC5m_hYq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:20
05iwjBLmi04a11si5WJACmXA70WXWmJN	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:20
o1CUdXzrEpVu5hn9QohuyDANvno97E4e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:21
JJq9EZPTr83-lcTagMZTOEVULwj5W-uF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:21
EqBczuG1TxFJ2ZGOEKssPDD2I4IKSC9X	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:21
NMt3JfQO9986ljH3BByvZ0-UW2s-ycTC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:24
kl0hTnp92pDyeFXr-aF_ZqJWRp8plrwN	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:24
vGbIdL0-F-C6jOyW250Q_3y4P2vchZ8z	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:24
8ZlUyWvB6nXXtPImbCRLfn81l5ebUn5x	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
I1GEP6Yasev9ovolJQ1amCvS56sQC7s9	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
ywD_zEMgDFwAdXy6tdPJsg7EUueKdf9q	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
MM4uOsF0Ls6Dapet6jT7hj1cSNIDYLlP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
G2IE6Az0o-zxcTks9dSfYLKGbQ6rROcJ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
E1u6PO42DuX9SBJ5vRbPqBKSUygtTUnA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
TENfGlwel2mA-Vpf6BcvDaXEIK2C49mo	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
mdItdTA7UACGhm8Y-qILRDLGMhJIP2i1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:26
nyhghY43kWaZoZGj-Y2k8Bma5vLMfs79	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
VcGtqqITPEZwsjNAf5_TsmQH68aRSsic	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
ahNPNnCPPk5ALG-LMJWRkLsadf9dhov-	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
X_Hk0lfhOjzrUayVLq8ucLqtUB5ZDleS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
xwwPcfUOdUp3yri2VUDi4ONMTz3ptbBq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
vBTrepyCkU9IFRzR6wSErjAY9jIgzaO0	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:29
YcNvTsWlirywNfN05rW8bBznLibhs3rP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:30
jsB8u_kX4vgcvJJ3T1XnIkqyne4zL3lk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:30
7xVuTUolRw_FHp-gt69eDT0EOwzeobz4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:31
MyspR39c2URrll19CKgnE0kiQOtLWBLG	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:31
H3vDz5DjrFSVSA42guTK31TOIw2_C6BX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:31
9oZCvhwvBoQQHap3M6YK41u3LxG92m4t	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:31
Ys78YnGbL2orXakhh6YoWsRzGR-_okfW	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:32
5KVYkvhY6fmXDpgVMzBBn0BruqtcAtiD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:32
tQDDcqvCrTqAYjLkCjDjQhov65HHpq2O	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:32
xXy-8j_Rhfgz_re3FgC6rcWSp58aUnqo	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:32
72PFLn63CPpw8b2uncnb-kxsLyRKBo_U	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
OFW4S1YRR8WWyLP91Q2xpEgXSLzrai30	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
i33rEk4iyMtNrwAcp6QUbMGgYOi2AOxo	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
MeY6GKHPc1ETuL40uz1b89juQbcbJuTD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
TR-o8jeIwsmKDx-v1-TjLqSvJ5m7rDL3	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
6RPLSIdThBp2BYnulwOIak5OMQU1PZWP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:33
5UNHM-BU9K2QqSAuxdiE4RhSgJ9K_I25	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:34
AvRli84c78FxKAXMufkS7rT73IdfoWrc	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:34
26R7WbEFtu-LqeCXUXSWn8vPQq4BpYiQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:34
1RQ9AhvPaS5PEDOIIi2VkJgbXae61SJT	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:34
uL7gZ7jnlW46I4cm5dt0ogWRMpxe8A8Y	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
9Gt1PBYZ1MBvlcWNjzINrBIXVId8YbdQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
_wMkApSMMoHe8J3A4Fs27U4e3BcIy5Sj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
fYI6fsiwLXidRF1Q38yCClznELs9Y8hV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
AIaeD59dCrgzJAeBSxDqD7QWKQw_kboQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
C_hDYs1IHphkKMtR8PDAk24Uz8fpOPfp	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:35
0ZG-OTvQlZGnovcNa2AgjNe824tzNupR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:37
XytTSpB_c4rqbOBuHmfA6ybCNgfEXQQU	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:37
xoSBLhrnPgjoDbCex6C0r9bqaAKSM-QK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:39
L45gZEAO0QAoj4c5rgVc77IcmH0Kh_1O	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:39
KYNLOCpi_wDTKl4gunZgxk_8SGoVaoie	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:39
Gg4sq-iN11uNbsGqnB0pshGIfz4iUJAi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:39
lOjsr-uVV94am5G8JGYpvabXEZxz2v1B	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
BXlL0_v34M9IzAWLUwDdfzprGY_PIm7d	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
FUbmRivosKYs6E2b364EsYtuER9_3F75	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
u2rIIemkVIpDJlkEqCkt8O2aupS4PcU6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
NG-zq2A9Uy10AUhEASwB1ZY9LHmk9ZNK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
RiSo91DuVVDJQi13dah8axqmXeH4slqi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
QdmhcTIPpkmpIaO7bl7ONGs_GX89BAuM	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
Wc2pS1Z9K6PZiHMEeSdqm0ItgQjgKvy-	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:40
56XygRTnlnBMweP8iYmEWR7JYFfuxi5m	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
pkpCY6Dvxwoa585CEBUG0rQnn2mjQe9a	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
z-vRbz13AsTAW3u2uRb0rp8BW5lXZiS0	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
XQsE3b0B8XBF9JB-xCeQRNeHIJpKJDPf	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
2jOHFkxrNuM5WPXve17pLXc0RMiqbSFe	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
kU8iYL_JaY4usf9Hg6wN3OCf4PVxSvvM	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
BxjEn14K3mjDyAShqNAE3XqqTuSJ_pxy	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
3X38RJ8n2eol0Kjcjmg-Low75oYcEp45	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
gUqO8LkDEheoxxyWWFPiPTQOxnpEueeO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
2PtZlh2NkvFaktIjU-beGTRmEuv3FPSl	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
V0QA9XuXjrEZvzRA1A2_YOWLNMf2g425	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
qMqH95JhMlHLz00-PTT0H5q7xM5qgNAR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:41
lG58C_ALONkq85FB9TJv4G6u8X2GAEur	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
fFjL8GiJn1R2Tw2LFlkh0BQ1kQmRLYHn	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
unFVGnBDuhsJM5ztFS4iCjlbroSJNnzi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
XFuM03oMAdKpnIC06kdobrRgCg8bw2TM	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
DNcSe6Q7VTREYpJsxq1kHOeMskQ1xLii	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
gsUfc1uX3lp7HFu1YnPEeTb2LajtqGzf	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
DP06nL7CKB9owsyLUrjH-eMSCpzAUelX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
kklZ0cnaY7gYJyePbOGdkrnkNrJ_8_7m	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
1KNHODktHDgO4735gT4gEQKX4DGwLd_1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
kBNKPVIlkfzu6ApCwMnplSI-MEwWY-px	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:42
UEWpw9mZI7n-bwoyLFwFA4PUVWfbLjD0	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:44
yPP4zPqYYllUXiIa6u_PtCCfLgQ8hiBJ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:44
KNNnIHRE2GrYWpptL_xCAtnUlrhTHvJz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
gYgTNxAEBXQDP1jRtFqb4XM6so-9VUSh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
h4ey2eRMRn2Awl1ghjSFdef43HpJmE26	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
PNnArP-DzH1hwKMdn3uxwaPJ1Didany4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
ygrd-ehMkvYRnrp1GqQwh9bJ-L7JTOH6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
P721aJa5d6i7nggSaRZhe8AXlGBIUV13	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
lUYByyHk61TXLj0zZYlOWX2ybjoslOT8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
T2nCWOz1jmxL_1QyqdtatB0ooVS5cJMw	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:45
1Xhi429iylaRo_XhPwy37yyUzp7FnciI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
FZuHRrieY_tMiBPmul7BxnCJIthTrpXj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
zQaQLiPkVck5LIvnXCBvIJMh71y8gmz6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
TOd9GnnOFe_8RP6MIewx_3TSUBGSBd7z	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
2AlvoGuTn5sCKm957-pEyhte6F3CwTpc	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
gWnHALZ4k2rmoh9XlzsGGqQ1EeKu0RWJ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:46
Cm7uKGh_c5iEc3XhU74jfiEDo6vuMQmA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:48
c8X9D8qa-Av7jfmkdIf3KgmHXn3julNd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:48
7HmfBpsgQL5fd6FY1Z9AWBzUIXf13cRr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:50
N3O7ySt-1Oflv5hv5vcz2H17aDK0DDb1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:50
Rca3yfsZbO6XKD4nz2AWekiriALRbZp_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:51
O9i_SYvDTI8EMy1aJLaoie5ulGvW2y11	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:51
8RN1mTQsfqRNnu1JqC-0tlin11fehKIB	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:53
o0qTk4XK4---U2IDAIvIJkfO094z90um	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:53
O7AErWVum-3GgXe5ekj7j0vX1L5hrx35	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:55
Wk2rfeL1L0N-aR3pJ-jgKTzu-WaNrB7w	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:55
1H0CyFh_4G7-dAssQraagKS5mQ1DoVvD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:56
1AYSUc-9y1eYkrz1eUa3M_MZ70qWcAgL	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:56
T-1E2j2SpSqOXqq_yuuCLHvfUeC7x3nz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:57
Z5dyJwcbVTavMxyXseh4bym-dakvx3OB	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:57
-M9ZcaAtWyO1ay-PV3Dexx5DEntL__X8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:58
znNVJ3gZz1ffEBcSYenZzs0eLWK-y70r	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:58
5dgzCM5OZRmX06BJIFsbrbi1g487SMUs	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:58
TK7lAaXniZuJKnGgf7R2vFqfhNmpK2BU	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:58
TLHzjnYFOzUTn2zHEgH627dLEYlUCbpt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:59
rNccry0_sPpzcRXEh6bq9HRzSSBsglB5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:35:59
4TYTQBn0IDfEcok7_BfWPG7ELwNzxbc1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:00
fmmEYW4bWoXaoNXFkcIEo83zIIwgfCfh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:00
Tdxxpr1Zt4sS35yBa1WRq90SDN6npDYa	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:01
j-xuPYTtkWeW8hXfsuTo6sMLokBurLKO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:01
YaD_Szfpp7Y8uPFw05AHdOzzdCpe8Rmy	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:02
t80Nq0TxbhOwnwDe9qNvolpX_z09NvnY	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:02
1iOiZe_kt12Gfh5BG_J-eDLW2I-3NeVf	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:03
zajQ_DIGuh_-1Q7-_KLGCf0R_h4SYmjA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:03
Ap2IS3wWjG8ehKNYNQGGr0iT95xf_yEz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:04
Sq87Lon-Otd5hqOc7cuHYNIhr0T_eZ6S	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:04
LJjq1cZPXso7SKNyMRw8q7Ptr535qN-4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:05
d5ZEefy4gXBa28pC8StwPBdI4O7pStBE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:05
Q0cHkIfjT6cCuLCnIxOZegq5cRrR3MTA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:06
kwOCbZP0eOLFxUsVGD3Inv24v6uTqkIK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:06
RtzVKBujW2f2yX4O371XQ4NOuJN0WDqB	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:07
9pdyePwxz42Qemfh3zZCpC7PH2C549Rz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:07
-osw_0Td8Zy05bwiMKdXLG0Re4aZx1Uq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:12
EimLgIIEMZ92Srq0ZgttoTfACANKMrJx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:12
YR1QTBk2fXB7rwducCgx6bLBBT_6Hvsa	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:24
YIvYIu5qw-2r1FV2aYKF9EF6LSSbup1I	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:24
0GKfMGJop__1h8_JpnaGlqGitenJbqZi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:26
Fz1Fo5crzGVWBHKwJhFRL1J6D4uWCJAx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:33
CiYrnmNPowGwCO0quaKHAfodiEc79BSk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:33
SLlJmicQY3yfjozGVS6E0E6VSTe4fJ3q	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:36
H_mxqlmv3W1f--lYIAMEonfWol6XF1hY	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:36
ThxkaMSmOK9uP1STuO1I8iEgvzLCU-nO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:50
iFetGSilsfeTyv33HR4zFKgF9Lt_tSnG	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:36:50
A2OVEaOesxSuIqxs3IPBrQ20uqVbYMNd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:37:30
9j4NAGeLuEzf3fLroCIhMzWpFXrUCfHm	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:37:30
Gx_pJQNpfvLHEDsJw98IZIDV3vUnDxbX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:57
jiTvQ4ayZ_7GxzTDC34sB9pVfR1QIsfv	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:57
HS5en6cjRvvLXlS9qboE1tDBGLuV7ZFN	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:57
9nbGY9ssQj_mjUJOFg_FXP0Yq5M-MjAd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:57
IuXOZhSCEsJMjIdLXg7S8iT1ulBi4Mca	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:59
ywkbNqCun7jma1BJ1hAhDM_adfjXcMFV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:59
PS6xIy7_OJQ4hW381ohFkv1gajkx2dOq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:38:59
Ek7_9LIdKtWqlVsQ64NiHLWP38GeC7kF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:00
MoO3r5DWU8fNZYWMDxZDnEPBQp3_vj5L	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:07
PPDowRupBenf9KgBrRxZzZgkDXs5kqES	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:07
tSWb2v7mnOeKhlou-buwnZxag1Pr6W86	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:11
2LtYfD2HMKyQ72_Iq55mCQBTZIW23R-j	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:11
LF-OdyQrK-CdU_-A_v5k3zNc4xzNZCFS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:16
Z7joEvHuleLypF9UjNtUpVU8Q69kZV7O	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:16
6W61kwdw4yAqLxnY2c-Nqj9zzQ8Eiy3t	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:24
V9SzRbnVR9V1ca5K6G9XkX54eSqiK2Pj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:24
MMcP58kML9cjOvcgIm8C1WLXUdSastvk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:26
KTMuPTWkiN1-NqPute23EyuQ4JvDn06L	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:26
P4tdDpPlrXQjaA_13VrsLN1GQhBWCnKc	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:27
hoCJ3bDGhwlOnMNKVMchpXLjuJrdOoEx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:27
HHWGpUAcqds7s7ey5gTCNSm4uVe14XW1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:27
PP8xRZkZt26Rbumv13fG-V40JPgKsX84	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:27
DUw_S7lad1qcDhWTJfUTXkk01APi2xnK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:28
cvvBk8FkMRbVZWtgCoSL-3NaMmQw5PgX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:28
g1PUj2T05VgZaYkCXU4Osc8DFzrNQRAU	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:29
RnNbiSauv6z97-Lh81OPst2bOeD2z2pk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:29
ECGN1tRBwwcZP-ENMPadRo0Qokfm1YSj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:30
7J1UD1VB7NLxxI81OK0Gs9mBbWFcT3hI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:30
84BdzBcdmPhiTAPwmISY9yfAJAYfICHF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:30
TaQ-fsCBNGn5Ub3gPUkpcKU64iVjt9or	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:30
uOlA6t7oOzGcue8RyEn7Ecyw45Vzbo2T	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:31
KDMGvGNUFO1vwyGCp5tF7vXgEDTHDLoh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:31
5tWFqMIvEzLHE5gGYI00Gij2jeMLM_NA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:31
BIEpqw86N9p718Fl1CHCBPRAKvP7dYow	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:31
Vfgnz0UqHBo9I6Lf448d4MKOAApDDtF2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
iy4vdhTeeSJGolcHf1quJbVzBOZOKIIl	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
zau3TurN8P8yows3ekwzHy4VcvTMiMYW	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
FTWsTWBlGY7j2YT1vYHwdc4vaN8oAFli	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
x7l-KWL-Q1PLSLRw6DVWvjS3mvluj61u	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
TpGVsztvlFENLkfnYpsfqKQONz_Dyk8g	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:32
AzzD5w6lJC81_3GtT52HwO7fn6cFqRZb	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:33
4EbNlcYIfPInmSfDqcrvdMdUQwN_iZLy	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:33
QkGDy9WEOEnjv4U0Cre_3awl4b6mcPqH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:33
Gv77xH18JDyOhQ4bmWpb6HqLZme88yUC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:33
5aMTQ9i-6DMGjD7BDKCDHlCLkO8BdhKH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:38
B5mdGvFsp-erZS040gOr3-9I7-i2Fk_I	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:38
xRhB-x4rDzOUzw1Sghh5U226lUsRSMVK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:41
vuS5kWEEeXLoN3eqR3WS917I3AYhaTyh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:41
tFDxit_8rkX2KWaZ6gGq5awGHfnCpfKE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:41
oh8-Mz24sE8Gs2912lgH64_RFa7mIABw	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:41
i6CTDf8_UfS3Ly74PzzE3Wzdwkl7VAG9	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:41
bzOf9tVklAulJ_hzdNDpe_9BClivFEti	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:42
ildh_LM1itFlofa2wGk6pTpITsqOT9oj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:42
sVzlrMZkVb1eLyqwMEpMKP9PVa-mjg3V	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-26 14:39:42
6GTVEieyTp3ICj-PNVaIiU___3wq3Glz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":4,"permission":"sa","nameOfUser":"Diêm Cát Linh"}},"flash":{}}	2024-01-25 04:32:49
n_RbwWTKRI8qzs1O2DeoljLlOH-nBuq6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":4,"permission":"sa","nameOfUser":"Diêm Cát Linh"}},"flash":{}}	2024-01-25 14:11:17
OTdNjvhRuqTr5Yjhx2NKQAidxg_Fl9lc	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:11:35
0QDSXj3Rh-GiaI9SF0aR35mzsYLXgBZC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:13:39
HhaPmeJ19Cb-MIGrKn9DIiaSPK4DViX1	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:13:39
zwJGBBq6QMAtogzY3Us0FqPqfHxW2FFF	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:14:36
Dp01owA1uGd2opNGMd4drxoqXreUMjLq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
wurzqbfbBj-tjeECF-UL9p3KMrtg1e2M	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
RZZRiNupXGDl2JGVE9ZbWUOgr3ijfMuD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
G_0OCAvQiXUrh3jD_LrEhX1v1_J_Cod2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
rw0Bmr6BtOlozPncQ5S9zwFJB3oYC55m	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
CT0JjQv4NTx-JdbDy68z4GeoCt8qRLgq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:01
uWqp1w1kjde77D_y8CeScuNEECeIGXKe	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
e-A5uw_UUNnS9B4T6WGlWyxAJHtDLxMj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
_nsl3ahVIse7oxUruzjwo79liixJD3jv	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:03
6MyvLtjCem7JTB-QBDr3GWjDmShp72Hx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:03
9FaBs0LUM4olMIOvH-HOfvG8ySSSkznx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:06
ia_Zlds5HDJpLdJGhFei23ScLhyYY1oQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
cYH09aywF0-hNotRbalHo5ZZCDiR_uKW	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
d52w_41ieWKj-2LrcD0Z3sIqaNr6nsHj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
7u4D_74yxxb7MizhJlGp38cZnoAG9Gaj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
lN0gS6Ny0ZIxCJQ67C2jTMK3K0JqMWt9	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
rCsXONsLG8OiEqXpHk_qGq5e0bTGw_Dt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:02
UYt8K1wRigH_7aBu6qElqK8E3-JTV3Uk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
D1dLSSvgGJm69nPRzpWw8pcHT0tJnqzt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
sQbllwLZ05hJP8F6hszmiH86_bGBQ1oC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
o7cJxDLM68jnB9rgD4VWmHpRd6KMMTKQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
NCkAf173nbni5rBEm1A1XdYY8FQQJExQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
j5YVvQplyfQ5Kp3GulkDNazk1qf-_Tc8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
C3MAlAcNoqhFlmF_F3mxYYF_O0RgQ-zC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
akqaWngL4ehrScxekwZwxs7GtIHr9Wcs	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:03
IMib8AbecswhDSHH-CGFluorqODQbORt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:06
hOyqnumkXLbAMT7rUK5K3dz7MgX9lGO6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:06
_6081kX_BHsV-ntXJ8q3O9vbDlYnxkSq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:08
EEzNo_SLi3O6NpOpP_gGyVwce3afangI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:08
e7FWRGZPQQZL-_0oS0K5KEAoTRUcvgCs	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:08
7hlXUsStTKcQsATTYRMIigZaTxKf_6Mk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:08
_1iNLEDEPBcoagZBazw1uCQhA81A5Yrg	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:09
HBWJPVKGYSH7U1Nh1WTZ93cnV-EQB71C	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:09
2mDW-CeKhcHIsGyUJ78JT5JsmNqjgPAR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:09
7d6hGrFkuhn_7h2k9-JsDyM2AZR5B-0j	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:09
VR0NCjisg-bko9MooYk2OSGlOowthc8e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:10
eVlW__0ciuMH9PpgOE3POXJu3TLp9lPD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:10
MmcOgeyTK4FTK0kPD3iJ2VBLCVPciOL4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
GMxOWA0l80tP66Fxlhr2Anuq8uCKZAnT	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
5rDcfWIew_zQKt7F9TIUkL7j3sgKHyT6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
MbgICfcdq305pyl-VAelYfqECt496FPd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
nwoL21Q4ob3vpXaptmEtWQ6hpixf_TNl	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
XkEquj0tO8H5RRY9OxKBSQFw536kjS1s	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
wQ2ocV0z2K8WI3Q9EdY1C2cHMWX2_SaI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
GXt02YIhkTg-Sm3QMXokU2mJNZjT6gAr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
tMzcMwCXnvaBKuB8t_647x3A-QYbOfIB	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
EuoCgViTbus5b3r4MqADTqXztggJtVvg	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:11
d18pa4dpR3a5Hc65MnVBusXBTK6bM-31	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:15
ntB7_mLQ2K2ICLpRnzKu75qeeNc_ZAV7	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:15
kKvTBPYxPEJJ6FVozbOHx1-BRCp5b_vZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:25
PMQvBIOhNClP2fPYEnIvQ34n3xJh_3iV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:25
ampqrtNerC64swT_FksNNLxjC5X4nLVi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
r9P1wp-27WnX5CkdgKfPEF_yFIjJdNAZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
U_uGOeppQExnhm_Pg0m7AabfhEi-RLgR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
p7lCFkaLrGTqJ-XckdA2ls_CfrM9Rd3s	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
ALb6c_wHA-15EPEtPQrAMSS9YtRpfBYK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
MzKHh5aBOb9OtEZEuZAr2JbZuG_clJ2i	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:46
GmMIQgW8ajFDWGvhC474h3uHRJ5nRyaP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:49
mintmZmZ6HsBEZXNtbpzJJHU1fLKyq9e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:51
qRI0gPJIdFp6W48umEUr0KsaVAc5yd7W	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:51
FzJezvo6jAZT8AM8Zz2UtD0PSGfI4b1O	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:53
dVwNKWmRiApdsBnQ7rGib8f8Y32D500_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:53
dsYjoVwzJH7ENSsc3p6BFLs4u3yvACd4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:53
wYRqBUVsJwz3P6b9IkEH-lZQnq45NNdi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:53
1bJ4tA75n307jSKZkctEjA9GHh28AFyQ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:54
JHngwBKUcqt_2yldrag5o5Ggh9jBO3WM	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:54
2OwFfz2GvLhMYwhxuwdPNCpo3HXL66Ck	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
ixIv06WGHn70OXsu4AkB9jbPnkcLHoxH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
3P2vEvRE7puzcDPajFt4hiyEwH3hgOhb	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
_YCF8iWq4q3ZGVcOV00lxzsnL4m-G42-	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
552cSrkU1oQfoX2Fr8VTbIu7HnZUJgbs	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
8SqNYymBbDaSvehofUgrfWj32x4_Go_K	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:58
24xHE_bJFMCwwn1UY6OvAN2MpaaimJ9R	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:59
-FZRaoZlGpZ8LtxBOA_Z_q2Sl7qEJulC	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:59
aw2wAUfgNPksmSso-9oR3Vs337LLgiI0	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:59
W1dS3NGDZiNgGlea7tuSisWs3tOzk49e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 14:15:59
lBonXrGqCWAXYqBOVkuVONiDvPnkAuEr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":5,"permission":"ad","nameOfUser":"Bành Bích Ngân"}},"flash":{}}	2024-01-25 15:01:44
7AnQj-6dMFPeSweRgGRzuQmQwIEuJ-FY	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:44
0FQRjzcXyg8zFIn2Kayp5e67CHoiwPNr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:44
JSTAoHCBaTs071JCUzAuFD8XHDSDmXpp	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
GwUzfR5zmGtx4_9pvnD22vQW4JlK66LP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
Hcqd9f-LayMBkuPkPELarySRl2yGttWi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
cqNoSlOCKzqQ6QfVmq7weshnXxfZG6Jq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
rfk9nV5fPZ35wP7aSfyJk5IUFsmOfJZE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
oyhGF5VxDltZUN2CDXfugtwxijObjW2Z	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:52
VhXbk9zPEIqujuBcUtfsup-6saKajSgX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:01:53
qjX5NEI2h1s50vLbjNq0WsWY7gE9qZi7	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:06
J6MtZOfhDvjq5OYqA195uSg3MfBtFKfP	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:07
qNN4dagu_yHEheTxEdELl7j1yZeLQpI4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:07
hWa8tJMIgrGz1zASUfZmLSeYvZTOTe77	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:09
vAd6U3f7V1BPAx_Eqb6UBked4XEfEaC2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:09
QPUqfyY7RC7n4LcH3O6MfbJ8PeSsjav-	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:10
Iw3CX20CUxfc8m2dUMEcA_yeVHVIWasZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:10
mcKCefsg0XAtbQLInsScrjAaG5LWnrg8	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:17
3RBNLcTCJcFtYdYUnrhn82RPqLDcH2Gy	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:17
eyAJ-uoUaxRmL6W8CJ464KbkywXhSkwk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
JKHiQUWKN3k9YCJIga1xqo6HDhg4auwV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
pGGeWeWvgy2nj9VN1f7zW_FdJtc1ldCr	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
1hde30cHtwEVmDHNFiOSGiS0R0tMmDzc	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
aXzSYhQJ1_fnZTuG2E4VAY0rrDjH_R2_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
8ecOK4YVlpxkwWwREhw477y1QzdbUkMi	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:52
fzEu6lrFii6gGm7tVWGXa1vNVF16Wmt5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:57
K2x0dP9r5Fshwy081iE_Pwd5j_S0JTIX	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:57
IvL017REd-vyk_Y2WDx9s5IBNTte6VEl	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:57
-nj0bph1uSFsJlWwN2wUxCKxcw6InBo5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:57
O3gKj7pWNHqN2C504ofcWYIdFRviYemu	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:58
D_HNFVGYEMQtbML-0biC61hVo9VoqM3A	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:58
TwXlHs2dtXU5ENUNf6LXsOUDxjIfMjKV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:58
6dzkfeu8cmW9OgYz_lfJjX0ljTPes3-H	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:58
tLDFoxTlHnxiUzhliJ-HDFweNAwXDR3b	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:59
eHnj3xc0ivcWiARQ5yhrStAY_CJUDDof	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:59
W0Zmfq_73kUka4R0C9B7fDvgYRqgaSYa	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:59
TFmliSoPkYKIkb1k1jdvnNeQjeYlvGDq	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:02:59
wb1tNhCO-NvLIMvMY5EDYtY1rqa4Panm	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:03:00
kq7p9F9RAH-oC0TB0FVtO2iElwVGcCwU	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:03:00
rK1DtPNtmaqTvUqdoIz6TwPzE42CPaH_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:03:02
FhoLAN9HryXEt-mh9aR6bnr9w9IQgnx7	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:03:02
MlkqklSBDWYGegjrtOQEBMzulr0Wv2M_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:32:41
dHEBFLFej-uGgZW3bE7BqDhflyTDl03D	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:32:42
N2sAgK5A4EA9HxG9V3yGH2AIALX_zlWh	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:32:42
F0hyfB8O3sT3n-ApIFjS207zASVwkoPO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-25 15:32:42
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_info (username, password, permission, id, firstname, phonenumber, dob, address, lastname) FROM stdin;
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
mechanic	mechanic	mec	18	Bạch Mai	37738	2024-01-06	Bà Rịa - Vũng Tàu	Cao
jennifer_lopez		sa	12	An Bình	628322	2024-01-05	Cần Thơ	Phó
ruby_red		sm	13			2023-12-04		
emily_blunt		cus	14			2023-11-27		
khachhang	khachhang	cus	1	Bích Huệ	0043928	2023-12-20	Cao Bằng	Hồng
storemanager	storemanager	sm	3	An Nhiên	88462	2023-12-20	Quảng Trị	Cung
saleassistant	saleassistant	sa	4	Cát Linh	21410550	2023-12-29	Hải Dương	Diêm
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
\N	\N	cus	439	Nguyễn Phạm Phú Xuân	\N	\N	\N	\N
z	z	ad	440	\N	\N	\N	\N	\N
sdf	sdf	cus	441	sdf	sdf	2024-01-23	sdf	
234	234	cus	449	234	234	2024-01-23	234	
\N	\N	cus	450	Nguyễn Phạm Phú Xuân	\N	\N	\N	\N
admin	admin	ad	5	Bích Ngân	9\r\n66	2023-12-01	Điện Biên	Bành
\N	\N	cus	452	Xuân Nguyễn	\N	\N	\N	\N
xuannguyen	xuannguyen	mec	453	xuan	01224545	2024-01-02	HCM	nguyen
\.


--
-- Name: ap_import_invoice_importinvoice_id2_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ap_import_invoice_importinvoice_id2_seq', 406, true);


--
-- Name: auto_part_ap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auto_part_ap_id_seq', 158, true);


--
-- Name: car_car_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_car_id_seq', 38, true);


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_import_invoice_importinvoice_id_seq', 415, true);


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.federated_credentials_id_seq', 2, true);


--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fix_detail_fixdetail_id_seq', 18, true);


--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fix_record_fixrecord_id_seq', 14, true);


--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_record_salerecord_id_seq', 321, true);


--
-- Name: user_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_info_id_seq', 453, true);


--
-- Name: car_brand car_brand_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_brand
    ADD CONSTRAINT car_brand_pkey PRIMARY KEY (brand);


--
-- Name: car_type car_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_type
    ADD CONSTRAINT car_type_pkey PRIMARY KEY (type);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY ("customer_ID", "car_ID");


--
-- Name: customer customer_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: federated_credentials federated_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_pkey PRIMARY KEY (id);


--
-- Name: federated_credentials federated_credentials_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_user_id_key UNIQUE (user_id);


--
-- Name: mechanic mechanic_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanic
    ADD CONSTRAINT mechanic_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: ap_import_invoice pk_ap_import_invoice; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_invoice
    ADD CONSTRAINT pk_ap_import_invoice PRIMARY KEY (importinvoice_id);


--
-- Name: ap_import_report pk_ap_import_report; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT pk_ap_import_report PRIMARY KEY (importinvoice_id, ap_id);


--
-- Name: auto_part pk_auto_part; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auto_part
    ADD CONSTRAINT pk_auto_part PRIMARY KEY (ap_id);


--
-- Name: car pk_car; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT pk_car PRIMARY KEY (id);


--
-- Name: car_import_invoice pk_car_import_invoice; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_invoice
    ADD CONSTRAINT pk_car_import_invoice PRIMARY KEY (importinvoice_id);


--
-- Name: car_import_report pk_car_import_report; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT pk_car_import_report PRIMARY KEY (importinvoice_id, car_id);


--
-- Name: fix_detail pk_fix_detail; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT pk_fix_detail PRIMARY KEY (fixdetail_id);


--
-- Name: fix_record pk_fix_record; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_record
    ADD CONSTRAINT pk_fix_record PRIMARY KEY (fixrecord_id);


--
-- Name: fixed_car pk_fixed_car; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_car
    ADD CONSTRAINT pk_fixed_car PRIMARY KEY (car_plate);


--
-- Name: sale_detail pk_sale_detail; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT pk_sale_detail PRIMARY KEY (salerecord_id, car_id);


--
-- Name: sale_record pk_sale_record; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_record
    ADD CONSTRAINT pk_sale_record PRIMARY KEY (salerecord_id);


--
-- Name: user-session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user-session"
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: storage_manager storage_manager_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.storage_manager
    ADD CONSTRAINT storage_manager_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: user_info user_info_id_id1_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_id_id1_key UNIQUE (id) INCLUDE (id);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (id);


--
-- Name: user_info user_info_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_username_key UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public."user-session" USING btree (expire);


--
-- Name: ap_import_invoice_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ap_import_invoice_pk ON public.ap_import_invoice USING btree (importinvoice_id);


--
-- Name: car_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX car_pk ON public.car USING btree (id);


--
-- Name: fix_detail_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fix_detail_pk ON public.fix_detail USING btree (fixdetail_id);


--
-- Name: fix_record_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fix_record_pk ON public.fix_record USING btree (fixrecord_id);


--
-- Name: fixed_car_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX fixed_car_pk ON public.fixed_car USING btree (car_plate);


--
-- Name: import_invoice_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX import_invoice_pk ON public.car_import_invoice USING btree (importinvoice_id);


--
-- Name: relationship_12_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_12_fk ON public.ap_import_report USING btree (importinvoice_id);


--
-- Name: relationship_12_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX relationship_12_pk ON public.ap_import_report USING btree (importinvoice_id, ap_id);


--
-- Name: relationship_13_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_13_fk ON public.car_import_report USING btree (importinvoice_id);


--
-- Name: relationship_13_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX relationship_13_pk ON public.car_import_report USING btree (importinvoice_id, car_id);


--
-- Name: relationship_19_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_19_fk ON public.ap_import_report USING btree (ap_id);


--
-- Name: relationship_20_fk2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_20_fk2 ON public.car_import_report USING btree (car_id);


--
-- Name: relationship_6_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_6_fk ON public.fix_detail USING btree (fixrecord_id);


--
-- Name: relationship_8_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX relationship_8_fk ON public.fix_record USING btree (car_plate);


--
-- Name: sale_detail2_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sale_detail2_fk ON public.sale_detail USING btree (car_id);


--
-- Name: sale_detail_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sale_detail_pk ON public.sale_detail USING btree (salerecord_id, car_id);


--
-- Name: sale_record_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX sale_record_pk ON public.sale_record USING btree (salerecord_id);


--
-- Name: user_pk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_pk ON public.user_info USING btree (username, password, id);


--
-- Name: ap_import_report calculate_ap_import_price; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_ap_import_price AFTER INSERT ON public.ap_import_report FOR EACH ROW EXECUTE FUNCTION public.calculate_ap_import_total_price();


--
-- Name: car_import_report calculate_car_import_price; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_car_import_price AFTER INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.calculate_car_import_total_price();


--
-- Name: sale_detail calculate_sale_record_total_price_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_sale_record_total_price_trigger AFTER INSERT OR UPDATE ON public.sale_detail FOR EACH ROW EXECUTE FUNCTION public.calculate_sale_record_total_price();


--
-- Name: car_import_report check_car_quantity_on_import_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER check_car_quantity_on_import_trigger BEFORE INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.check_car_quantity_on_import();


--
-- Name: fix_detail update_ap_quantity_on_fix; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_ap_quantity_on_fix AFTER INSERT ON public.fix_detail FOR EACH ROW EXECUTE FUNCTION public.update_ap_quantity_on_fix();


--
-- Name: car_import_report update_car_quantity_on_import; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_car_quantity_on_import AFTER INSERT ON public.car_import_report FOR EACH ROW EXECUTE FUNCTION public.update_car_quantity_on_import();


--
-- Name: fix_detail update_fix_record_total_price_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_fix_record_total_price_trigger AFTER INSERT OR UPDATE ON public.fix_detail FOR EACH ROW EXECUTE FUNCTION public.update_fix_record_total_price();


--
-- Name: user_info user_delete_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER user_delete_trigger BEFORE DELETE ON public.user_info FOR EACH ROW EXECUTE FUNCTION public.delete_user();


--
-- Name: user_info user_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER user_insert_trigger AFTER INSERT ON public.user_info FOR EACH ROW EXECUTE FUNCTION public.role_distribute();


--
-- Name: ap_import_invoice ap_import_invoice_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_invoice
    ADD CONSTRAINT ap_import_invoice_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.storage_manager(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: ap_import_report ap_import_report_ap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT ap_import_report_ap_id_fkey FOREIGN KEY (ap_id) REFERENCES public.auto_part(ap_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: ap_import_report ap_import_report_importinvoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ap_import_report
    ADD CONSTRAINT ap_import_report_importinvoice_id_fkey FOREIGN KEY (importinvoice_id) REFERENCES public.ap_import_invoice(importinvoice_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_invoice car_import_invoice_sm_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_invoice
    ADD CONSTRAINT car_import_invoice_sm_id_fkey FOREIGN KEY (sm_id) REFERENCES public.storage_manager(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_report car_import_report_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT car_import_report_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car_import_report car_import_report_importinvoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_import_report
    ADD CONSTRAINT car_import_report_importinvoice_id_fkey FOREIGN KEY (importinvoice_id) REFERENCES public.car_import_invoice(importinvoice_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: cart cart_car_ID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "cart_car_ID_fkey" FOREIGN KEY ("car_ID") REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: cart cart_customer_ID_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT "cart_customer_ID_fkey" FOREIGN KEY ("customer_ID") REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: federated_credentials federated_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.federated_credentials
    ADD CONSTRAINT federated_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_info(id);


--
-- Name: fix_detail fix_detail_ap_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_ap_id_fkey FOREIGN KEY (ap_id) REFERENCES public.auto_part(ap_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_detail fix_detail_fixrecord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_fixrecord_id_fkey FOREIGN KEY (fixrecord_id) REFERENCES public.fix_record(fixrecord_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_detail fix_detail_mec_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_detail
    ADD CONSTRAINT fix_detail_mec_id_fkey FOREIGN KEY (mec_id) REFERENCES public.mechanic(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fix_record fix_record_car_plate_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fix_record
    ADD CONSTRAINT fix_record_car_plate_fkey FOREIGN KEY (car_plate) REFERENCES public.fixed_car(car_plate) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: fixed_car fixed_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fixed_car
    ADD CONSTRAINT fixed_car_id_fkey FOREIGN KEY (id) REFERENCES public.customer(id) NOT VALID;


--
-- Name: car fk_brand; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT fk_brand FOREIGN KEY (brand) REFERENCES public.car_brand(brand) NOT VALID;


--
-- Name: car fk_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT fk_type FOREIGN KEY (type) REFERENCES public.car_type(type) NOT VALID;


--
-- Name: sale_detail sale_detail_car_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT sale_detail_car_id_fkey FOREIGN KEY (car_id) REFERENCES public.car(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: sale_detail sale_detail_salerecord_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_detail
    ADD CONSTRAINT sale_detail_salerecord_id_fkey FOREIGN KEY (salerecord_id) REFERENCES public.sale_record(salerecord_id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: sale_record sale_record_cus_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_record
    ADD CONSTRAINT sale_record_cus_id_fkey FOREIGN KEY (cus_id) REFERENCES public.customer(id) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- PostgreSQL database dump complete
--

