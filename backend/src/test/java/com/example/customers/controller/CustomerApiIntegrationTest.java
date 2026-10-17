package com.example.customers.controller;

import com.example.customers.model.Customer;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full CRUD walk-through over the real Spring MVC + JPA stack (H2, test profile).
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Customer sample() {
        return new Customer(null, "Ada", "Lovelace", LocalDate.of(1815, 12, 10),
                "+44 20 7946 0958", "ada@example.com", "GB29NWBK60161331926819");
    }

    @Test
    void fullCrudLifecycle() throws Exception {
        // CREATE
        String createdBody = mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sample())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.firstName").value("Ada"))
                .andExpect(jsonPath("$.dateOfBirth").value("1815-12-10"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        long id = objectMapper.readTree(createdBody).get("id").asLong();

        // READ (list + search)
        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id));

        mockMvc.perform(get("/api/customers").param("search", "love"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lastName").value("Lovelace"));

        mockMvc.perform(get("/api/customers/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("ada@example.com"));

        // UPDATE
        Customer updated = sample();
        updated.setLastName("Byron");
        mockMvc.perform(put("/api/customers/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lastName").value("Byron"));

        // DELETE
        mockMvc.perform(delete("/api/customers/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/customers/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsInvalidPayload() throws Exception {
        Customer invalid = new Customer();
        invalid.setFirstName("  ");
        invalid.setLastName(null);
        invalid.setEmail("not-an-email");

        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.firstName").exists())
                .andExpect(jsonPath("$.errors.lastName").exists())
                .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void corsPreflightAllowsConfiguredOrigin() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .options("/api/customers")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }
}
