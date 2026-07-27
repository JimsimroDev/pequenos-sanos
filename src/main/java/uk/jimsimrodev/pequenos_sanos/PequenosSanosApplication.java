package uk.jimsimrodev.pequenos_sanos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Spring Boot application entry point.
 * {@link EnableScheduling} activates the 1-second timer tick for session
 * management.
 */
@SpringBootApplication
@EnableScheduling
public class PequenosSanosApplication {

	public static void main(String[] args) {
		SpringApplication.run(PequenosSanosApplication.class, args);
	}

}
