package com.example.BookStack.service;

import java.util.ArrayList;
import java.util.List;
import java.util.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.BookStack.Controller.*;
import com.example.BookStack.Repository.*;
import com.example.BookStack.Entity.*;

@Service
public class BookService {
	private  static BookRepository bookRepository;
	
	@Autowired
	public BookService(BookRepository bookRepository) {
		BookService.bookRepository = bookRepository;
	}
	public List<Books> getAllBooks() {
		return bookRepository.findAll();
	}
	public static Optional<Books> getBookById(Long id) {
		return bookRepository.findById(id);
	}

	public static Books createBook(Books book) {
		return bookRepository.save(book);
	}
	 public void deleteBook(Long id) {
	        bookRepository.deleteById(id);
	    }
	 public Optional<Books> updateBook(Long id, Books updatedBook) {
	        return bookRepository.findById(id).map(book -> {
	            book.setName(updatedBook.getName());
	            book.setPrice(updatedBook.getPrice());
	            book.setISBN(updatedBook.getISBN());
	            book.setAuthorName(updatedBook.getAuthorName());
	            book.setStatus(updatedBook.isStatus());
	            book.setCategory(updatedBook.getCategory());
	            return bookRepository.save(book);
	        });}
	 public static Books updateISBN(Long id, String newISBN) {
	        Books book = bookRepository.findById(id).orElse(null);
	        if (book == null) {
	            return null; // Book not found
	        }
	        
	        // Check if the ISBN is already used
	        if (bookRepository.existsByISBN(book.getISBN())) {
	            return null; // ISBN already exists
	        }

	        // Update the ISBN
	        book.setISBN(newISBN);
	        return bookRepository.save(book); // Save and return the updated book
	    }

		@PersistenceContext
		private EntityManager entityManager;
			
		public List<Books> searchBooks(String name, String authorName, Long categoryId, Boolean status,Double minPrice,Double maxPrice,String ISBN) {
	        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
	        CriteriaQuery<Books> cq = cb.createQuery(Books.class);
	        Root<Books> book = cq.from(Books.class);

	        List<Predicate> predicates = new ArrayList<>();

	        if (name != null && !name.isEmpty()) {
	            predicates.add(cb.like(cb.lower(book.get("name")), "%" + name.toLowerCase() + "%"));
	        }

	        if (authorName != null && !authorName.isEmpty()) {
	            predicates.add(cb.like(cb.lower(book.get("autherName")), "%" + authorName.toLowerCase() + "%"));
	        }

	        if (categoryId != null) {
	            predicates.add(cb.equal(book.get("category").get("id"), categoryId));
	        }

	        if (status != null) {
	            predicates.add(cb.equal(book.get("status"), status));
	        }
	        if (ISBN != null) {
	            predicates.add(cb.equal(book.get("ISBN"), ISBN));
	        }
	        if (minPrice != null) {
	        	 predicates.add(cb.greaterThanOrEqualTo(book.get("price"), minPrice));
	        
	        }
	        if (maxPrice != null) {
	            predicates.add(cb.lessThanOrEqualTo(book.get("price"), maxPrice));
	        
	        }
	        cq.where(cb.and(predicates.toArray(new Predicate[0])));
	        TypedQuery<Books> query = entityManager.createQuery(cq);
	        return query.getResultList();
	    }
		public boolean existsByIsbn(String isbn) {
		    return bookRepository.existsByISBN(isbn);
		}
		
}
