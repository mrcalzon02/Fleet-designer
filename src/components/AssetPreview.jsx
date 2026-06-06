export function AssetPreview() {
  return (
    <section className="console-panel asset-preview">
      <div className="panel-heading">
        <span>PIL Asset Generation Track</span>
        <small>industrial schematic prototypes</small>
      </div>
      <div className="asset-grid">
        <div className="asset-tile panel-tile">PANEL</div>
        <div className="asset-tile node-tile">NODE</div>
        <div className="asset-tile hull-tile">HULL</div>
        <div className="asset-tile warning-tile">ALERT</div>
      </div>
      <p>
        The included Python pipeline generates early UI panels, schematic nodes, hull silhouettes, warning badges, and material swatches. These are intentionally procedural first so theme direction can stabilize before hand-made production art begins.
      </p>
    </section>
  );
}
