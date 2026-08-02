package uk.jimsimrodev.pequenos_sanos.domain.recompensa.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.jimsimrodev.pequenos_sanos.domain.consumo.repositories.IRegistroConsumoRepository;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.repositories.IPerfilInfantilRepository;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosAlimentoFrecuente;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosMonedasPorDia;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosReporteDashboard;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosReportePerfil;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosSesionHoy;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto.DatosSesionPorDia;
import uk.jimsimrodev.pequenos_sanos.domain.recompensa.repositories.ITransaccionRecompensaRepository;
import uk.jimsimrodev.pequenos_sanos.domain.sesion.repositories.ISesionJuegoRepository;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import java.util.stream.Collectors;

/**
 * Service computing the aggregate dashboard report for all the authenticated
 * parent's active child profiles.
 */
@Service
public class ReporteService {

    private final IPerfilInfantilRepository perfilRepository;
    private final IRegistroConsumoRepository consumoRepository;
    private final ITransaccionRecompensaRepository recompensaRepository;
    private final ISesionJuegoRepository sesionRepository;

    /**
     * Creates the service with required repositories.
     *
     * @param perfilRepository     child profile repository
     * @param consumoRepository    consumption record repository
     * @param recompensaRepository reward transaction repository
     * @param sesionRepository     game session repository
     */
    public ReporteService(IPerfilInfantilRepository perfilRepository,
                          IRegistroConsumoRepository consumoRepository,
                          ITransaccionRecompensaRepository recompensaRepository,
                          ISesionJuegoRepository sesionRepository) {
        this.perfilRepository = perfilRepository;
        this.consumoRepository = consumoRepository;
        this.recompensaRepository = recompensaRepository;
        this.sesionRepository = sesionRepository;
    }

    /**
     * Computes the dashboard report for every active profile of the given parent.
     *
     * @param usuarioId the authenticated parent's user ID
     * @return aggregate report with one entry per active profile
     */
    @Transactional(readOnly = true)
    public DatosReporteDashboard obtenerDashboardDelPadre(Long usuarioId) {
        final var hoy = LocalDate.now();

        final var perfiles = perfilRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .stream()
                .map(perfil -> buildPerfil(perfil, hoy))
                .toList();

        return new DatosReporteDashboard(perfiles);
    }

    private DatosReportePerfil buildPerfil(PerfilInfantil perfil, LocalDate hoy) {
        final var perfilId = perfil.getId();

        final var consumos = consumoRepository.findByPerfilIdOrderByCreatedAtDesc(perfilId);
        final var transacciones = recompensaRepository.findByPerfilIdOrderByCreatedAtDesc(perfilId);
        final var sesiones = sesionRepository.findByPerfilIdOrderByFechaSesionDesc(perfilId);

        final var alimentosDelDia = consumos.stream()
                .filter(c -> c.getFechaConsumo().equals(hoy))
                .map(c -> c.getAlimento().getNombre())
                .toList();

        final var monedasGanadasHoy = transacciones.stream()
                .filter(t -> t.getCreatedAt().toLocalDate().equals(hoy))
                .mapToInt(t -> t.getMonedasAcreditadas())
                .sum();

        final var sesionHoy = sesiones.stream()
                .filter(s -> s.getFechaSesion().equals(hoy))
                .findFirst()
                .map(s -> new DatosSesionHoy(
                        s.getMinutosJugados(),
                        perfil.getScreenTimeLimit(),
                        (short) Math.max(0, perfil.getScreenTimeLimit() - s.getMinutosJugados()),
                        s.getFin() == null ? "ACTIVA" : "CERRADA"))
                .orElseGet(() -> new DatosSesionHoy(
                        (short) 0,
                        perfil.getScreenTimeLimit(),
                        perfil.getScreenTimeLimit(),
                        "SIN_SESION"));

        final var historialMonedas = transacciones.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCreatedAt().toLocalDate(),
                        Collectors.summingInt(t -> t.getMonedasAcreditadas())))
                .entrySet().stream()
                .sorted(Map.Entry.<LocalDate, Integer>comparingByKey(Comparator.reverseOrder()))
                .map(e -> new DatosMonedasPorDia(e.getKey(), e.getValue()))
                .toList();

        final var historialSesiones = sesiones.stream()
                .map(s -> new DatosSesionPorDia(s.getFechaSesion(), s.getMinutosJugados()))
                .toList();

        final var alimentosFrecuentes = consumos.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAlimento().getNombre(),
                        Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(e -> new DatosAlimentoFrecuente(e.getKey(), e.getValue()))
                .toList();

        final var monedasTotalesGanadas = transacciones.stream()
                .mapToInt(t -> t.getMonedasAcreditadas())
                .sum();

        final var diasActivos = new TreeSet<LocalDate>();
        sesiones.forEach(s -> diasActivos.add(s.getFechaSesion()));
        consumos.forEach(c -> diasActivos.add(c.getFechaConsumo()));

        return new DatosReportePerfil(
                perfil.getId(),
                perfil.getNombre(),
                perfil.getEdadAnios(),
                perfil.getAvatarCodigo(),
                perfil.getMonedasSaldo(),
                monedasGanadasHoy,
                alimentosDelDia,
                sesionHoy,
                perfil.getSesionesExtraHoy(),
                perfil.getSesionesExtraCompradas(),
                monedasTotalesGanadas,
                (long) diasActivos.size(),
                historialMonedas,
                historialSesiones,
                alimentosFrecuentes);
    }
}
