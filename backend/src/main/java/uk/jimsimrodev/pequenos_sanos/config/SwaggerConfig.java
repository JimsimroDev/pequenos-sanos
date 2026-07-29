package uk.jimsimrodev.pequenos_sanos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuracion de OpenAPI/Swagger para la documentacion de la API Pequenos
 * Sanos.
 * Define metadatos del proyecto y esquema de seguridad Bearer JWT para Swagger
 * UI.
 */
@Configuration
public class SwaggerConfig {

        private static final String SECURITY_SCHEME_NAME = "bearerAuth";

        /**
         * Configura la especificacion OpenAPI con informacion del proyecto y seguridad
         * JWT.
         *
         * @return la instancia OpenAPI configurada
         */
        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("Pequeños Sanos API")
                                                .description("API de gamificación nutricional para niños de 2 a 4 años")
                                                .version("1.0.0")
                                                .contact(new Contact()
                                                                .name("JimsimroDev")
                                                                .url("https://github.com/JimsimroDev/pequenos-sanos")))
                                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                                .components(new Components()
                                                .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                                                new SecurityScheme()
                                                                                .name(SECURITY_SCHEME_NAME)
                                                                                .type(SecurityScheme.Type.HTTP)
                                                                                .scheme("bearer")
                                                                                .bearerFormat("JWT")));
        }
}
