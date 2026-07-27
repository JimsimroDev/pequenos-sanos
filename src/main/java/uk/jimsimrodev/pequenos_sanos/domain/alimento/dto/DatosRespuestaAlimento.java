package uk.jimsimrodev.pequenos_sanos.domain.alimento.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;

/**
 * Response DTO for a food item in the nutritional catalogue.
 *
 * @param id          the food item's unique identifier
 * @param nombre      the food item name
 * @param categoria   the food category
 * @param descripcion optional description
 * @param puntosReward reward points granted on consumption
 */
@Schema(description = "Datos de un alimento del catálogo nutricional")
public record DatosRespuestaAlimento(

        @Schema(description = "ID del alimento", example = "1")
        Long id,

        @Schema(description = "Nombre del alimento", example = "Manzana")
        String nombre,

        @Schema(description = "Categoría nutricional", example = "FRUTA")
        CategoriaAlimento categoria,

        @Schema(description = "Descripción del alimento", example = "Manzana roja o verde fresca")
        String descripcion,

        @Schema(description = "Puntos de recompensa al consumirlo", example = "10")
        Short puntosReward
) {
    /**
     * Factory method to build a response DTO from an Alimento entity.
     *
     * @param alimento the entity to map
     * @return a populated DatosRespuestaAlimento record
     */
    public static DatosRespuestaAlimento from(Alimento alimento) {
        return new DatosRespuestaAlimento(
                alimento.getId(),
                alimento.getNombre(),
                alimento.getCategoria(),
                alimento.getDescripcion(),
                alimento.getPuntosReward()
        );
    }
}
