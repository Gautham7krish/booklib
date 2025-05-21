package com.example.BookStack.Controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.BookStack.service.*;
import com.example.BookStack.Repository.*;
import com.example.BookStack.Entity.*;

@RestController
@RequestMapping("/Books")
public class BookController {
	@Autowired
	private BookService BookService;
	@Autowired
	private BookRepository BookRepository;
	@Autowired
	private CategoryRepository CategoryRepository;

	@GetMapping("/")
	public String home() {
		return "Welcome to the Book API";
	}
	@GetMapping("/fetchbooks")
	public List<Books> getAllBooks() {
		return BookService.getAllBooks();
	}

	@GetMapping("/{id}")
	public ResponseEntity<Books> getBookById(@PathVariable Long id) {
		Optional<Books> book = BookService.getBookById(id);
		return book.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}
	@GetMapping("/check-isbn")
	public ResponseEntity<Boolean> checkIsbn(@RequestParam String isbn) {
	    boolean exists = BookService.existsByIsbn(isbn);
	    return ResponseEntity.ok(exists);
	}

	@PostMapping
	public ResponseEntity<Books> createBook(@RequestBody Books book) {
		try {
			Books savedBook = BookService.createBook(book);
			return ResponseEntity.ok(savedBook);
		} catch (Exception e) {
			return ResponseEntity.internalServerError().build();
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<Books> updateBook(@PathVariable Long id, @RequestBody Books updatedBook) {
	    Optional<Books> result = BookService.updateBook(id, updatedBook);
	    return result.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}


	@GetMapping("/search")
    public List<Books> searchBooks(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String authorName,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String ISBN
    ) {
        return BookService.searchBooks (name, authorName, categoryId, status,minPrice,maxPrice,ISBN);
	}
//	@DeleteMapping("/{id}")
//	public ResponseEntity<Void> deleteBook(@PathVariable Long id){
//		Optional<Books> Book = BookService.getBookById(id);
//		return null;
//		
//	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
	    if (BookRepository.existsById(id)) {
	        BookRepository.deleteById(id);
	        return ResponseEntity.noContent().build();
	    } else {
	        return ResponseEntity.notFound().build();
	    }
	}
	@GetMapping("/Categories")
	public List<Category> getAllCategories() {
	    return CategoryRepository.findAll();
	}
	
	

}
