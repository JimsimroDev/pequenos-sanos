CREATE TABLE sesiones_juego (
    id              BIGSERIAL       PRIMARY KEY,
    perfil_id       BIGINT          NOT NULL,
    fecha_sesion    DATE            NOT NULL,
    inicio          TIMESTAMP       NOT NULL,
    fin             TIMESTAMP,
    minutos_jugados SMALLINT        NOT NULL DEFAULT 0,
    cerrada_por     VARCHAR(30),

    CONSTRAINT fk_sesion_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles_infantiles (id) ON DELETE CASCADE,
    CONSTRAINT uq_sesion_diaria UNIQUE (perfil_id, fecha_sesion)
);

CREATE INDEX idx_sesion_perfil_fecha ON sesiones_juego (perfil_id, fecha_sesion);
