package mg.projetfinal.repository;

import mg.projetfinal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByFirebaseUid(String firebaseUid);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.firebaseSynced = false")
    List<User> findNotSynced();

    @Query("SELECT u FROM User u WHERE u.isLocked = true")
    List<User> findLockedUsers();
}