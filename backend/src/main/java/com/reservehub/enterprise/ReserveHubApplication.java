package com.reservehub.enterprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ReserveHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReserveHubApplication.class, args);
    }
}
