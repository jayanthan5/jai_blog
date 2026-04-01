package com.jb.jaiblog.Controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.jb.jaiblog.Entity.Admin;
import com.jb.jaiblog.Repository.AdminRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins="http://localhost:5173")
public class AdminController {

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/login")
    public String login(@RequestBody Admin admin){

        Admin existingAdmin = adminRepository
                .findByEmailAndPassword(admin.getEmail(),admin.getPassword());

        if(existingAdmin != null){
            return "Login Success";
        }

        return "Login Failed";
    }
}
