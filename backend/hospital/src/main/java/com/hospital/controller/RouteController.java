package com.hospital.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class RouteController {

    @RequestMapping(value = {
        "/HealthCare",
        "/HealthCare/{path:[^\\.]*}",
        "/HealthCare/{path1:[^\\.]*}/{path2:[^\\.]*}"
    })
    public String forward() {
        return "forward:/HealthCare/index.html";
    }

    @RequestMapping(value = {
        "",
        "/",
        "/healthcare",
        "/Healthcare",
        "/healthcare/{path:[^\\.]*}",
        "/Healthcare/{path:[^\\.]*}"
    })
    public String redirectToCapitalized() {
        return "redirect:/hospital/HealthCare";
    }
}
