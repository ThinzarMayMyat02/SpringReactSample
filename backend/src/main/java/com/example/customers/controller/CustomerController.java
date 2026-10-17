package com.example.customers.controller;

import com.example.customers.model.Customer;
import com.example.customers.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    /** GET /api/customers?search=ada */
    @GetMapping
    public List<Customer> getAllCustomers(
            @RequestParam(name = "search", required = false) String search) {
        return customerService.findAll(search);
    }

    /** GET /api/customers/{id} */
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    /** POST /api/customers */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Customer createCustomer(@Valid @RequestBody Customer customer) {
        return customerService.create(customer);
    }

    /** PUT /api/customers/{id} */
    @PutMapping("/{id}")
    public Customer updateCustomer(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return customerService.update(id, customer);
    }

    /** DELETE /api/customers/{id} */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCustomer(@PathVariable Long id) {
        customerService.delete(id);
    }
}
