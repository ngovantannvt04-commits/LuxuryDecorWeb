package com.luxurydecor.identity_service.repository;

import com.luxurydecor.identity_service.entity.Account;
import com.luxurydecor.identity_service.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long>{
    Optional<RefreshToken> findByToken(String token);
    Optional<RefreshToken> findByAccount(Account account);
}
