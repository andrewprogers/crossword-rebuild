drop table if exists puzzles;

create table puzzles (
    id int not null primary key generated always as identity,
    user_id varchar(50), -- nullable b/c of default puzzles
    title varchar(50) not null,
    size int not null,
    grid text not null,
    date date not null,
    notes text,
    draft boolean not null default(False),
    draft_clues_json text,

    created_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id)
        ON DELETE SET NULL -- if the user is deleted, do not delete the puzzle
);
