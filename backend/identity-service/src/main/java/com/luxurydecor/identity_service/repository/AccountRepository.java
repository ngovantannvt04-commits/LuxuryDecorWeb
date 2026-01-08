package com.luxurydecor.identity_service.repository;


import com.luxurydecor.identity_service.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends  JpaRepository<Account,Integer>{
    boolean existsByEmail(String email);
    Optional<Account> findByEmail(String email);

    boolean existsByUsername(String username);
    Optional<Account> findByUsername(String username);

    boolean existsByAccountId(Integer accountId);
    Optional<Account> findByAccountId(Integer accountId);

    Page<Account> findByUsernameContainingOrEmailContaining(String username, String email, Pageable pageable);
}
