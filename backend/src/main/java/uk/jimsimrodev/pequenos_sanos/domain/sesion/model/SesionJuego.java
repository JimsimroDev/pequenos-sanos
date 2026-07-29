package uk.jimsimrodev.pequenos_sanos.domain.sesion.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * JPA entity representing a child's game session on a given day.
 * The UNIQUE constraint on (perfil_id, fecha_sesion) guarantees one session per day per profile.
 */
@Entity
@Table(name = "sesiones_juego")
public class SesionJuego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "perfil_id", nullable = false)
    private PerfilInfantil perfil;

    @Column(name = "fecha_sesion", nullable = false)
    private LocalDate fechaSesion;

    @Column(nullable = false)
    private LocalDateTime inicio;

    @Column
    private LocalDateTime fin;

    @Column(name = "minutos_jugados", nullable = false)
    private Short minutosJugados = 0;

    @Column(name = "cerrada_por", length = 30)
    private String cerradaPor;

    /** Default constructor required by JPA. */
    protected SesionJuego() {
    }

    /**
     * Creates a new SesionJuego for today.
     *
     * @param perfil the child profile starting the session
     */
    public SesionJuego(PerfilInfantil perfil) {
        this.perfil = Objects.requireNonNull(perfil, "perfil must not be null");
        this.fechaSesion = LocalDate.now();
        this.inicio = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public PerfilInfantil getPerfil() { return perfil; }
    public LocalDate getFechaSesion() { return fechaSesion; }
    public LocalDateTime getInicio() { return inicio; }
    public LocalDateTime getFin() { return fin; }
    public Short getMinutosJugados() { return minutosJugados; }
    public String getCerradaPor() { return cerradaPor; }

    // --- Setters ---

    public void setInicio(LocalDateTime inicio) { this.inicio = inicio; }
    public void setFin(LocalDateTime fin) { this.fin = fin; }
    public void setMinutosJugados(Short minutosJugados) { this.minutosJugados = minutosJugados; }
    public void setCerradaPor(String cerradaPor) { this.cerradaPor = cerradaPor; }
}
