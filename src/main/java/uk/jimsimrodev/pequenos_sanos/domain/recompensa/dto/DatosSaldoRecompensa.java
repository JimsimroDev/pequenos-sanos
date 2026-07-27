package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response DTO with the current coin balance of a child profile.
 *
 * @param perfilId     the child profile's ID
 * @param nombrePerfil the child's display name
 * @param saldo        current coin balance
 */
@Schema(description = "Saldo actual de monedas de un perfil infantil")
public record DatosSaldoRecompensa(

        @Schema(description = "ID del perfil", example = "1")
        Long perfilId,

        @Schema(description = "Nombre del perfil", example = "Lucía")
        String nombrePerfil,

        @Schema(description = "Saldo de monedas", example = "150")
        Integer saldo
) {
}
