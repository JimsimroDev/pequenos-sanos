ALTER TABLE perfiles_infantiles
    ADD COLUMN sesiones_extra_hoy SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE perfiles_infantiles
    ADD COLUMN sesiones_extra_compradas SMALLINT NOT NULL DEFAULT 0;
