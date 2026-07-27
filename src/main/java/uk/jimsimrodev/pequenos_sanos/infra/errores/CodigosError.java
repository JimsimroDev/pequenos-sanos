package uk.jimsimrodev.pequenos_sanos.infra.errores;

/**
 * Constants for business error codes used in {@link uk.jimsimrodev.pequenos_sanos.infra.Result.Error}.
 * These codes are returned to the client as part of 422 Unprocessable Entity responses.
 */
public final class CodigosError {

    private CodigosError() {
        // Utility class — no instantiation
    }

    /** The food item does not exist in the catalogue. */
    public static final String ALIMENTO_NO_ENCONTRADO = "ALIMENTO_NO_ENCONTRADO";

    /** The child profile does not exist or does not belong to the authenticated parent. */
    public static final String PERFIL_NO_ENCONTRADO = "PERFIL_NO_ENCONTRADO";

    /** A consumption record for this food and profile already exists today. */
    public static final String CONSUMO_DUPLICADO = "CONSUMO_DUPLICADO";

    /** The child profile has already used its daily screen time limit. */
    public static final String TIEMPO_AGOTADO = "TIEMPO_AGOTADO";

    /** There is already an active game session for this profile today. */
    public static final String SESION_ACTIVA = "SESION_ACTIVA";

    /** The profile does not have enough coins for a debit operation. */
    public static final String SALDO_INSUFICIENTE = "SALDO_INSUFICIENTE";

    /** The screen time limit value is outside the allowed range (5–60 minutes). */
    public static final String LIMITE_INVALIDO = "LIMITE_INVALIDO";

    /** The email address is already registered. */
    public static final String EMAIL_DUPLICADO = "EMAIL_DUPLICADO";
}
