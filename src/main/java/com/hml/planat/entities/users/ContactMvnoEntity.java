package com.hml.planat.entities.users;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(of = "code")
public class ContactMvnoEntity {
    private String code;
    private String displayText;
}
