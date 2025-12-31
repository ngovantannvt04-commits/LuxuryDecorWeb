package com.luxurydecor.identity_service.repository;


import com.luxurydecor.identity_service.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends  JpaRepository<Account,Integer>{
    boolean existsByEmail(String email);
    Optional<Account> findByEmail(String email);
}
