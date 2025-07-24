package com.hml.planat.regexes;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ContactTokenRegex {
    public static final Regex code = new Regex("^(\\d{6})$");
    public static final Regex salt = new Regex("^([\\da-zA-Z]{128})$");
}
