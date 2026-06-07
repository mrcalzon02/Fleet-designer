import { relationSummary } from '../game/contractRelations.js';

function formatDelta(value) {
  return `${value >= 0 ? '+' : ''}${value}`;
}

export function ClientRelationsPanel({ company }) {
  const relations = relationSummary(company);
  const sourceEntries = Object.entries(relations.sourceReputation ?? {});
  const alignmentEntries = Object.entries(relations.alignmentFactors ?? {});

  return (
    <section className="two-column">
      <article className="console-panel">
        <div className="panel-heading">
          <span>Client Relations</span>
          <small>source reputation and alignment</small>
        </div>
        <p>Contract outcomes now change which clients trust the company and which parts of the economy start offering better work.</p>
        <div className="stack-list compact-list">
          {sourceEntries.map(([key, value]) => (
            <div className="data-card" key={key}>
              <strong>{key}</strong>
              <small>source reputation {formatDelta(value)}</small>
              <p>Higher source reputation improves access to better jobs from this client ecosystem.</p>
            </div>
          ))}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Alignment Factors</span>
          <small>market identity drift</small>
        </div>
        <div className="stack-list compact-list">
          {alignmentEntries.map(([key, value]) => (
            <div className="data-card" key={key}>
              <strong>{key}</strong>
              <small>alignment {formatDelta(value)}</small>
              <p>Repeated work in this sector biases future contract access and client trust.</p>
            </div>
          ))}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Relationship History</span>
          <small>{relations.relationHistory.length} recent events</small>
        </div>
        <div className="stack-list compact-list">
          {relations.relationHistory.map((event, index) => (
            <div className="data-card" key={`${event.cycle}-${event.sourceName}-${index}`}>
              <strong>{event.sourceName}</strong>
              <small>C{event.cycle} // {event.outcome}</small>
              <p>Company {formatDelta(event.companyRepDelta)} // source {formatDelta(event.sourceRepDelta)} // alignment {formatDelta(event.alignmentDelta)}.</p>
            </div>
          ))}
          {relations.relationHistory.length === 0 && <p>No completed source-faction contract relationship events yet.</p>}
        </div>
      </article>

      <article className="console-panel">
        <div className="panel-heading">
          <span>Relationship Rules</span>
          <small>fulfillment feedback</small>
        </div>
        <p>Clean fulfillment improves company reputation, source reputation, and alignment. Defective accepted delivery gives reduced relationship gains. Failed contracts damage all three, with higher-skull failures hurting harder.</p>
      </article>
    </section>
  );
}
