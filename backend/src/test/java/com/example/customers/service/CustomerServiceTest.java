package com.example.customers.service;

import com.example.customers.exception.ResourceNotFoundException;
import com.example.customers.model.Customer;
import com.example.customers.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void createForcesGeneratedIdAndPersists() {
        Customer incoming = new Customer(null, "Ada", "Lovelace",
                LocalDate.of(1815, 12, 10), "+44 20 7946 0958", "ada@example.com", "GB29NWBK60161331926819");
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        Customer created = customerService.create(incoming);

        assertThat(created.getId()).isEqualTo(1L);
        assertThat(created.getLastName()).isEqualTo("Lovelace");
        verify(customerRepository).save(incoming);
    }

    @Test
    void findByIdThrowsWhenMissing() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void deleteMissingCustomerDoesNotCallDelete() {
        when(customerRepository.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.delete(7L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(customerRepository, never()).delete(any(Customer.class));
    }
}
