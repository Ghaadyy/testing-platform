CREATE TABLE "TestFiles"
(
    name character varying NOT NULL PRIMARY KEY,
    content character varying NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);