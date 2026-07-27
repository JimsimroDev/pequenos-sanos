package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

import java.util.List;

/**
 * Broadcast payload sent to all clients showing the current map state.
 *
 * @param timestamp server timestamp in milliseconds
 * @param avatares  list of all active avatar states
 */
public record DatosEstadoMapa(long timestamp, List<AvatarState> avatares) {
}
