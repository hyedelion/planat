package com.hml.planat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

@SpringBootTest
class HyelendarApplicationTests {
    private static void addFormField(DataOutputStream out, String boundary, String name, String value) throws IOException, IOException {
        String lineEnd = "\r\n";
        String twoHyphens = "--";

        out.writeBytes(twoHyphens + boundary + lineEnd);
        out.writeBytes("Content-Disposition: form-data; name=\"" + name + "\"" + lineEnd);
        out.writeBytes("Content-Type: text/plain; charset=UTF-8" + lineEnd);
        out.writeBytes(lineEnd);
        out.writeBytes(value + lineEnd);
    }
    @Test
    void contextLoads() throws IOException {

    }

}
