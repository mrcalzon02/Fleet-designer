package com.orbitalworks.fleetdesigner.ui.common;

import javax.swing.BorderFactory;
import javax.swing.JComponent;
import javax.swing.UIManager;
import java.awt.Color;
import java.awt.Font;

public final class IndustrialTheme {
    public static final Color BACKGROUND = new Color(5, 7, 10);
    public static final Color PANEL = new Color(12, 18, 24);
    public static final Color PANEL_DARK = new Color(8, 11, 16);
    public static final Color CYAN = new Color(0, 255, 209);
    public static final Color AMBER = new Color(255, 184, 0);
    public static final Color TEXT = new Color(216, 247, 255);
    public static final Color MUTED = new Color(145, 170, 177);
    public static final Color DANGER = new Color(255, 74, 74);

    public static final Font TITLE = new Font(Font.SANS_SERIF, Font.BOLD, 34);
    public static final Font HEADER = new Font(Font.SANS_SERIF, Font.BOLD, 15);
    public static final Font BODY = new Font(Font.SANS_SERIF, Font.PLAIN, 13);
    public static final Font MONO = new Font(Font.MONOSPACED, Font.PLAIN, 12);
    public static final Font MONO_BOLD = new Font(Font.MONOSPACED, Font.BOLD, 12);

    private IndustrialTheme() {
    }

    public static void install() {
        UIManager.put("Panel.background", BACKGROUND);
        UIManager.put("Label.foreground", TEXT);
        UIManager.put("Button.background", PANEL_DARK);
        UIManager.put("Button.foreground", TEXT);
        UIManager.put("Button.focus", CYAN.darker());
        UIManager.put("ScrollPane.background", BACKGROUND);
        UIManager.put("TextArea.background", PANEL_DARK);
        UIManager.put("TextArea.foreground", TEXT);
        UIManager.put("TextArea.caretForeground", AMBER);
    }

    public static void stylePanel(JComponent component) {
        component.setBackground(PANEL);
        component.setForeground(TEXT);
        component.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(0, 255, 209, 88), 1),
                BorderFactory.createEmptyBorder(12, 12, 12, 12)
        ));
    }

    public static void styleInsetPanel(JComponent component) {
        component.setBackground(PANEL_DARK);
        component.setForeground(TEXT);
        component.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(255, 184, 0, 70), 1),
                BorderFactory.createEmptyBorder(8, 8, 8, 8)
        ));
    }
}
