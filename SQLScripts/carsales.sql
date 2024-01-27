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

--
-- Name: update_fix_record_total_price_on_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_fix_record_total_price_on_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE fix_record
  SET total_price = (SELECT SUM(price) FROM fix_detail WHERE fixrecord_id = old.fixrecord_id)
  WHERE fixrecord_id = old.fixrecord_id;
  RETURN old;
END;
$$;


ALTER FUNCTION public.update_fix_record_total_price_on_delete() OWNER TO postgres;

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
221	5	0
231	5	0
256	5	0
275	4	0
276	4	0
278	5	0
291	4	0
311	4	0
328	4	0
330	4	0
334	5	0
339	5	0
376	5	0
379	5	0
388	4	0
403	5	144
405	5	13
406	5	42435
\.


--
-- Data for Name: ap_import_report; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ap_import_report (importinvoice_id, ap_id, date, quantity) FROM stdin;
291	16	2024-01-13	4
201	15	2023-12-14	3
256	19	2023-12-07	7
276	14	2023-11-29	10
278	18	2024-01-09	3
221	14	2023-12-02	3
231	21	2024-01-13	9
275	15	2024-01-18	9
403	157	2024-01-23	12
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
1	Mercedes-Benz	Electric	23	23	23	23	39
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
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer (id) FROM stdin;
479
480
485
461
462
\.


--
-- Data for Name: federated_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_credentials (id, user_id, provider, subject) FROM stdin;
3	480	facebook	1587045301832696
\.


--
-- Data for Name: fix_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_detail (date, detail, price, fixdetail_id, fixrecord_id, ap_id, mec_id, "Status", quantity) FROM stdin;
\.


--
-- Data for Name: fix_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_record (fixrecord_id, car_plate, date, total_price, status, pay) FROM stdin;
\.


--
-- Data for Name: fixed_car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fixed_car (car_plate, id) FROM stdin;
\.


--
-- Data for Name: mechanic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mechanic (id) FROM stdin;
\.


--
-- Data for Name: sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_detail (salerecord_id, car_id, quantity) FROM stdin;
\.


--
-- Data for Name: sale_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_record (salerecord_id, cus_id, date, total_price) FROM stdin;
\.


--
-- Data for Name: sales_assistant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_assistant (id) FROM stdin;
486
\.


--
-- Data for Name: storage_manager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_manager (id) FROM stdin;
4
5
\.


--
-- Data for Name: user-session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user-session" (sid, sess, expire) FROM stdin;
8TzGiEpQCnYqYZEBXSQl8R1Nwsfw8QUk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"flash":{}}	2024-01-27 23:50:38
kSy9rYXEopdYSsxGD5lTy47wwkkKbvik	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"flash":{}}	2024-01-27 23:05:31
1_nqe2qc7GNk3hRtvoklImGQhXQ60QwR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":479,"permission":"ad","nameOfUser":"ad ad"}},"flash":{}}	2024-01-28 22:01:29
bKfzEt_2u4u6QRTiBizx6oZ18NhrPVGG	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":3,"permission":"sm","nameOfUser":"Cung An Nhiên"}},"flash":{}}	2024-01-26 23:52:41
oU-YO6FJa4gxQpJk6gDPBwhGzp6sBmsy	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:07:25
IN5sVjr-KkE6BgkQXfQmLy7vDlt9YvSO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:07:25
ygE8UQTnS5tfyldiNP9X9-u1F4eShyWO	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:12
j_0o8MD_2L36URNDwwC313_oBp3L7iJv	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:12
a-71NMtpgeCN6ym0wgd80c6v0AFqkEzH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:14
0fMTTWdPME8z9SjeHQDHEj0tti8c8x8Y	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:14
fcgGZtckpBe283QrKpE2uV7iZfNBKm1M	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:15
Jc7eNP_grgHpeAbTqvFLorIp4_KI8UqB	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:15
CC1PmIhQ8aJ-egNVO7M7_MDOBTH2h2oD	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:16
FgVO1j5g8mGe8mpOowvGOj1vR9x8ixE_	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:16
o-x_EBg5KoGLtjr5PGNZ_w5nf5MhMzTH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:17
WcNhqCffeSC6kBn3eLnlQ_Lg-ca1gV_G	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:17
VGuXBFq6YSuKmv1cgCWVxKGeO63akNYt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:20
C56fdssTTc8IkZh7J2yRGmr5RU3dFZxS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:20
8IB-7kGyq9PCZz-EcEY7C8bSG8Do8_KV	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:21
0F_BOlO7foDEJLnvy7F4RUEPAq9QxLP5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:21
ENKIpNfFKApX_7TLagj-TNAscdfyonsN	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:21
sv_niit7HHNkOSQEZv1hUM3h02O8qaeS	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:21
TWM2ZTuMtg9-XfV2U-fJU51eoveulISd	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:22
bTsO9x-TcYa8v18095I0EjjxJChj3Tax	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:22
3fdD2czhE0zbwYPiU0Mqw3u0m6OsInWo	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:22
GgFVh7nvSiYNkaTznOzMJLfC6Q28QSVx	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:22
QW2RaCyfZNh-YGYZGHDv--mComUg0xkZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:40
V5BBrxgYNKi7oo70sZoLDupTKNc24wzL	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:40
ahIjfGw9eG72XYObUaBe1fu5on9k5Tl6	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:41
QcqJDgBpjShy4dlEYubsx7QNXXkXETI2	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:08:41
9-wI9ezsCqSMEEMUGT8roDx5Ofd43qzN	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:00
hO8L3nkw4CeK3ba-wy-2g3TVUt8_o3_e	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:00
aRJTLovfAE-3fVb1fsknDWZ-NvNs7OHk	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:01
27lTj5bscXp3cY_bEr6AS5MTGaQ3y8Jt	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:01
7ctrnlDx1zPZpdyHvjiqakSm6ibdiBFj	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:01
GhVLNJYBrFr4KriTuYt8R9SIW8I4UBzz	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:01
pvO7vmvnUcORJYR_oaTNIJ3Ideo5FchH	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:02
oNmcDfOxg06jKGj5v8qnLyr6wQstDkxI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-27 10:09:02
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_info (username, password, permission, id, firstname, phonenumber, dob, address, lastname) FROM stdin;
ad	$2b$10$oGFpSON.g0etVVnbtWC6rOXLlfHp.uqW1ZIM4xKcpsNEKGMOQbnNW	ad	479	ad	\N	2024-01-26		ad
\N	\N	cus	480	Nguyễn Phạm Phú Xuân	\N	\N	\N	\N
cu	$2b$10$j4rVPfEtGaHnP5Qu.6e9kuBRn4HXfctUor.p1vuP1/72HxTJcQSg6	cus	485	cu	cu	2024-01-26		cu
sa	$2b$10$Dw/Nt1Y6NidfsG4Fo/9DF.pSzBL8i2bCDbevv5rL4X15VCGQtpV7e	sa	486	sa	sa	2024-01-27		sa
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

SELECT pg_catalog.setval('public.car_car_id_seq', 39, true);


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_import_invoice_importinvoice_id_seq', 416, true);


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.federated_credentials_id_seq', 3, true);


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

SELECT pg_catalog.setval('public.user_info_id_seq', 486, true);


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
-- Name: fix_detail update_fix_record_total_price_trigger_on_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_fix_record_total_price_trigger_on_delete AFTER DELETE ON public.fix_detail FOR EACH ROW EXECUTE FUNCTION public.update_fix_record_total_price_on_delete();


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

