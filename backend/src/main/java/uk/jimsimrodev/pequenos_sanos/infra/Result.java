package uk.jimsimrodev.pequenos_sanos.infra;

/**
 * Sealed type representing the outcome of a business operation.
 * Use {@link Success} for successful results carrying a value,
 * and {@link Error} for controlled business failures with an error code and message.
 *
 * @param <T> the type of the success value
 */
public sealed interface Result<T> permits Result.Success, Result.Error {

    /**
     * Creates a successful result wrapping the given value.
     *
     * @param value the success value
     * @param <T>   the type of the value
     * @return a Success result
     */
    static <T> Result<T> success(T value) {
        return new Success<>(value);
    }

    /**
     * Creates an error result with the given code and message.
     *
     * @param code    the business error code (e.g., "CONSUMO_DUPLICADO")
     * @param message a human-readable description of the error
     * @param <T>     the expected success type (unused in error)
     * @return an Error result
     */
    static <T> Result<T> error(String code, String message) {
        return new Error<>(code, message);
    }

    /**
     * Returns true if this result is a success.
     *
     * @return true if Success, false if Error
     */
    default boolean isSuccess() {
        return this instanceof Success;
    }

    /**
     * Returns true if this result is an error.
     *
     * @return true if Error, false if Success
     */
    default boolean isError() {
        return this instanceof Error;
    }

    /**
     * Successful outcome carrying a value.
     *
     * @param value the result value
     * @param <T>   the type of the value
     */
    record Success<T>(T value) implements Result<T> {
    }

    /**
     * Business error outcome with a code and descriptive message.
     *
     * @param code    the error code constant
     * @param message human-readable error description
     * @param <T>     the expected success type (unused)
     */
    record Error<T>(String code, String message) implements Result<T> {
    }
}
