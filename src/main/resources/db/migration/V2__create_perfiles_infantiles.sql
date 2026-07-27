CREATE TABLE perfiles_infantiles (
    id                  BIGSERIAL       PRIMARY KEY,
    usuario_id          BIGINT          NOT NULL,
    nombre              VARCHAR(80)     NOT NULL,
    edad_anios          SMALLINT        NOT NULL CHECK (edad_anios BETWEEN 2 AND 4),
    avatar_codigo       VARCHAR(50),
    screen_time_limit   SMALLINT        NOT NULL DEFAULT 15 CHECK (screen_time_limit BETWEEN 5 AND 60),
    monedas_saldo       INTEGER         NOT NULL DEFAULT 0 CHECK (monedas_saldo >= 0),
    activo              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP,

    CONSTRAINT fk_perfiles_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX idx_perfiles_usuario_id ON perfiles_infantiles (usuario_id);
