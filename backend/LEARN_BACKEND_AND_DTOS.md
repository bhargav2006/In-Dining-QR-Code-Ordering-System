# 🎓 Understanding Spring Boot, DTOs & Backend Data Flow

Welcome! This guide is written in plain, beginner-friendly language to help you understand **how the Spring Boot backend works**, **what DTOs are**, why we use them, and **how data flows** from React to the Database and back.

---

## 💡 What is a DTO (Data Transfer Object)?

A **DTO (Data Transfer Object)** is a simple Java class used exclusively for **carrying data** between the React frontend and the Spring Boot backend.

### 🍕 Real-World Analogy
Imagine a restaurant kitchen with a confidential employee record (`Entity`):
- Internal Database ID: `#84920`
- Encrypted Password Hash: `$2a$10$e8wZ...`
- Home Address
- Hourly Salary
- Full Name: `"Chef Mario"`
- Role: `"KITCHEN"`

When a customer or tablet asks: *"Who is the chef on duty?"*, you **never** hand them the employee's entire confidential file! 

Instead, you write down only the public details on a order ticket:
- Full Name: `"Chef Mario"`
- Role: `"KITCHEN"`
- Restaurant Name: `"Gourmet Bistro"`

That public order ticket is a **DTO (Data Transfer Object)**!

---

## ⚖️ Entity vs DTO: The Difference

| Concept | **Entity** (`model/`) | **DTO** (`dto/`) |
| :--- | :--- | :--- |
| **Purpose** | Represents a table in MySQL database | Represents JSON payload sent to/from React |
| **Annotation** | `@Entity`, `@Table`, `@Id` | Simple `@Data` or `@Builder` class |
| **Contains** | All database columns (including passwords) | Only data needed for the specific HTTP request |
| **Database Link** | Managed by Hibernate / Spring Data JPA | Not connected to the database at all |

---

## 🛡️ 4 Big Reasons Why We Use DTOs

### 1. 🔒 Security & Privacy
We must **never** send raw database entities to the frontend. If we return `User.java` directly in JSON, the user's **password hash** would be sent over the internet to the browser!

### 2. ⚡ Payload Size & Efficiency
An entity like `RestaurantTable` contains links to `Restaurant`, `TableSession`, `Order`, `OrderItem`, etc. Returning an entity directly could send megabytes of unwanted database data! A DTO sends only the 4 fields React actually needs.

### 3. 🔄 Prevention of Infinite JSON Recursion Loops
If `Order` has a list of `OrderItem`, and each `OrderItem` links back to `Order`, returning raw entities causes Jackson JSON serializer to crash in an infinite loop (`Order -> OrderItem -> Order -> OrderItem ...`). DTOs flatten this structure!

### 4. 🧹 Input Validation
DTOs use validation annotations like `@NotBlank`, `@NotNull`, `@Min`, `@Email` to reject invalid data before it touches the database:
```java
public class LoginRequestDto {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
```

---

## 🔄 Complete Step-by-Step Flow: Login Example

Let's trace how the code executes when a user logs in:

```
[React Frontend]
   │  Sends JSON: { "username": "admin", "password": "admin123" }
   ▼
1. [AuthController.java] (@RestController)
   │  Receives LoginRequestDto
   │  Calls authService.login(request)
   ▼
2. [AuthService.java] (@Service)
   │  Queries UserRepository -> SELECT * FROM users WHERE username = 'admin'
   │  Receives User Entity from Database
   │  Verifies password hash using PasswordEncoderUtil
   │  Generates JWT Token
   │  Converts User Entity -> AuthResponseDto
   ▼
3. [AuthResponseDto] (DTO Response)
   │  Contains token, username, role, restaurantName (No Password!)
   ▼
[React Frontend]
   │  Stores token in localStorage
```

### Code Walkthrough

#### 1. Incoming DTO: `LoginRequestDto.java`
```java
@Data
public class LoginRequestDto {
    @NotBlank
    private String username;

    @NotBlank
    private String password;
}
```

#### 2. Database Entity: `User.java`
```java
@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // 🔒 Sensitive database column!

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ManyToOne(fetch = FetchType.EAGER)
    private Restaurant restaurant;
}
```

#### 3. Service Conversion in `AuthService.java`
```java
public AuthResponseDto login(LoginRequestDto request) {
    // 1. Fetch entity from DB
    User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new BadRequestException("Invalid username or password"));

    // 2. Verify password
    if (!PasswordEncoderUtil.matches(request.getPassword(), user.getPassword())) {
        throw new BadRequestException("Invalid username or password");
    }

    // 3. Generate token
    String authToken = TokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

    // 4. Map Entity to Outgoing DTO (Safely dropping the password!)
    Restaurant r = user.getRestaurant();
    return AuthResponseDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .fullName(user.getFullName())
            .role(user.getRole())
            .token(authToken)
            .restaurantId(r != null ? r.getId() : null)
            .restaurantName(r != null ? r.getName() : null)
            .restaurantSlug(r != null ? r.getSlug() : null)
            .build();
}
```

---

## 📂 Quick Summary of Backend Folders

- **`dto/`**: Data contracts for HTTP request/response payloads.
- **`controller/`**: Handles HTTP endpoints (`GET`, `POST`, `PUT`, `DELETE`).
- **`service/`**: Performs business logic, validations, and Entity $\leftrightarrow$ DTO conversions.
- **`repository/`**: Generates SQL queries to talk to MySQL / H2 database.
- **`model/`**: Java representation of database tables (`@Entity`).
- **`exception/`**: Returns clean JSON error responses when validation fails.
