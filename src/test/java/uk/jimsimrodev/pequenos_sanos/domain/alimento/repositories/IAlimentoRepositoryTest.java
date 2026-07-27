package uk.jimsimrodev.pequenos_sanos.domain.alimento.repositories;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.Alimento;
import uk.jimsimrodev.pequenos_sanos.domain.alimento.model.CategoriaAlimento;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class IAlimentoRepositoryTest {

    @Autowired
    private IAlimentoRepository alimentoRepository;

    @Autowired
    private TestEntityManager em;

    @Test
    @DisplayName("Should return only active alimentos")
    void shouldReturnOnlyActiveAlimentos() {
        // Arrange
        var activo = new Alimento("Manzana", CategoriaAlimento.FRUTA, (short) 10);
        var inactivo = new Alimento("Pera", CategoriaAlimento.FRUTA, (short) 10);
        em.persistAndFlush(activo);
        em.persistAndFlush(inactivo);
        inactivo.setActivo(false);
        em.persistAndFlush(inactivo);

        // Act
        List<Alimento> result = alimentoRepository.findByActivoTrue();

        // Assert
        assertThat(result).extracting(Alimento::getNombre).contains("Manzana");
        assertThat(result).extracting(Alimento::getNombre).doesNotContain("Pera");
    }

    @Test
    @DisplayName("Should filter active alimentos by category")
    void shouldFilterActiveAlimentosByCategory() {
        // Arrange
        em.persistAndFlush(new Alimento("Brócoli", CategoriaAlimento.VERDURA, (short) 15));
        em.persistAndFlush(new Alimento("Pollo", CategoriaAlimento.PROTEINA, (short) 20));
        em.persistAndFlush(new Alimento("Espinaca", CategoriaAlimento.VERDURA, (short) 15));

        // Act
        List<Alimento> verduras = alimentoRepository.findByCategoriaAndActivoTrue(CategoriaAlimento.VERDURA);

        // Assert
        assertThat(verduras).hasSize(2);
        assertThat(verduras).extracting(Alimento::getCategoria).containsOnly(CategoriaAlimento.VERDURA);
    }

    @Test
    @DisplayName("Should return empty list when no alimentos match category")
    void shouldReturnEmptyListWhenNoAlimentosMatchCategory() {
        // Arrange
        em.persistAndFlush(new Alimento("Manzana", CategoriaAlimento.FRUTA, (short) 10));

        // Act
        List<Alimento> result = alimentoRepository.findByCategoriaAndActivoTrue(CategoriaAlimento.CEREAL);

        // Assert
        assertThat(result).isEmpty();
    }
}
