import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ItemTable } from '../components/ItemTable'
import { buildSandboxWorkbook, downloadSandboxWorkbook } from '../data/excel'
import { useItemStore } from '../store/ItemStore'

export function ItemsPage() {
  const { items, markExcelExported } = useItemStore()
  const [busy, setBusy] = useState(false)
  const ready = items.filter((item) => item.excelReady && item.recordState === 'approved')

  async function downloadReadyRows() {
    if (ready.length === 0) return
    setBusy(true)
    try {
      const buffer = await buildSandboxWorkbook(ready)
      downloadSandboxWorkbook(buffer, 'lost-found-append-preview.xlsx')
      markExcelExported(ready.map((item) => item.id))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page wide">
      <header className="page-header">
        <div>
          <h1>Items</h1>
          <p className="lede">{items.length} records in the Lost & Found register.</p>
        </div>
        <div className="actions">
          {ready.length > 0 ? (
            <button type="button" className="btn" disabled={busy} onClick={downloadReadyRows}>
              Download sandbox Excel ({ready.length})
            </button>
          ) : null}
          <Link className="btn btn-primary" to="/items/new">
            New item
          </Link>
        </div>
      </header>
      <ItemTable items={items} />
    </div>
  )
}
