package uk.jimsimrodev.pequenos_sanos.domain.consumo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Objects;

/**
 * JPA entity representing a record of a child consuming a specific food item.
 * The UNIQUE constraint (perfil_id, alimento_id, fecha_consumo) prevents
 * the same food from being registered more than once per day per child profile.
 */
@Entity
@Table(name = "registros_consumo")
public class RegistroConsumo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "perfil_id", nullable = false)
    private PerfilInfantil perfil;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alimento_id", nullable = false)
    private Alimento alimento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registrado_por", nullable = false)
    private Usuario registradoPor;

    @Column(name = "fecha_consumo", nullable = false)
    private LocalDate fechaConsumo;

    @Column(name = "hora_consumo", nullable = false)
    private LocalTime horaConsumo;

    @Column(nullable = false)
    private Boolean procesado = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Default constructor required by JPA. */
    protected RegistroConsumo() {
    }

    /**
     * Creates a new RegistroConsumo for today's date.
     *
     * @param perfil       the child profile that consumed the food
     * @param alimento     the food item consumed
     * @param registradoPor the parent/tutor who registered the consumption
     */
    public RegistroConsumo(PerfilInfantil perfil, Alimento alimento, Usuario registradoPor) {
        this.perfil = Objects.requireNonNull(perfil, "perfil must not be null");
        this.alimento = Objects.requireNonNull(alimento, "alimento must not be null");
        this.registradoPor = Objects.requireNonNull(registradoPor, "registradoPor must not be null");
        this.fechaConsumo = LocalDate.now();
        this.horaConsumo = LocalTime.now();
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public PerfilInfantil getPerfil() { return perfil; }
    public Alimento getAlimento() { return alimento; }
    public Usuario getRegistradoPor() { return registradoPor; }
    public LocalDate getFechaConsumo() { return fechaConsumo; }
    public LocalTime getHoraConsumo() { return horaConsumo; }
    public Boolean getProcesado() { return procesado; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // --- Setters for mutable fields ---

    public void setProcesado(Boolean procesado) {
        this.procesado = procesado;
    }
}
