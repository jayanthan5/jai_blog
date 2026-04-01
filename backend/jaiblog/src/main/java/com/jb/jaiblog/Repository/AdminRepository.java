package com.jb.jaiblog.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.jb.jaiblog.Entity.Admin;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Admin findByEmailAndPassword(String email,String password);
}
