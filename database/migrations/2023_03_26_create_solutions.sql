drop index if exists idx_solutions_user_puzzle;
drop table if exists solutions;

create table solutions (
    id int not null primary key generated always as identity,
    puzzle_id int not null,
    user_id varchar(50) not null,
    user_answers jsonb,
    correct boolean not null default(false),
    created_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT (current_timestamp),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id)
        ON DELETE cascade,

    CONSTRAINT fk_puzzle
        FOREIGN KEY(puzzle_id) REFERENCES puzzles(id)
        ON DELETE CASCADE,

    UNIQUE (puzzle_id, user_id)
);

CREATE INDEX idx_solutions_user_puzzle on solutions(user_id, puzzle_id);