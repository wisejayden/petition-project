DROP TABLE IF EXISTS petition;

CREATE TABLE petition (
    id SERIAL primary key,
    first VARCHAR(300) not null,
    last VARCHAR(300) not null,
    signature TEXT,
    email VARCHAR(300) not null,
    hashed_pass VARCHAR(300) not null,
    created TIMESTAMP
);


-- psql petition -f schema.sql
-- psql -d petition
