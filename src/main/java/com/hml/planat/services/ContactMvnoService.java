package com.hml.planat.services;

import com.hml.planat.entities.users.ContactMvnoEntity;
import com.hml.planat.mappers.ContactMvnoMapper;
import org.springframework.stereotype.Service;

@Service
public class ContactMvnoService {
    private final ContactMvnoMapper contactMvnoMapper;

    public ContactMvnoService(ContactMvnoMapper contactMvnoMapper) {
        this.contactMvnoMapper = contactMvnoMapper;
    }

    public ContactMvnoEntity[] getAll() {
        return this.contactMvnoMapper.selectAll();
    }
}
