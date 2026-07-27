package uk.jimsimrodev.pequenos_sanos.domain.recompensa.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * Response DTO for a reward transaction (coin credit entry).
 *
 * @param id                 the transaction's unique identifier
 * @param monedasAcreditadas coins credited in this transaction
 * @param tipo               transaction type (CREDITO or DEBITO)
 * @param createdAt          when the transaction was created
 * @param nombreAlimento     name of the food that triggered the reward
 */
@Schema(description = "Datos de una transacción de recompensa")
public record DatosRespuestaRecompensa(

        @Schema(description = "ID de la transacción", example = "1")
        Long id,

        @Schema(description = "Monedas acreditadas", example = "15")
        Short monedasAcreditadas,

        @Schema(description = "Tipo de transacción", example = "CREDITO")
        String tipo,

        @Schema(description = "Fecha y hora de la transacción")
        LocalDateTime createdAt,

        @Schema(description = "Nombre del alimento que generó la recompensa", example = "Brócoli")
        String nombreAlimento
) {
}
