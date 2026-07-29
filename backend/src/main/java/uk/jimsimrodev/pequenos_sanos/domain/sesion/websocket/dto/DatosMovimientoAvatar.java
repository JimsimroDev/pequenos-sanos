package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * WebSocket message sent by a client to update the avatar position.
 *
 * @param perfilId     the child profile ID owning the avatar
 * @param nombre       the child's display name (sent on first move and
 *                     periodically)
 * @param x            horizontal position on the map
 * @param y            vertical position on the map
 * @param direccion    facing direction
 * @param color        avatar color hex string (e.g. "#ef4444")
 * @param avatarCodigo the selected pony/character code (e.g. "TWILIGHT")
 */
public record DatosMovimientoAvatar(Long perfilId, String nombre, Double x, Double y, String direccion, String color, String avatarCodigo) {
}
