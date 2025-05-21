package com.example.BookStack.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.BookStack.Entity.*;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	List<Category> findAll();

}
