package com.orbitalworks.fleetdesigner.ui;

import com.orbitalworks.fleetdesigner.model.CompanyState;
import com.orbitalworks.fleetdesigner.model.GameState;
import com.orbitalworks.fleetdesigner.ui.common.IndustrialTheme;

import javax.swing.JLabel;
import javax.swing.JPanel;
import java.awt.BorderLayout;
import java.awt.GridLayout;

public final class CompanyHeaderPanel extends JPanel {
    private final JLabel titleLabel = new JLabel("Fleet Designer");
    private final JLabel subtitleLabel = new JLabel("Java 17 Swing redevelopment shell // no Electron runtime");
    private final JLabel companyLabel = new JLabel();
    private final JLabel cashLabel = new JLabel();
    private final JLabel reputationLabel = new JLabel();
    private final JLabel cycleLabel = new JLabel();
    private final JLabel burnLabel = new JLabel();
    private final JLabel staffLabel = new JLabel();
    private final JLabel factoryLabel = new JLabel();
    private final JLabel statusLabel = new JLabel();

    public CompanyHeaderPanel() {
        super(new BorderLayout(16, 8));
        IndustrialTheme.stylePanel(this);

        titleLabel.setFont(IndustrialTheme.TITLE);
        subtitleLabel.setFont(IndustrialTheme.MONO);
        subtitleLabel.setForeground(IndustrialTheme.AMBER);

        JPanel titleBlock = new JPanel(new BorderLayout(0, 4));
        titleBlock.setOpaque(false);
        titleBlock.add(titleLabel, BorderLayout.CENTER);
        titleBlock.add(subtitleLabel, BorderLayout.SOUTH);

        JPanel metrics = new JPanel(new GridLayout(4, 2, 8, 4));
        metrics.setOpaque(false);
        for (JLabel label : new JLabel[]{companyLabel, cashLabel, reputationLabel, cycleLabel, burnLabel, staffLabel, factoryLabel, statusLabel}) {
            label.setFont(IndustrialTheme.MONO_BOLD);
            metrics.add(label);
        }

        add(titleBlock, BorderLayout.CENTER);
        add(metrics, BorderLayout.EAST);
    }

    public void refresh(GameState state) {
        CompanyState company = state.getCompany();
        companyLabel.setText("Company: " + company.getName());
        cashLabel.setText("Cash: CR " + String.format("%,d", company.getCash()));
        reputationLabel.setText("Reputation: " + company.getReputation());
        cycleLabel.setText("Cycle: " + company.getCycle());
        burnLabel.setText("Burn: CR " + String.format("%,d", company.getBurnRate()) + " / cycle");
        staffLabel.setText("Staff: " + state.getResearcherCount() + " researchers // " + state.getEngineerCount() + " engineers");
        factoryLabel.setText("Factory: " + company.getFactoryCapacity() + " capacity // " + company.getProductionLineCapacity() + " owned lines");
        statusLabel.setText("Status: " + company.getStatus());
        statusLabel.setForeground("bankrupt".equals(company.getStatus()) ? IndustrialTheme.DANGER : IndustrialTheme.CYAN);
    }
}
