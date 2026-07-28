package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * Timer update sent every 10 seconds to the child's session client.
 *
 * @param minutosRestantes  remaining minutes today
 * @param segundosRestantes remaining seconds within the current minute
 */
public record DatosTimerUpdate(int minutosRestantes, int segundosRestantes) {
}
