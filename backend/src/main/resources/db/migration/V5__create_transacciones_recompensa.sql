CREATE TABLE transacciones_recompensa (
    id                      BIGSERIAL       PRIMARY KEY,
    perfil_id               BIGINT          NOT NULL,
    registro_consumo_id     BIGINT          NOT NULL,
    monedas_acreditadas     SMALLINT        NOT NULL,
    tipo                    VARCHAR(20)     NOT NULL CHECK (tipo IN ('CREDITO', 'DEBITO')),
    created_at              TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_recompensa_perfil FOREIGN KEY (perfil_id)
        REFERENCES perfiles_infantiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_recompensa_consumo FOREIGN KEY (registro_consumo_id)
        REFERENCES registros_consumo (id),
    CONSTRAINT uq_recompensa_consumo UNIQUE (registro_consumo_id)
);

CREATE INDEX idx_recompensa_perfil_id ON transacciones_recompensa (perfil_id);
