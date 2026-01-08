package com.luxurydecor.order_service.repository;

import com.luxurydecor.order_service.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem,Integer> {
    
}
