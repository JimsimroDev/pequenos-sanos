package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * Current state of a single avatar on the game map.
 *
 * @param perfilId  the child profile ID
 * @param nombre    the child's display name
 * @param x         horizontal position
 * @param y         vertical position
 * @param direccion facing direction
 * @param color     avatar color hex string
 */
public record AvatarState(Long perfilId, String nombre, Double x, Double y, String direccion, String color) {
}
