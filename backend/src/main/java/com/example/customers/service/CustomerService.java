package com.example.customers.service;

import com.example.customers.exception.ResourceNotFoundException;
import com.example.customers.model.Customer;
import com.example.customers.repository.CustomerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CustomerService {

    private static final Sort NAME_SORT = Sort.by(Sort.Direction.ASC, "lastName", "firstName");

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<Customer> findAll(String search) {
        if (search != null && !search.isBlank()) {
            return customerRepository.search(search.trim());
        }
        return customerRepository.findAll(NAME_SORT);
    }

    @Transactional(readOnly = true)
    public Customer findById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id " + id));
    }

    public Customer create(Customer customer) {
        customer.setId(null);
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer payload) {
        Customer existing = findById(id);
        existing.setFirstName(payload.getFirstName());
        existing.setLastName(payload.getLastName());
        existing.setDateOfBirth(payload.getDateOfBirth());
        existing.setPhoneNumber(payload.getPhoneNumber());
        existing.setEmail(payload.getEmail());
        existing.setBan(payload.getBan());
        return customerRepository.save(existing);
    }

    public void delete(Long id) {
        Customer existing = findById(id);
        customerRepository.delete(existing);
    }
}
