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
Battery	PowerDrive Inc.	100	21	20
Air Filter	AutoTech Supplies	13	15	9
new	1213	123	158	345
12	12	12	157	0
Timing Belt	Speedy Auto	26	18	1
Spark Plugs	abc	10	14	0
Radiator	PartsRUs	80	16	0
Shock Absorbers	Global Automotive	35	20	0
Oil Filter	Superior Parts	9	19	6
Fuel Pump	CarCare Depot	60	17	0
Brake Pads	ABC Auto Parts	50	13	2
\.


--
-- Data for Name: car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car (car_name, brand, type, year, price, description, quantity, id) FROM stdin;
GLC-Class 2019	Mercedes-Benz	SUV	2019	40000	Luxurious 2019 Mercedes-Benz GLC-Class SUV Experience the epitome of luxury with the 2019 Mercedes-Benz GLC-Class SUV. This SUV combines elegance and power, featuring a refined interior and advanced driver-assistance systems that redefine the driving experience.	5	160
GLC-Class 2020	Mercedes-Benz	SUV	2020	43000	Luxurious 2020 Mercedes-Benz GLC-Class SUV Introducing the 2020 Mercedes-Benz GLC-Class SUV, where sophistication meets performance. With its refined interior and advanced driver-assistance systems, this SUV sets new standards in luxury and safety.	5	161
GLE-Class 2021	Mercedes-Benz	SUV	2021	55000	Luxurious 2021 Mercedes-Benz GLE-Class SUV Step into the future of driving with the 2021 Mercedes-Benz GLE-Class SUV. Immerse yourself in luxury with its refined interior and experience cutting-edge safety features and driver-assistance systems.	5	162
GLS-Class 2022	Mercedes-Benz	SUV	2022	78900	Luxurious 2022 Mercedes-Benz GLS-Class SUV Elevate your driving experience with the 2022 Mercedes-Benz GLS-Class SUV. This luxurious SUV boasts a refined interior and advanced driver-assistance systems, delivering unparalleled comfort and safety.	5	163
EQS-SUV 2023	Mercedes-Benz	SUV	2023	105550	Luxurious 2023 Mercedes-Benz EQS SUV Embark on a journey of luxury and sustainability with the 2023 Mercedes-Benz EQS SUV. Featuring a refined interior and state-of-the-art electric technology, this SUV redefines the concept of a high-end, eco-friendly driving experience.	5	164
A-Class 2019	Mercedes-Benz	Hatchback	2019	35700	Luxurious 2019 Mercedes-Benz A-Class Hatchback. Discover the perfect blend of style and performance with the 2019 Mercedes-Benz A-Class Hatchback. This luxurious hatchback features a refined interior and cutting-edge driver-assistance systems for an unparalleled driving experience.	5	165
A-Class 2020	Mercedes-Benz	Hatchback	2020	33795	Luxurious 2020 Mercedes-Benz A-Class Hatchback. Experience the epitome of hatchback luxury with the 2020 Mercedes-Benz A-Class. With its refined interior and advanced driver-assistance systems, this hatchback sets new standards in comfort and safety.	5	166
A-Class 2021	Mercedes-Benz	Hatchback	2021	35986	Luxurious 2021 Mercedes-Benz A-Class Hatchback. Elevate your driving experience with the 2021 Mercedes-Benz A-Class Hatchback. Immerse yourself in luxury with its refined interior and cutting-edge driver-assistance features.	5	167
A-Class 2022	Mercedes-Benz	Hatchback	2022	33795	Luxurious 2022 Mercedes-Benz A-Class Hatchback. Introducing the 2022 Mercedes-Benz A-Class Hatchback, where style meets performance. With its refined interior and advanced driver-assistance systems, this hatchback delivers an unmatched driving experience.	5	168
A-Class 2023	Mercedes-Benz	Hatchback	2023	35986	Luxurious 2023 Mercedes-Benz A-Class Hatchback. Embark on a journey of luxury with the 2023 Mercedes-Benz A-Class Hatchback. Featuring a refined interior and cutting-edge driver-assistance systems, this hatchback redefines the art of driving.	5	169
EQC 2019	Mercedes-Benz	Electric	2019	67900	Luxurious 2019 Mercedes-Benz EQC Electric Vehicle. Experience the future of driving with the 2019 Mercedes-Benz EQC Electric Vehicle. This luxurious electric vehicle combines cutting-edge technology with a refined interior for a sustainable and opulent driving experience.	5	170
EQC 2020	Mercedes-Benz	Electric	2020	69900	Luxurious 2020 Mercedes-Benz EQC Electric Vehicle. Introducing the 2020 Mercedes-Benz EQC Electric Vehicle, where sustainability meets luxury. Immerse yourself in a refined interior and experience the latest in electric vehicle technology.	5	171
EQA 2021	Mercedes-Benz	Electric	2021	55000	Luxurious 2021 Mercedes-Benz EQA Electric Vehicle. Step into the world of electric luxury with the 2021 Mercedes-Benz EQA. Featuring a refined interior and advanced electric technology, this electric vehicle sets new standards in opulence and sustainability.	5	172
EQS 2022	Mercedes-Benz	Electric	2022	102310	Luxurious 2022 Mercedes-Benz EQS Electric Vehicle. Elevate your driving experience with the 2022 Mercedes-Benz EQS Electric Vehicle. Immerse yourself in luxury with a refined interior and cutting-edge electric technology, setting new standards in sustainable opulence.	5	173
EQE 2023	Mercedes-Benz	Electric	2023	105550	Luxurious 2023 Mercedes-Benz EQ. Step into the world of electric luxury with the 2021 Mercedes-Benz EQA. Featuring a refined interior and advanced electric technology, this electric vehicle sets new standards in opulence and sustainability.	5	174
E-Class 2022	Mercedes-Benz	Sedan	2022	75000	The 2022 Mercedes-Benz E-Class Sedan is the epitome of luxury and performance. With its refined interior and cutting-edge technology, it offers a driving experience like no other.	1	180
E-Class 2021	Mercedes-Benz	Sedan	2021	72000	Experience elegance and power with the 2021 Mercedes-Benz E-Class Sedan. Featuring a sophisticated interior and advanced driver-assistance systems, it sets new standards in opulent driving.	1	181
C-Class 2021	Mercedes-Benz	Sedan	2021	58000	The 2021 Mercedes-Benz C-Class Sedan combines style with performance. With its refined interior and advanced features, it offers a luxurious driving experience that captivates.	1	182
C-Class 2020	Mercedes-Benz	Sedan	2020	55000	Introducing the 2020 Mercedes-Benz C-Class Sedan, where sophistication meets comfort. Immerse yourself in luxury with its refined interior and cutting-edge technology.	1	183
A-Class 2019	Mercedes-Benz	Sedan	2019	49000	The 2019 Mercedes-Benz A-Class Sedan redefines entry-level luxury. With a refined interior and advanced features, it delivers a premium driving experience.	1	184
G-Class 2022	Mercedes-Benz	Off-Road	2022	135000	Conquer the off-road in style with the 2022 Mercedes-Benz G-Class. Immerse yourself in luxury with its refined interior and cutting-edge off-road capabilities.	1	185
G-Class 2021	Mercedes-Benz	Off-Road	2021	130000	Embark on a journey of off-road luxury with the 2021 Mercedes-Benz G-Class. Featuring a refined interior and advanced off-road capabilities, this vehicle redefines the concept of rugged opulence.	1	186
G-Class 2020	Mercedes-Benz	Off-Road	2020	125000	Luxurious 2020 Mercedes-Benz G-Class Off-Road Vehicle. Introducing the 2020 Mercedes-Benz G-Class, where ruggedness meets luxury. Immerse yourself in a refined interior and cutting-edge off-road features for the ultimate off-road experience.	1	187
GLB-Class 2019	Mercedes-Benz	Off-Road	2019	47000	The 2019 Mercedes-Benz GLB-Class combines off-road capability with versatility. With its compact size and rugged features, it is ready for your off-road adventures.	1	188
GLB-Class 2018	Mercedes-Benz	Off-Road	2018	45000	Experience off-road versatility with the 2018 Mercedes-Benz GLB-Class. With a compact size and rugged design, it is the perfect companion for those seeking adventure.	1	189
X3 2019	BMW1	Off-Road	2019	75000	The 2019 BMW X3 combines off-road capability with versatility. With its compact size and rugged features, it is ready for your off-road adventures.	1	238
Santa Fe 2019	Hyundai	SUV	2019	32000	Versatile 2019 Hyundai Santa Fe SUV. Experience a perfect blend of style and functionality with the 2019 Hyundai Santa Fe. This SUV features a spacious interior and advanced safety features for a comfortable and secure driving experience.	5	240
Palisade 2020	Hyundai	SUV	2020	35000	Spacious 2020 Hyundai Palisade SUV. Introducing the 2020 Hyundai Palisade, where versatility meets luxury. With its roomy interior and advanced safety features, this SUV sets new standards in comfort and safety.	5	241
Tucson 2021	Hyundai	SUV	2021	25000	Stylish 2021 Hyundai Tucson SUV. Step into the future of driving with the 2021 Hyundai Tucson SUV. Immerse yourself in style with its sleek design and experience advanced safety features and technology.	5	242
Kona 2022	Hyundai	SUV	2022	21000	Compact 2022 Hyundai Kona SUV. Elevate your driving experience with the 2022 Hyundai Kona SUV. This compact SUV combines style and efficiency, making it perfect for urban adventures.	5	243
Nexo 2023	Hyundai	SUV	2023	60000	Eco-Friendly 2023 Hyundai Nexo SUV. Embark on a journey of sustainability with the 2023 Hyundai Nexo SUV. Featuring advanced fuel cell technology, this SUV redefines the concept of eco-friendly driving.	5	244
Veloster 2019	Hyundai	Hatchback	2019	18000	Sporty 2019 Hyundai Veloster Hatchback. Discover the thrill of driving with the 2019 Hyundai Veloster Hatchback. This sporty hatchback features a unique design and agile performance for an exhilarating driving experience.	5	245
Elantra GT 2020	Hyundai	Hatchback	2020	19000	Dynamic 2020 Hyundai Elantra GT Hatchback. Experience the perfect balance of style and performance with the 2020 Hyundai Elantra GT. With its dynamic design and efficient features, this hatchback sets new standards in versatility.	5	246
Ioniq 5 2022	Hyundai	Hatchback	2022	45000	Innovative 2022 Hyundai Ioniq 5 Hatchback. Introducing the 2022 Hyundai Ioniq 5, where innovation meets style. With its futuristic design and advanced electric technology, this hatchback sets new standards in sustainable driving.	5	248
Venue 2023	Hyundai	Hatchback	2023	18000	Compact 2023 Hyundai Venue Hatchback. Embark on urban adventures with the 2023 Hyundai Venue Hatchback. Featuring a compact design and advanced technology, this hatchback is perfect for city living.	5	249
CR-V 2019	Honda	SUV	2019	30000	Versatile 2019 Honda CR-V SUV. Experience the perfect blend of practicality and style with the 2019 Honda CR-V SUV. This SUV offers a spacious interior and advanced safety features for a comfortable and secure driving experience.	5	190
X5 2019	BMW1	SUV	2019	50000	Luxurious 2019 BMW X5 SUV. Experience the perfect combination of performance and style with the 2019 BMW X5 SUV. This SUV offers a refined interior and advanced driver-assistance features for an unparalleled driving experience.	5	215
X5 2020	BMW1	SUV	2020	52000	Luxurious 2020 BMW X5 SUV. Introducing the 2020 BMW X5, where power meets elegance. With its refined interior and advanced driver-assistance features, this SUV sets new standards in luxury and performance.	5	216
X7 2021	BMW1	SUV	2021	65000	Luxurious 2021 BMW X7 SUV. Step into the world of driving excellence with the 2021 BMW X7 SUV. Immerse yourself in luxury with its refined interior and cutting-edge safety features and driver-assistance systems.	5	217
X6 2022	BMW1	SUV	2022	80000	Luxurious 2022 BMW X6 SUV. Elevate your driving experience with the 2022 BMW X6 SUV. This luxurious SUV boasts a refined interior and advanced driver-assistance features, delivering unparalleled comfort and safety.	5	218
iX3 2023	BMW1	SUV	2023	90000	Luxurious 2023 BMW iX3 SUV. Embark on a journey of luxury and sustainability with the 2023 BMW iX3 SUV. Featuring a refined interior and state-of-the-art electric technology, this SUV redefines the concept of a high-end, eco-friendly driving experience.	5	219
1 Series 2019	BMW1	Hatchback	2019	35700	Luxurious 2019 BMW 1 Series Hatchback. Discover the perfect blend of style and performance with the 2019 BMW 1 Series Hatchback. This luxurious hatchback features a refined interior and cutting-edge driver-assistance systems for an unparalleled driving experience.	5	220
1 Series 2020	BMW1	Hatchback	2020	33795	Luxurious 2020 BMW 1 Series Hatchback. Experience the epitome of hatchback luxury with the 2020 BMW 1 Series. With its refined interior and advanced driver-assistance systems, this hatchback sets new standards in comfort and safety.	5	221
5 Series 2022	BMW1	Sedan	2022	75000	The 2022 BMW 5 Series Sedan is the epitome of luxury and performance. With its refined interior and cutting-edge technology, it offers a driving experience like no other.	1	230
Kona Electric 2019	Hyundai	Electric	2019	32000	Eco-Friendly 2019 Hyundai Kona Electric Vehicle. Experience the future of driving with the 2019 Hyundai Kona Electric. This electric vehicle combines sustainability with a modern design for an eco-friendly driving experience.	5	250
Ioniq Electric 2020	Hyundai	Electric	2020	34000	Innovative 2020 Hyundai Ioniq Electric Vehicle. Introducing the 2020 Hyundai Ioniq Electric, where innovation meets efficiency. Immerse yourself in a sustainable driving experience with this electric vehicle.	5	251
Santa Fe Plug-in Hybrid 2021	Hyundai	Electric	2021	40000	Efficient 2021 Hyundai Santa Fe Plug-in Hybrid. Step into the world of hybrid technology with the 2021 Hyundai Santa Fe Plug-in Hybrid. This SUV offers a versatile and eco-friendly driving solution.	5	252
Ioniq 5 2022	Hyundai	Electric	2022	45000	Cutting-Edge 2022 Hyundai Ioniq 5 Electric Vehicle. Elevate your driving experience with the 2022 Hyundai Ioniq 5. Featuring a futuristic design and advanced electric technology, this electric vehicle sets new standards in sustainable driving.	5	253
Nexo 2023	Hyundai	Electric	2023	60000	Eco-Friendly 2023 Hyundai Nexo Electric Vehicle. Embark on a journey of sustainability with the 2023 Hyundai Nexo Electric Vehicle. Featuring advanced fuel cell technology, this electric SUV redefines the concept of eco-friendly driving.	5	254
Elantra 2022	Hyundai	Sedan	2022	20000	The 2022 Hyundai Elantra Sedan is a perfect blend of style and efficiency. With its modern design and advanced features, it offers a comfortable and enjoyable driving experience.	1	255
Sonata 2021	Hyundai	Sedan	2021	23000	Experience elegance and performance with the 2021 Hyundai Sonata Sedan. Featuring a sophisticated interior and advanced driver-assistance systems, it sets new standards in opulent driving.	1	256
Elantra 2020	Hyundai	Sedan	2020	19000	Introducing the 2020 Hyundai Elantra Sedan, where sophistication meets comfort. Immerse yourself in style with its refined interior and cutting-edge technology.	1	258
Venue 2019	Hyundai	Sedan	2019	18000	The 2019 Hyundai Venue Sedan is designed for urban living. With its compact size and efficient features, it delivers a convenient and enjoyable driving experience.	1	259
Santa Cruz 2022	Hyundai	Off-Road	2022	25000	Versatile 2022 Hyundai Santa Cruz Off-Road Vehicle. Conquer the off-road with the 2022 Hyundai Santa Cruz. Featuring a rugged design and off-road capabilities, this vehicle is ready for adventure.	1	260
Kona 2021	Hyundai	Off-Road	2021	21000	Compact 2021 Hyundai Kona Off-Road Vehicle. Embark on off-road adventures with the 2021 Hyundai Kona. With its compact size and versatile features, this off-road vehicle is perfect for outdoor enthusiasts.	1	261
Palisade Calligraphy 2020	Hyundai	Off-Road	2020	35000	Luxurious 2020 Hyundai Palisade Calligraphy Off-Road Vehicle. Introducing the 2020 Hyundai Palisade Calligraphy, where luxury meets off-road capability. Immerse yourself in a refined interior and cutting-edge off-road features for the ultimate off-road experience.	1	262
Tucson 2019	Hyundai	Off-Road	2019	28000	The 2019 Hyundai Tucson Off-Road Vehicle combines versatility with rugged design. With its off-road features and spacious interior, it is ready for your outdoor adventures.	1	263
Kona Electric 2018	Hyundai	Off-Road	2018	28000	Eco-Friendly 2018 Hyundai Kona Electric Off-Road Vehicle. Experience off-road adventures with sustainability in mind. The 2018 Hyundai Kona Electric offers a compact and eco-friendly solution for outdoor enthusiasts.	1	264
Rav4 2019	Toyota	SUV	2019	28000	Versatile 2019 Toyota RAV4 SUV. Experience a perfect blend of style and functionality with the 2019 Toyota RAV4. This SUV features a spacious interior and advanced safety features for a comfortable and secure driving experience.	5	265
Highlander 2020	Toyota	SUV	2020	35000	Spacious 2020 Toyota Highlander SUV. Introducing the 2020 Toyota Highlander, where versatility meets luxury. With its roomy interior and advanced safety features, this SUV sets new standards in comfort and safety.	5	266
4Runner 2021	Toyota	SUV	2021	36000	Sturdy 2021 Toyota 4Runner SUV. Step into the world of off-road adventures with the 2021 Toyota 4Runner SUV. Immerse yourself in its rugged design and experience advanced safety features and technology.	5	267
Land Cruiser 2022	Toyota	SUV	2022	85000	Luxurious 2022 Toyota Land Cruiser SUV. Elevate your driving experience with the 2022 Toyota Land Cruiser SUV. This luxurious SUV boasts a refined interior and advanced driver-assistance features, delivering unparalleled comfort and safety.	5	268
RAV4 Prime 2023	Toyota	SUV	2023	42000	Efficient 2023 Toyota RAV4 Prime SUV. Embark on a journey of efficiency and style with the 2023 Toyota RAV4 Prime. Featuring a plug-in hybrid system, this SUV redefines the concept of eco-friendly driving.	5	269
Corolla Hatchback 2019	Toyota	Hatchback	2019	21000	Sporty 2019 Toyota Corolla Hatchback. Discover the thrill of driving with the 2019 Toyota Corolla Hatchback. This sporty hatchback features a dynamic design and agile performance for an exhilarating driving experience.	5	270
Prius 2020	Toyota	Hatchback	2020	24000	Efficient 2020 Toyota Prius Hatchback. Experience the perfect balance of style and efficiency with the 2020 Toyota Prius. With its iconic design and hybrid technology, this hatchback sets new standards in versatility.	5	271
2 Series 2019	BMW1	Sedan	2019	49000	The 2019 BMW 2 Series Sedan redefines entry-level luxury. With a refined interior and advanced features, it delivers a premium driving experience.	1	234
Yaris 2021	Toyota	Hatchback	2021	17000	Compact 2021 Toyota Yaris Hatchback. Elevate your daily commute with the 2021 Toyota Yaris Hatchback. This compact and efficient hatchback delivers a comfortable and economical driving experience.	5	272
GR Yaris 2022	Toyota	Hatchback	2022	32000	High-Performance 2022 Toyota GR Yaris Hatchback. Introducing the 2022 Toyota GR Yaris, where high-performance meets style. With its dynamic design and turbocharged engine, this hatchback delivers an unmatched driving experience.	5	273
Prius Prime 2023	Toyota	Hatchback	2023	28000	Efficient 2023 Toyota Prius Prime Hatchback. Embark on a journey of efficiency with the 2023 Toyota Prius Prime. Featuring a plug-in hybrid system, this hatchback offers sustainable and eco-friendly driving.	5	274
Rav4 EV 2019	Toyota	Electric	2019	34000	Eco-Friendly 2019 Toyota RAV4 Electric Vehicle. Experience the future of driving with the 2019 Toyota RAV4 Electric. This electric vehicle combines sustainability with a modern design for an eco-friendly driving experience.	5	275
Mirai 2020	Toyota	Electric	2020	50000	Innovative 2020 Toyota Mirai Electric Vehicle. Introducing the 2020 Toyota Mirai, where innovation meets sustainability. Immerse yourself in a refined interior and experience the latest in fuel cell technology.	5	276
Prius Prime 2021	Toyota	Electric	2021	28000	Efficient 2021 Toyota Prius Prime Electric Vehicle. Step into the world of hybrid technology with the 2021 Toyota Prius Prime. This electric vehicle offers a versatile and eco-friendly driving solution.	5	277
BZ4X 2022	Toyota	Electric	2022	45000	Cutting-Edge 2022 Toyota BZ4X Electric Vehicle. Elevate your driving experience with the 2022 Toyota BZ4X. Featuring a futuristic design and advanced electric technology, this electric vehicle sets new standards in sustainable driving.	5	278
e-Palette 2023	Toyota	Electric	2023	60000	Innovative 2023 Toyota e-Palette Electric Vehicle. Embark on a journey of innovation and sustainability with the 2023 Toyota e-Palette. This electric vehicle is designed for autonomous and eco-friendly transportation.	5	279
Camry 2022	Toyota	Sedan	2022	26000	The 2022 Toyota Camry Sedan is the epitome of style and efficiency. With its modern design and advanced features, it offers a comfortable and enjoyable driving experience.	1	280
Avalon 2021	Toyota	Sedan	2021	38000	Experience elegance and performance with the 2021 Toyota Avalon Sedan. Featuring a sophisticated interior and advanced driver-assistance systems, it sets new standards in opulent driving.	1	281
Corolla 2021	Toyota	Sedan	2021	21000	The 2021 Toyota Corolla Sedan combines style with efficiency. With its compact design and advanced features, it offers a comfortable and economical driving experience.	1	282
Camry Hybrid 2020	Toyota	Sedan	2020	29000	Introducing the 2020 Toyota Camry Hybrid Sedan, where sophistication meets efficiency. Immerse yourself in luxury with its refined interior and cutting-edge hybrid technology.	1	283
Prius 2019	Toyota	Sedan	2019	24000	The 2019 Toyota Prius Sedan redefines hybrid efficiency. With a sleek design and advanced features, it delivers a premium driving experience.	1	284
Land Cruiser 2022	Toyota	Off-Road	2022	85000	Conquer the off-road in style with the 2022 Toyota Land Cruiser. Immerse yourself in luxury with its refined interior and cutting-edge off-road capabilities.	1	285
4Runner 2021	Toyota	Off-Road	2021	36000	Embark on a journey of off-road adventures with the 2021 Toyota 4Runner. Featuring a refined interior and advanced off-road capabilities, this vehicle redefines the concept of rugged opulence.	1	286
Tacoma TRD Pro 2020	Toyota	Off-Road	2020	42000	High-Performance 2020 Toyota Tacoma TRD Pro Off-Road Vehicle. Introducing the 2020 Toyota Tacoma TRD Pro, where ruggedness meets performance. Immerse yourself in a refined interior and cutting-edge off-road features for the ultimate off-road experience.	1	287
Sequoia 2019	Toyota	Off-Road	2019	50000	The 2019 Toyota Sequoia combines off-road capability with versatility. With its spacious interior and rugged design, it is ready for your off-road adventures.	1	288
Tacoma 2018	Toyota	Off-Road	2018	32000	Experience off-road versatility with the 2018 Toyota Tacoma. With a rugged design and advanced off-road features, it is the perfect companion for those seeking adventure.	1	289
Accent 2021	Hyundai	Hatchback	2021	16000	Efficient 2021 Hyundai Accent Hatchback. Elevate your daily commute with the 2021 Hyundai Accent Hatchback. This efficient and compact hatchback delivers a comfortable and economical driving experience.	3	247
Accent 2021	Hyundai	Sedan	2021	16000	The 2021 Hyundai Accent Sedan combines style with efficiency. With its compact design and advanced features, it offers a comfortable and economical driving experience.	0	257
CR-V 2020	Honda	SUV	2020	32000	Versatile 2020 Honda CR-V SUV. Introducing the 2020 Honda CR-V SUV, where functionality meets sophistication. With its spacious interior and advanced safety features, this SUV sets new standards in comfort and reliability.	5	191
Pilot 2021	Honda	SUV	2021	40000	Spacious 2021 Honda Pilot SUV. Step into the future of family driving with the 2021 Honda Pilot SUV. Immerse yourself in a roomy interior and experience advanced safety features for a worry-free journey.	5	192
Passport 2022	Honda	SUV	2022	45000	Adventure-ready 2022 Honda Passport SUV. Elevate your driving experience with the 2022 Honda Passport SUV. This rugged SUV boasts a spacious interior and advanced safety features, making it the perfect companion for your next adventure.	5	193
HR-V 2023	Honda	SUV	2023	25000	Compact 2023 Honda HR-V SUV. Explore urban landscapes with the 2023 Honda HR-V SUV. Featuring a compact size and versatile interior, this SUV is designed for city living and beyond.	5	194
Civic 2019	Honda	Hatchback	2019	22000	Sporty 2019 Honda Civic Hatchback. Discover the perfect combination of performance and style with the 2019 Honda Civic Hatchback. This hatchback features a sleek design and advanced safety features for an exhilarating driving experience.	5	195
Civic 2020	Honda	Hatchback	2020	23000	Sporty 2020 Honda Civic Hatchback. Experience the thrill of driving with the 2020 Honda Civic Hatchback. With its sleek design and advanced safety features, this hatchback sets new standards in sporty elegance.	5	196
Fit 2021	Honda	Hatchback	2021	18000	Compact 2021 Honda Fit Hatchback. Elevate your city driving with the 2021 Honda Fit Hatchback. Featuring a compact size and versatile interior, this hatchback is perfect for navigating urban environments with ease.	5	197
Civic 2022	Honda	Hatchback	2022	24000	Dynamic 2022 Honda Civic Hatchback. Introducing the 2022 Honda Civic Hatchback, where dynamic design meets practicality. With its sleek exterior and advanced safety features, this hatchback delivers an exciting driving experience.	5	198
Fit 2023	Honda	Hatchback	2023	19000	Compact 2023 Honda Fit Hatchback. Navigate the city streets with the 2023 Honda Fit Hatchback. Featuring a compact size and efficient design, this hatchback is tailored for urban adventures.	5	199
Clarity 2019	Honda	Electric	2019	33000	Innovative 2019 Honda Clarity Electric Vehicle. Experience the future of sustainable driving with the 2019 Honda Clarity Electric Vehicle. This electric vehicle combines eco-friendly technology with a comfortable interior for a guilt-free and luxurious driving experience.	5	200
Clarity 2020	Honda	Electric	2020	34000	Innovative 2020 Honda Clarity Electric Vehicle. Introducing the 2020 Honda Clarity Electric Vehicle, where sustainability meets luxury. Immerse yourself in a comfortable interior and experience the latest in electric vehicle technology.	5	201
Accord 2022	Honda	Sedan	2022	28000	The 2022 Honda Accord Sedan combines style with efficiency. With its comfortable interior and advanced features, it offers a reliable and luxurious driving experience.	1	205
X3 2018	BMW1	Off-Road	2018	73000	Experience off-road versatility with the 2018 BMW X3. With a compact size and rugged design, it is the perfect companion for those seeking adventure.	1	239
Insight 2021	Honda	Electric	2021	28000	Efficient 2021 Honda Insight Electric Vehicle. Step into the world of electric efficiency with the 2021 Honda Insight. Featuring a comfortable interior and advanced electric technology, this electric vehicle sets new standards in efficiency and style.	5	202
Clarity 2022	Honda	Electric	2022	35000	Innovative 2022 Honda Clarity Electric Vehicle. Elevate your driving experience with the 2022 Honda Clarity Electric Vehicle. Immerse yourself in a comfortable interior and cutting-edge electric technology, setting new standards in sustainable opulence.	5	203
Civic EV 2023	Honda	Electric	2023	32000	Modern 2023 Honda Civic Electric Vehicle. Step into the world of electric luxury with the 2023 Honda Civic EV. Featuring a comfortable interior and advanced electric technology, this electric vehicle sets new standards in opulence and sustainability.	5	204
Civic 2021	Honda	Sedan	2021	24000	Experience elegance and efficiency with the 2021 Honda Civic Sedan. Featuring a stylish interior and advanced driver-assistance systems, it sets new standards in opulent driving.	1	206
Civic 2021	Honda	Sedan	2021	24000	The 2021 Honda Civic Sedan combines style with performance. With its comfortable interior and advanced features, it offers a luxurious driving experience that captivates.	1	207
Accord 2020	Honda	Sedan	2020	26000	Introducing the 2020 Honda Accord Sedan, where sophistication meets comfort. Immerse yourself in luxury with its comfortable interior and cutting-edge technology.	1	208
Civic 2019	Honda	Sedan	2019	22000	The 2019 Honda Civic Sedan redefines entry-level luxury. With a comfortable interior and advanced features, it delivers a premium driving experience.	1	209
Pilot 2022	Honda	Off-Road	2022	40000	Conquer the off-road in style with the 2022 Honda Pilot. Immerse yourself in comfort with its spacious interior and cutting-edge off-road capabilities.	1	210
Pilot 2021	Honda	Off-Road	2021	38000	Embark on a journey of off-road luxury with the 2021 Honda Pilot. Featuring a spacious interior and advanced off-road capabilities, this vehicle redefines the concept of rugged opulence.	1	211
Ridgeline 2020	Honda	Off-Road	2020	35000	Luxurious 2020 Honda Ridgeline Off-Road Vehicle. Introducing the 2020 Honda Ridgeline, where ruggedness meets luxury. Immerse yourself in a comfortable interior and cutting-edge off-road features for the ultimate off-road experience.	1	212
HR-V 2019	Honda	Off-Road	2019	27000	The 2019 Honda HR-V combines off-road capability with versatility. With its compact size and rugged features, it is ready for your off-road adventures.	1	213
CR-V 2018	Honda	Off-Road	2018	25000	Experience off-road versatility with the 2018 Honda CR-V. With a compact size and rugged design, it is the perfect companion for those seeking adventure.	1	214
2 Series 2021	BMW1	Hatchback	2021	35986	Luxurious 2021 BMW 2 Series Hatchback. Elevate your driving experience with the 2021 BMW 2 Series Hatchback. Immerse yourself in luxury with its refined interior and cutting-edge driver-assistance features.	5	222
2 Series 2022	BMW1	Hatchback	2022	33795	Luxurious 2022 BMW 2 Series Hatchback. Introducing the 2022 BMW 2 Series Hatchback, where style meets performance. With its refined interior and advanced driver-assistance systems, this hatchback delivers an unmatched driving experience.	5	223
3 Series 2023	BMW1	Hatchback	2023	35986	Luxurious 2023 BMW 3 Series Hatchback. Embark on a journey of luxury with the 2023 BMW 3 Series Hatchback. Featuring a refined interior and cutting-edge driver-assistance systems, this hatchback redefines the art of driving.	5	224
i3 2019	BMW1	Electric	2019	67900	Luxurious 2019 BMW i3 Electric Vehicle. Experience the future of driving with the 2019 BMW i3 Electric Vehicle. This luxurious electric vehicle combines cutting-edge technology with a refined interior for a sustainable and opulent driving experience.	5	225
i4 2020	BMW1	Electric	2020	69900	Luxurious 2020 BMW i4 Electric Vehicle. Introducing the 2020 BMW i4 Electric Vehicle, where sustainability meets luxury. Immerse yourself in a refined interior and experience the latest in electric vehicle technology.	5	226
iX 2021	BMW1	Electric	2021	55000	Luxurious 2021 BMW iX Electric Vehicle. Step into the world of electric luxury with the 2021 BMW iX. Featuring a refined interior and advanced electric technology, this electric vehicle sets new standards in opulence and sustainability.	5	227
iX5 2022	BMW1	Electric	2022	102310	Luxurious 2022 BMW iX5 Electric Vehicle. Elevate your driving experience with the 2022 BMW iX5 Electric Vehicle. Immerse yourself in luxury with a refined interior and cutting-edge electric technology, setting new standards in sustainable opulence.	5	228
iX7 2023	BMW1	Electric	2023	105550	Luxurious 2023 BMW iX7 Electric Vehicle. Step into the world of electric luxury with the 2021 BMW iX7. Featuring a refined interior and advanced electric technology, this electric vehicle sets new standards in opulence and sustainability.	5	229
7 Series 2021	BMW1	Sedan	2021	72000	Experience elegance and power with the 2021 BMW 7 Series Sedan. Featuring a sophisticated interior and advanced driver-assistance systems, it sets new standards in opulent driving.	1	231
3 Series 2021	BMW1	Sedan	2021	58000	The 2021 BMW 3 Series Sedan combines style with performance. With its refined interior and advanced features, it offers a luxurious driving experience that captivates.	1	232
3 Series 2020	BMW1	Sedan	2020	55000	Introducing the 2020 BMW 3 Series Sedan, where sophistication meets comfort. Immerse yourself in luxury with its refined interior and cutting-edge technology.	1	233
X5 M 2022	BMW1	Off-Road	2022	120000	Conquer the off-road in style with the 2022 BMW X5 M. Immerse yourself in luxury with its refined interior and cutting-edge off-road capabilities.	1	235
X5 M 2021	BMW1	Off-Road	2021	115000	Embark on a journey of off-road luxury with the 2021 BMW X5 M. Featuring a refined interior and advanced off-road capabilities, this vehicle redefines the concept of rugged opulence.	1	236
X5 M 2020	BMW1	Off-Road	2020	110000	Luxurious 2020 BMW X5 M Off-Road Vehicle. Introducing the 2020 BMW X5 M, where ruggedness meets luxury. Immerse yourself in a refined interior and cutting-edge off-road features for the ultimate off-road experience.	1	237
\.


--
-- Data for Name: car_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_brand (brand) FROM stdin;
Mercedes-Benz
Hyundai
Toyota
Honda
BMW1
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
\.


--
-- Data for Name: car_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_type (type) FROM stdin;
Hatchback
SUV
Electric
Sedan
Off-Road
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
461
462
489
490
496
\.


--
-- Data for Name: federated_credentials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.federated_credentials (id, user_id, provider, subject) FROM stdin;
4	489	facebook	1587045301832696
5	496	https://accounts.google.com	116287136621512967237
\.


--
-- Data for Name: fix_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_detail (date, detail, price, fixdetail_id, fixrecord_id, ap_id, mec_id, "Status", quantity) FROM stdin;
2024-01-28	detail	150	24	16	13	491	Ok	3
\.


--
-- Data for Name: fix_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fix_record (fixrecord_id, car_plate, date, total_price, status, pay) FROM stdin;
17	59H-12345	2024-01-28	0	Processing	f
16	64K-12345	2024-01-28	150	Done	t
\.


--
-- Data for Name: fixed_car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fixed_car (car_plate, id) FROM stdin;
64K-12345	496
59H-12345	496
\.


--
-- Data for Name: mechanic; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mechanic (id) FROM stdin;
491
\.


--
-- Data for Name: sale_detail; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_detail (salerecord_id, car_id, quantity) FROM stdin;
323	247	2
324	257	1
\.


--
-- Data for Name: sale_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_record (salerecord_id, cus_id, date, total_price) FROM stdin;
323	496	2024-01-28	32000
324	496	2024-01-28	16000
\.


--
-- Data for Name: sales_assistant; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_assistant (id) FROM stdin;
492
\.


--
-- Data for Name: storage_manager; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.storage_manager (id) FROM stdin;
4
5
495
\.


--
-- Data for Name: user-session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user-session" (sid, sess, expire) FROM stdin;
1_nqe2qc7GNk3hRtvoklImGQhXQ60QwR	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":479,"permission":"ad","nameOfUser":"ad ad"}},"flash":{}}	2024-01-28 22:01:29
RdnsugAUZ32HGMCWhiqFWRbI10p4EdOZ	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{},"flash":{}}	2024-01-29 16:43:23
bkKTzaXdaiIcF3teIutaRA_jANNh1cOA	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":487,"permission":"cus","nameOfUser":"1 1"}},"flash":{}}	2024-01-29 12:29:38
LO6BzR-FhRGvKuHfz_8gyZ7WPrvaofbE	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":487,"permission":"cus","nameOfUser":"1 1"}},"flash":{}}	2024-01-29 13:22:45
0sdyw3xIvqFwkEKazRxpm4E-mQJn3Rda	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":488,"permission":"mec","nameOfUser":"2 2"}},"flash":{}}	2024-01-28 23:17:01
I2LlG0J1c4AJfNdjnjkawVThkEOuJoR4	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":487,"permission":"cus","nameOfUser":"1 1"}},"flash":{}}	2024-01-28 23:17:15
Pyic8aBdozuVFJx6SqLpGXUJcZXbypZI	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":487,"permission":"cus","nameOfUser":"1 1"}},"flash":{}}	2024-01-29 01:20:11
Ya2qETQDYTi1nh-g0BlgeKFbQb1AU0YM	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"}}	2024-01-29 20:15:19
PbL0q_eXosJYNb9xW9z8XwAcg3GAAJm5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":495,"permission":"sm","nameOfUser":"smm smm"}},"flash":{}}	2024-01-30 10:50:49
KTyztkCwYIXp_YAoV_fqgCAiKLUIoq-5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"flash":{}}	2024-01-30 00:48:15
1AeTzUtwxxv55dVQSesxRgX7ElhWZvbK	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":{"id":496,"permission":"cus","nameOfUser":"Xuân Nguyễn"}},"flash":{}}	2024-01-29 20:46:22
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_info (username, password, permission, id, firstname, phonenumber, dob, address, lastname) FROM stdin;
ad	$2b$10$oGFpSON.g0etVVnbtWC6rOXLlfHp.uqW1ZIM4xKcpsNEKGMOQbnNW	ad	479	ad	\N	2024-01-26		ad
\N	\N	cus	489	Nguyễn Phạm Phú Xuân	\N	\N	\N	\N
xuan	$2b$10$TSA6ouHnX96nvIbAS3FhxO9qq34FKOPiHJ8rQ7.lRHrY3PX1o0G9S	cus	490	xuan	0123456788	2024-01-24	hcm	nguyen
mec	$2b$10$N7xaQdAWHRE8vqp5DbNlDOQDEbblZ6frJ485qcDTqWdueI14cJK.m	mec	491	mec	0121321212	2024-01-08	sdfds	mec
saa	$2b$10$YNnULv9gerTXNNubl3Pu5utgrxVNNm/XDdUsRrtWN88PnGete/Ohi	sa	492	saa	0121455455	2024-01-28	sdfsdf	saa
smm	$2b$10$Vj797cHCPUG36V0AmGA1VOxVb.kNpUxim4u51k61VdlZ44y9YFtz2	sm	495	smm	0168468515	2024-01-28	hcm	smm
\N	\N	cus	496	Xuân Nguyễn	\N	\N	\N	\N
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

SELECT pg_catalog.setval('public.car_car_id_seq', 289, true);


--
-- Name: car_import_invoice_importinvoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_import_invoice_importinvoice_id_seq', 416, true);


--
-- Name: federated_credentials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.federated_credentials_id_seq', 5, true);


--
-- Name: fix_detail_fixdetail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fix_detail_fixdetail_id_seq', 24, true);


--
-- Name: fix_record_fixrecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fix_record_fixrecord_id_seq', 17, true);


--
-- Name: sale_record_salerecord_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_record_salerecord_id_seq', 324, true);


--
-- Name: user_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_info_id_seq', 496, true);


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
    ADD CONSTRAINT fk_brand FOREIGN KEY (brand) REFERENCES public.car_brand(brand) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


--
-- Name: car fk_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT fk_type FOREIGN KEY (type) REFERENCES public.car_type(type) ON UPDATE CASCADE ON DELETE CASCADE NOT VALID;


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

