CREATE TABLE alimentos (
    id              BIGSERIAL       PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    categoria       VARCHAR(50)     NOT NULL CHECK (categoria IN ('FRUTA', 'VERDURA', 'PROTEINA', 'CEREAL')),
    descripcion     TEXT,
    puntos_reward   SMALLINT        NOT NULL DEFAULT 10,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Seed data: frutas
INSERT INTO alimentos (nombre, categoria, descripcion, puntos_reward) VALUES
('Manzana', 'FRUTA', 'Manzana roja o verde fresca', 10),
('Banana', 'FRUTA', 'Banana madura rica en potasio', 10),
('Fresa', 'FRUTA', 'Fresas frescas ricas en vitamina C', 15);

-- Seed data: verduras
INSERT INTO alimentos (nombre, categoria, descripcion, puntos_reward) VALUES
('Brocoli', 'VERDURA', 'Brocoli al vapor o cocido', 15),
('Zanahoria', 'VERDURA', 'Zanahoria cruda o cocida', 10),
('Espinaca', 'VERDURA', 'Espinaca fresca o cocida', 15);

-- Seed data: proteinas
INSERT INTO alimentos (nombre, categoria, descripcion, puntos_reward) VALUES
('Pollo', 'PROTEINA', 'Pechuga de pollo cocida o a la plancha', 20),
('Huevo', 'PROTEINA', 'Huevo cocido o revuelto', 15),
('Pescado', 'PROTEINA', 'Filete de pescado blanco cocido', 20);

-- Seed data: cereales
INSERT INTO alimentos (nombre, categoria, descripcion, puntos_reward) VALUES
('Avena', 'CEREAL', 'Avena cocida en agua o leche', 10),
('Arroz integral', 'CEREAL', 'Arroz integral cocido', 10),
('Pan integral', 'CEREAL', 'Rebanada de pan integral', 10);
