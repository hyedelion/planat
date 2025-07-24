package com.hml.planat.regexes;

import lombok.experimental.UtilityClass;

@UtilityClass
public class CommonRegex {
    public static final Regex iso8601Date = new Regex("^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$");
    public static final Regex fileMimeType = new Regex("^[\\da-zA-Z!#$&^_.+-]+\\/[\\da-zA-Z!#$&^_.+-]+$");
    public static final Regex fileName = new Regex("^[^\\\\<>:\"\\/\\|?*\\x00-\\x1F]{1,255}$");
}
