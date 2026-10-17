package com.example.customers.repository;

import com.example.customers.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Case-insensitive free-text search across the most useful columns.
     * Null columns are harmless: the OR chain still matches on any non-null field.
     */
    @Query("""
            SELECT c FROM Customer c
            WHERE LOWER(c.firstName)   LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(c.lastName)    LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(c.email)       LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(c.phoneNumber) LIKE LOWER(CONCAT('%', :term, '%'))
               OR LOWER(c.ban)         LIKE LOWER(CONCAT('%', :term, '%'))
            ORDER BY c.lastName ASC, c.firstName ASC
            """)
    List<Customer> search(@Param("term") String term);
}
