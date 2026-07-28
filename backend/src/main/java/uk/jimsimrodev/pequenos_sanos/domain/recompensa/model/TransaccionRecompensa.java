package uk.jimsimrodev.pequenos_sanos.domain.recompensa.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.model.RegistroConsumo;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * JPA entity representing an immutable ledger entry that records coins
 * credited to a child profile when a food consumption is validated.
 * The UNIQUE constraint on registro_consumo_id guarantees each consumption
 * can only generate one reward transaction (prevents duplicate credits).
 */
@Entity
@Table(name = "transacciones_recompensa")
public class TransaccionRecompensa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "perfil_id", nullable = false)
    private PerfilInfantil perfil;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "registro_consumo_id", nullable = false, unique = true)
    private RegistroConsumo registroConsumo;

    @Column(name = "monedas_acreditadas", nullable = false)
    private Short monedasAcreditadas;

    @Column(nullable = false, length = 20)
    private String tipo = "CREDITO";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Default constructor required by JPA. */
    protected TransaccionRecompensa() {
    }

    /**
     * Creates a CREDITO transaction for a validated food consumption.
     *
     * @param perfil           the child profile receiving the reward
     * @param registroConsumo  the validated consumption record (must be unique)
     * @param monedasAcreditadas the number of coins to credit
     */
    public TransaccionRecompensa(PerfilInfantil perfil,
                                  RegistroConsumo registroConsumo,
                                  Short monedasAcreditadas) {
        this.perfil = Objects.requireNonNull(perfil, "perfil must not be null");
        this.registroConsumo = Objects.requireNonNull(registroConsumo, "registroConsumo must not be null");
        this.monedasAcreditadas = Objects.requireNonNull(monedasAcreditadas, "monedasAcreditadas must not be null");
        this.createdAt = LocalDateTime.now();
    }

    // --- Getters ---

    public Long getId() { return id; }
    public PerfilInfantil getPerfil() { return perfil; }
    public RegistroConsumo getRegistroConsumo() { return registroConsumo; }
    public Short getMonedasAcreditadas() { return monedasAcreditadas; }
    public String getTipo() { return tipo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
