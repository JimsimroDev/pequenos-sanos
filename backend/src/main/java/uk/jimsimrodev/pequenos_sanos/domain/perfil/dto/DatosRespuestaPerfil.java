package uk.jimsimrodev.pequenos_sanos.domain.perfil.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import uk.jimsimrodev.pequenos_sanos.domain.perfil.model.PerfilInfantil;

/**
 * Response DTO with child profile data.
 *
 * @param id                   the profile's unique identifier
 * @param nombre               the child's display name
 * @param edadAnios            the child's age in years
 * @param avatarCodigo         the selected avatar code
 * @param screenTimeLimit      daily screen time limit in minutes
 * @param sesionesExtraHoy     extra sessions granted for today
 * @param sesionesExtraCompradas total extra sessions purchased (future)
 * @param monedasSaldo         current coin balance
 */
@Schema(description = "Datos del perfil infantil")
public record DatosRespuestaPerfil(

        @Schema(description = "ID del perfil", example = "1")
        Long id,

        @Schema(description = "Nombre del perfil", example = "Lucía")
        String nombre,

        @Schema(description = "Edad del niño en años", example = "3")
        Short edadAnios,

        @Schema(description = "Código del avatar asignado", example = "AVATAR_01")
        String avatarCodigo,

        @Schema(description = "Límite diario de pantalla en minutos", example = "30")
        Short screenTimeLimit,

        @Schema(description = "Sesiones extra disponibles hoy", example = "0")
        Short sesionesExtraHoy,

        @Schema(description = "Sesiones extra compradas (total acumulado)", example = "0")
        Short sesionesExtraCompradas,

        @Schema(description = "Saldo actual de monedas del perfil", example = "150")
        Integer monedasSaldo
) {
    /**
     * Factory method to build a response DTO from a PerfilInfantil entity.
     *
     * @param perfil the entity to map
     * @return a populated DatosRespuestaPerfil record
     */
    public static DatosRespuestaPerfil from(PerfilInfantil perfil) {
        return new DatosRespuestaPerfil(
                perfil.getId(),
                perfil.getNombre(),
                perfil.getEdadAnios(),
                perfil.getAvatarCodigo(),
                perfil.getScreenTimeLimit(),
                perfil.getSesionesExtraHoy(),
                perfil.getSesionesExtraCompradas(),
                perfil.getMonedasSaldo()
        );
    }
}
