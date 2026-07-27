package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * WebSocket message sent by a client to update the avatar position.
 *
 * @param perfilId  the child profile ID owning the avatar
 * @param x         horizontal position on the map
 * @param y         vertical position on the map
 * @param direccion facing direction (NORTE, SUR, ESTE, OESTE)
 */
public record DatosMovimientoAvatar(Long perfilId, Double x, Double y, String direccion) {
}
