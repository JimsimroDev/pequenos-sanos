package uk.jimsimrodev.pequenos_sanos.domain.alimento.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * JPA entity representing a food item in the nutritional catalogue.
 * Food items are pre-seeded via Flyway and managed by administrators.
 */
@Entity
@Table(name = "alimentos")
public class Alimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategoriaAlimento categoria;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "puntos_reward", nullable = false)
    private Short puntosReward = 10;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Default constructor required by JPA. */
    protected Alimento() {
    }

    /**
     * Creates a new Alimento entry.
     *
     * @param nombre       the food item name
     * @param categoria    the food category
     * @param puntosReward reward points granted when this food is consumed
     */
    public Alimento(String nombre, CategoriaAlimento categoria, Short puntosReward) {
        this.nombre = Objects.requireNonNull(nombre, "nombre must not be null");
        this.categoria = Objects.requireNonNull(categoria, "categoria must not be null");
        this.puntosReward = Objects.requireNonNull(puntosReward, "puntosReward must not be null");
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public CategoriaAlimento getCategoria() { return categoria; }
    public String getDescripcion() { return descripcion; }
    public Short getPuntosReward() { return puntosReward; }
    public Boolean getActivo() { return activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // --- Setters ---

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
