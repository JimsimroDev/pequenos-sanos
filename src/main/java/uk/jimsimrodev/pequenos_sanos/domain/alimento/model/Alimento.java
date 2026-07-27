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

    protected Alimento() {
    }

    /**
     * Creates a new Alimento.
     *
     * @param nombre       the food item name
     * @param categoria    the food category
     * @param puntosReward reward points granted when consumed
     */
    public Alimento(String nombre, CategoriaAlimento categoria, Short puntosReward) {
        this.nombre = Objects.requireNonNull(nombre);
        this.categoria = Objects.requireNonNull(categoria);
        this.puntosReward = Objects.requireNonNull(puntosReward);
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public CategoriaAlimento getCategoria() { return categoria; }
    public String getDescripcion() { return descripcion; }
    public Short getPuntosReward() { return puntosReward; }
    public Boolean getActivo() { return activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
