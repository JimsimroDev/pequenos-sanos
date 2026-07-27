CREATE TABLE registros_consumo (
    id              BIGSERIAL       PRIMARY KEY,
    perfil_id       BIGINT          NOT NULL,
    alimento_id     BIGINT          NOT NULL,
    registrado_por  BIGINT          NOT NULL,
    fecha_consumo   DATE            NOT NULL,
    hora_consumo    TIME            NOT NULL,
    procesado       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_consumo_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles_infantiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_consumo_alimento FOREIGN KEY (alimento_id)
        REFERENCES alimentos (id),
    CONSTRAINT fk_consumo_registrado_por FOREIGN KEY (registrado_por)
        REFERENCES usuarios (id),
    CONSTRAINT uq_consumo_diario UNIQUE (perfil_id, alimento_id, fecha_consumo)
);

CREATE INDEX idx_consumo_perfil_id ON registros_consumo (perfil_id);
CREATE INDEX idx_consumo_fecha ON registros_consumo (perfil_id, fecha_consumo);
