package com.luxurydecor.product_service.repository;

import com.luxurydecor.product_service.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByCategoryName(String categoryName);
}
