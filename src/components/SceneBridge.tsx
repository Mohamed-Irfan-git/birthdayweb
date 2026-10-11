type BridgeKind = 'sky' | 'garden' | 'surprises' | 'cake' | 'letter' | 'finale'

const bridges: Record<BridgeKind, { from: string; to: string; line: string }> = {
  sky: { from: '✧', to: '✦', line: 'One light can find another.' },
  garden: { from: '✦', to: '✿', line: 'A star becomes a wish.' },
  surprises: { from: '✿', to: '✧', line: 'Every wish has somewhere to go.' },
  cake: { from: '✧', to: '♢', line: 'Keep one little light for yourself.' },
  letter: { from: '♢', to: '❦', line: 'Some wishes are best written down.' },
  finale: { from: '❦', to: '✦', line: 'And the whole sky celebrates you.' },
}

export function SceneBridge({ kind }: { kind: BridgeKind }) {
  const bridge = bridges[kind]
  return (
    <div className={`scene-bridge bridge-to-${kind}`} aria-hidden="true">
      <span className="bridge-world bridge-world-from" />
      <span className="bridge-world bridge-world-to" />
      <span className="bridge-shroud" />
      <span className="bridge-glow" />
      <span className="bridge-thread" />
      <span className="bridge-core"><i className="bridge-origin">{bridge.from}</i><i className="bridge-destination">{bridge.to}</i></span>
      <span className="bridge-caption">{bridge.line}</span>
      <span className="bridge-spark spark-a" /><span className="bridge-spark spark-b" /><span className="bridge-spark spark-c" />
    </div>
  )
}
