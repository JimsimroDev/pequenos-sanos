package uk.jimsimrodev.pequenos_sanos.infra.errores;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Global exception handler that intercepts unhandled exceptions thrown by
 * controllers
 * and converts them into structured JSON error responses with appropriate HTTP
 * status codes.
 */
@RestControllerAdvice
public class TratadorDeErrores {

        private static final Logger log = LoggerFactory.getLogger(TratadorDeErrores.class);

        /**
         * Handles entity not found exceptions.
         *
         * @param ex the exception
         * @return 404 Not Found with error details
         */
        @ExceptionHandler(EntityNotFoundException.class)
        public ResponseEntity<DatosErrorRespuesta> handleEntityNotFound(EntityNotFoundException ex) {
                var error = new DatosErrorRespuesta(
                                HttpStatus.NOT_FOUND.value(),
                                "NOT_FOUND",
                                ex.getMessage(),
                                LocalDateTime.now());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        /**
         * Handles access denied exceptions (authenticated but insufficient
         * permissions).
         *
         * @param ex the exception
         * @return 403 Forbidden with error details
         */
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<DatosErrorRespuesta> handleAccessDenied(AccessDeniedException ex) {
                var error = new DatosErrorRespuesta(
                                HttpStatus.FORBIDDEN.value(),
                                "FORBIDDEN",
                                "No tiene permisos para realizar esta acción",
                                LocalDateTime.now());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        /**
         * Handles validation errors from DTO bean validation.
         *
         * @param ex the exception containing field errors
         * @return 400 Bad Request with list of invalid fields
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<DatosErrorValidacion> handleValidationErrors(MethodArgumentNotValidException ex) {
                List<DatoCampoError> campos = ex.getFieldErrors().stream()
                                .map(this::mapFieldError)
                                .toList();

                var error = new DatosErrorValidacion(
                                HttpStatus.BAD_REQUEST.value(),
                                "VALIDATION_ERROR",
                                "Error de validación en los datos enviados",
                                campos,
                                LocalDateTime.now());
                return ResponseEntity.badRequest().body(error);
        }

        /**
         * Handles database constraint violations (e.g., UNIQUE constraint).
         *
         * @param ex the exception
         * @return 409 Conflict with error details
         */
        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<DatosErrorRespuesta> handleDataIntegrity(DataIntegrityViolationException ex) {
                log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
                var error = new DatosErrorRespuesta(
                                HttpStatus.CONFLICT.value(),
                                "CONFLICT",
                                "Violación de integridad de datos: el recurso ya existe o hay un conflicto",
                                LocalDateTime.now());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        /**
         * Handles authentication failures (bad credentials).
         *
         * @param ex the exception
         * @return 401 Unauthorized with error details
         */
        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<DatosErrorRespuesta> handleBadCredentials(BadCredentialsException ex) {
                var error = new DatosErrorRespuesta(
                                HttpStatus.UNAUTHORIZED.value(),
                                "UNAUTHORIZED",
                                "Credenciales incorrectas",
                                LocalDateTime.now());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        /**
         * Fallback handler for unexpected exceptions.
         *
         * @param ex the exception
         * @return 500 Internal Server Error with generic message
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<DatosErrorRespuesta> handleGenericException(Exception ex) {
                log.error("Unexpected error: {}", ex.getMessage(), ex);
                var error = new DatosErrorRespuesta(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "INTERNAL_ERROR",
                                "Error interno del servidor",
                                LocalDateTime.now());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }

        private DatoCampoError mapFieldError(FieldError fieldError) {
                return new DatoCampoError(
                                fieldError.getField(),
                                fieldError.getDefaultMessage());
        }

        /**
         * Standard error response body.
         *
         * @param status    HTTP status code
         * @param code      error code string
         * @param message   human-readable description
         * @param timestamp when the error occurred
         */
        public record DatosErrorRespuesta(
                        int status,
                        String code,
                        String message,
                        LocalDateTime timestamp) {
        }

        /**
         * Validation error response with field-level details.
         *
         * @param status    HTTP status code
         * @param code      error code string
         * @param message   general error message
         * @param campos    list of invalid fields with their error messages
         * @param timestamp when the error occurred
         */
        public record DatosErrorValidacion(
                        int status,
                        String code,
                        String message,
                        List<DatoCampoError> campos,
                        LocalDateTime timestamp) {
        }

        /**
         * Individual field validation error detail.
         *
         * @param campo   the field name that failed validation
         * @param mensaje the validation error message
         */
        public record DatoCampoError(
                        String campo,
                        String mensaje) {
        }
}
