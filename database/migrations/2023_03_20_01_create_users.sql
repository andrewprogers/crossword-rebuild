drop table if exists users;

create table users (
    id varchar(50) not null primary key,
    email text not null,
    given_name text,
    family_name text,
    picture_url text,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp)
);
