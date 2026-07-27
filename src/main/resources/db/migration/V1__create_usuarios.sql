CREATE TABLE usuarios (
    id              BIGSERIAL       PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    rol             VARCHAR(20)     NOT NULL DEFAULT 'PADRE' CHECK (rol IN ('PADRE', 'NINO')),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP,

    CONSTRAINT uq_usuarios_email UNIQUE (email)
);

CREATE INDEX idx_usuarios_email ON usuarios (email);
