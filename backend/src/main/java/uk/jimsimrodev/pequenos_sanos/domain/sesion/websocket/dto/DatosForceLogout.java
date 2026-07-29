package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * Force logout signal sent when the daily screen time limit is reached.
 *
 * @param codigo   error code (e.g., TIME_EXPIRED)
 * @param mensaje  human-readable message for the client
 */
public record DatosForceLogout(String codigo, String mensaje) {
}
