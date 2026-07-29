package uk.jimsimrodev.pequenos_sanos.domain.perfil.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import uk.jimsimrodev.pequenos_sanos.domain.auth.model.Usuario;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * JPA entity representing a child profile linked to a parent/tutor user.
 * Each parent can have multiple child profiles with individual screen time limits.
 */
@Entity
@Table(name = "perfiles_infantiles")
public class PerfilInfantil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(name = "edad_anios", nullable = false)
    private Short edadAnios;

    @Column(name = "avatar_codigo", length = 50)
    private String avatarCodigo;

    @Column(name = "screen_time_limit", nullable = false)
    private Short screenTimeLimit = 15;

    @Column(name = "sesiones_extra_hoy", nullable = false)
    private Short sesionesExtraHoy = 0;

    @Column(name = "sesiones_extra_compradas", nullable = false)
    private Short sesionesExtraCompradas = 0;

    @Column(name = "monedas_saldo", nullable = false)
    private Integer monedasSaldo = 0;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Default constructor required by JPA. */
    protected PerfilInfantil() {
    }

    /**
     * Creates a new PerfilInfantil linked to a parent user.
     *
     * @param usuario         the parent/tutor who owns this profile
     * @param nombre          the child's display name
     * @param edadAnios       the child's age in years (2–4)
     * @param screenTimeLimit daily screen time limit in minutes (5–60)
     */
    public PerfilInfantil(Usuario usuario, String nombre, Short edadAnios, Short screenTimeLimit) {
        this.usuario = Objects.requireNonNull(usuario, "usuario must not be null");
        this.nombre = Objects.requireNonNull(nombre, "nombre must not be null");
        this.edadAnios = Objects.requireNonNull(edadAnios, "edadAnios must not be null");
        this.screenTimeLimit = Objects.requireNonNull(screenTimeLimit, "screenTimeLimit must not be null");
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public String getNombre() { return nombre; }
    public Short getEdadAnios() { return edadAnios; }
    public String getAvatarCodigo() { return avatarCodigo; }
    public Short getScreenTimeLimit() { return screenTimeLimit; }
    public Short getSesionesExtraHoy() { return sesionesExtraHoy; }
    public Short getSesionesExtraCompradas() { return sesionesExtraCompradas; }
    public Integer getMonedasSaldo() { return monedasSaldo; }
    public Boolean getActivo() { return activo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // --- Setters for mutable fields ---

    public void setNombre(String nombre) {
        this.nombre = nombre;
        this.updatedAt = LocalDateTime.now();
    }

    public void setEdadAnios(Short edadAnios) {
        this.edadAnios = edadAnios;
        this.updatedAt = LocalDateTime.now();
    }

    public void setAvatarCodigo(String avatarCodigo) {
        this.avatarCodigo = avatarCodigo;
        this.updatedAt = LocalDateTime.now();
    }

    public void setScreenTimeLimit(Short screenTimeLimit) {
        this.screenTimeLimit = screenTimeLimit;
        this.updatedAt = LocalDateTime.now();
    }

    public void setSesionesExtraHoy(Short sesionesExtraHoy) {
        this.sesionesExtraHoy = sesionesExtraHoy;
        this.updatedAt = LocalDateTime.now();
    }

    public void setSesionesExtraCompradas(Short sesionesExtraCompradas) {
        this.sesionesExtraCompradas = sesionesExtraCompradas;
        this.updatedAt = LocalDateTime.now();
    }

    public void setMonedasSaldo(Integer monedasSaldo) {
        this.monedasSaldo = monedasSaldo;
        this.updatedAt = LocalDateTime.now();
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
        this.updatedAt = LocalDateTime.now();
    }
}
