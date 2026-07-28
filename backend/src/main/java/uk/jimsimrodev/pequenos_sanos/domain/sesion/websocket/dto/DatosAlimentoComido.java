package uk.jimsimrodev.pequenos_sanos.domain.sesion.websocket.dto;

/**
 * WebSocket event broadcast when a player collects a food item.
 * All clients use this to remove the food from their local map.
 *
 * @param alimentoId  the ID of the collected food item
 * @param perfilId    the profile ID of the player who collected it
 * @param nombre      display name of the player
 */
public record DatosAlimentoComido(Long alimentoId, Long perfilId, String nombre) {
}
