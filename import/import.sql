\connect wmata_d3 wmata_d3;

create extension postgis;

create table stations_staging (
    values text
);

create table stations (
    code varchar(8),
    name varchar(64),
    station_together_1 varchar(8),
    point geography(point,4326),
    primary key(code)
);

create table lines_staging (
    values text
);

create table lines (
    line_code varchar(8),
    display_name varchar(16),
    start_station_code varchar(8),
    end_station_code varchar(8),
    internal_destination_1 varchar(8),
    internal_destination_2 varchar(8),
    client_x_scalar smallint,
    client_y_scalar smallint,
    label_text_color varchar(8)
);

\copy stations_staging from data/stations.json;
\copy lines_staging from data/lines.json;

with t as (
    select
        json_array_elements(values::json->'Stations')::json->'Code' as code,
        json_array_elements(values::json->'Stations')::json->'Name' as name,
        json_array_elements(values::json->'Stations')::json->'StationTogether1' as station_together_1,
        json_array_elements(values::json->'Stations')::json->'Lat' as lat,
        json_array_elements(values::json->'Stations')::json->'Lon' as long
    from stations_staging
)
insert into stations (code, name, station_together_1, point)
select 
    replace(code::text, '"', ''), 
    replace(name::text, '"', ''),
    replace(station_together_1::text, '"', ''),
    format('SRID=4326;POINT(%s %s)', lat, long)::geography
from t;

with t as (
    select
        json_array_elements(values::json->'Lines')::json->'LineCode' as line_code,
        json_array_elements(values::json->'Lines')::json->'DisplayName' as display_name,
        json_array_elements(values::json->'Lines')::json->'StartStationCode' as start_station_code,
        json_array_elements(values::json->'Lines')::json->'EndStationCode' as end_station_code,
        json_array_elements(values::json->'Lines')::json->'InternalDestination1' as internal_destination_1,
        json_array_elements(values::json->'Lines')::json->'InternalDestination2' as internal_destination_2
    from lines_staging
)
insert into lines (line_code, display_name, start_station_code, end_station_code,
                   internal_destination_1, internal_destination_2)
select
    replace(line_code::text, '"', ''),
    replace(display_name::text, '"', ''),
    replace(start_station_code::text, '"', ''),
    replace(end_station_code::text, '"', ''),
    replace(internal_destination_1::text, '"', ''),
    replace(internal_destination_2::text, '"', '')
from t;

update lines set client_x_scalar = 4, client_y_scalar = 2, label_text_color = '#fff' where line_code = 'RD';
update lines set client_x_scalar = -1, client_y_scalar = -2, label_text_color = '#fff' where line_code = 'BL';
update lines set client_x_scalar = 3, client_y_scalar = 1, label_text_color = '#fff' where line_code = 'GR';
update lines set client_x_scalar = 3, client_y_scalar = 3, label_text_color = '#000' where line_code = 'YL';
update lines set client_x_scalar = 1, client_y_scalar = -2, label_text_color = '#000' where line_code = 'OR';
update lines set client_x_scalar = 1, client_y_scalar = -2, label_text_color = '#000' where line_code = 'SV';
