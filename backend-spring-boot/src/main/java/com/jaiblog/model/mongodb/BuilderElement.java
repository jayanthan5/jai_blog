package com.jaiblog.model.mongodb;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BuilderElement {
    private String id;
    private String type; // "TEXT", "IMAGE", "VIDEO", "DIVIDER", "BUTTON"
    private String content; // Text string, Image URL, Video URL, Button label
    private String subContent; // Optional subtitle or link URL
    private Map<String, Object> styles; 
    // styles map includes:
    // fontSize, fontWeight, color, textAlign,
    // width, height, padding, margin,
    // backgroundColor, borderRadius, opacity, position
    private Integer orderIndex;
}
