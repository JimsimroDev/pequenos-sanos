package uk.jimsimrodev.pequenos_sanos.controller;

import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;

/**
 * Redirect controller that provides a convenient URL to access Swagger UI.
 * Hidden from the API documentation itself.
 */
@Hidden
@Controller
@RequestMapping("/documentation")
public class DocumentationController {

    /**
     * Redirects to the Swagger UI page.
     *
     * @param response the HTTP response used for redirection
     */
    @ResponseBody
    @GetMapping
    public void redirectToDocumentation(HttpServletResponse response) {
        try {
            response.sendRedirect("/swagger-ui.html");
        } catch (IOException e) {
            // Redirect failed silently
        }
    }
}
