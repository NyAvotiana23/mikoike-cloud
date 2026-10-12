package mg.projetfinal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Test d'intégration : exige un vrai PostgreSQL (colonnes {@code text[]} non supportées par H2).
 * Lancer avec {@code DB_URL}, {@code DB_USER}, {@code DB_PASSWORD}, {@code FIREBASE_ENABLED=false}.
 */
@SpringBootTest
@EnabledIfEnvironmentVariable(named = "DB_URL", matches = ".+")
class ProjetFinalApplicationTests {

	@Test
	void contextLoads() {
	}

}
