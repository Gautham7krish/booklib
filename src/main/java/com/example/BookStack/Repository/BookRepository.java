package com.example.BookStack.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.BookStack.Entity.*;

public interface BookRepository extends JpaRepository<Books, Long> {

	List<Books> findAll();

	boolean existsByISBN(String newISBN);

	

	

}
