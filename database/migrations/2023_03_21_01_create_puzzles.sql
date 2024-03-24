drop table if exists answers;
drop table if exists puzzles;

create table puzzles (
    id int not null primary key generated always as identity,
    user_id varchar(50), -- nullable b/c of default puzzles
    title varchar(50) not null,
    num_rows int not null,
    num_cols int not null,
    grid jsonb not null,
    date date not null,
    notes text,
    draft boolean not null default(true),
    draft_clues jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id)
        ON DELETE SET NULL -- if the user is deleted, do not delete the puzzle
);

create table answers (
    -- PK
    puzzle_id int not null,
    is_across boolean not null,
    gridnum int not null,
    primary key(puzzle_id, is_across, gridnum),

    -- other columns
    clue text not null,
    answer text not null,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),

    CONSTRAINT fk_puzzle
        FOREIGN KEY(puzzle_id) REFERENCES puzzles(id)
        ON DELETE CASCADE
);
