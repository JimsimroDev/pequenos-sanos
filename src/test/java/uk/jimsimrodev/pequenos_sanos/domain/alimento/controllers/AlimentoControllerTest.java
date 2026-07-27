package uk.jimsimrodev.pequenos_sanos.domain.alimento.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import uk.jimsimrodev.pequenos_sanos.config.SecurityConfig;
import uk.jimsimrodev.pequenos_sanos.config.SecurityTestConfig;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.dto.DatosRespuestaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.services.IAlimentoService;
import uk.jimsimrodev.pequenos_sanos.infra.security.SecurityFilter;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AlimentoController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {SecurityConfig.class, SecurityFilter.class}
        ))
@Import(SecurityTestConfig.class)
class AlimentoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IAlimentoService alimentoService;

    @Test
    @DisplayName("Should return 200 with all alimentos when no category filter")
    void shouldReturn200WithAllAlimentosWhenNoCategoryFilter() throws Exception {
        // Arrange
        var alimento = new DatosRespuestaAlimento(1L, "Manzana", CategoriaAlimento.FRUTA,
                "Manzana fresca", (short) 10);

        when(alimentoService.listar(null)).thenReturn(List.of(alimento));

        // Act & Assert
        mockMvc.perform(get("/api/v1/alimentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Manzana"))
                .andExpect(jsonPath("$[0].categoria").value("FRUTA"));
    }

    @Test
    @DisplayName("Should return 200 filtered by category")
    void shouldReturn200FilteredByCategory() throws Exception {
        // Arrange
        var verdura = new DatosRespuestaAlimento(2L, "Brócoli", CategoriaAlimento.VERDURA,
                "Brócoli al vapor", (short) 15);

        when(alimentoService.listar(eq(CategoriaAlimento.VERDURA))).thenReturn(List.of(verdura));

        // Act & Assert
        mockMvc.perform(get("/api/v1/alimentos").param("categoria", "VERDURA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Brócoli"));
    }

    @Test
    @DisplayName("Should return 200 when alimento found by id")
    void shouldReturn200WhenAlimentoFoundById() throws Exception {
        // Arrange
        var alimento = new DatosRespuestaAlimento(1L, "Manzana", CategoriaAlimento.FRUTA,
                "Manzana fresca", (short) 10);

        when(alimentoService.buscarPorId(1L)).thenReturn(Optional.of(alimento));

        // Act & Assert
        mockMvc.perform(get("/api/v1/alimentos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nombre").value("Manzana"));
    }

    @Test
    @DisplayName("Should return 404 when alimento not found by id")
    void shouldReturn404WhenAlimentoNotFoundById() throws Exception {
        // Arrange
        when(alimentoService.buscarPorId(99L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/v1/alimentos/99"))
                .andExpect(status().isNotFound());
    }
}
