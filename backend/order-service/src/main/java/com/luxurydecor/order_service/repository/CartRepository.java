package com.luxurydecor.order_service.repository;

import com.luxurydecor.order_service.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart,String> {

    Optional<Cart> findByUserId(Integer userId);
}
