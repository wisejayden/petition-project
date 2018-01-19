DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;


CREATE TABLE signatures (
        id SERIAL primary key,
        signature TEXT,
        user_id INTEGER not null,
        created TIMESTAMP
);

CREATE TABLE users (
    id SERIAL primary key,
    first VARCHAR(300) not null,
    last VARCHAR(300) not null,
    email VARCHAR(300) unique not null,
    hashed_pass VARCHAR(300) not null,
    created TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    user_id INTEGER not null,
    age VARCHAR(300),
    city VARCHAR(300),
    url VARCHAR(300)
);

-- CREATE TABLE petition (
--     id SERIAL primary key,
--     first VARCHAR(300) not null,
--     last VARCHAR(300) not null,
--     signature TEXT,
--     email VARCHAR(300) not null,
--     hashed_pass VARCHAR(300) not null,
--     created TIMESTAMP
-- );


-- psql petition -f schema.sql
-- psql -d petition
