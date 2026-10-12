package com.simple_backend.repository;

import com.simple_backend.model.TableSession;
import com.simple_backend.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TableSessionRepository extends JpaRepository<TableSession, Long> {
    Optional<TableSession> findBySessionToken(String sessionToken);
    Optional<TableSession> findByTableIdAndStatus(Long tableId, SessionStatus status);
}
