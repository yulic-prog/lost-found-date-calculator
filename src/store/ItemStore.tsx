import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createId, loadItems, saveItems } from '../data/repository'
import { applyWorkflowDates } from '../domain/workflow'
import { hasFieldErrors, normalizeItemId, validateItemDraft } from '../domain/validation'
import type { FieldErrors } from '../domain/validation'
import type {
  ItemDraft,
  LostFoundItem,
  OperationalStatus,
  RecordState,
} from '../domain/types'

interface ItemStoreValue {
  items: LostFoundItem[]
  getItem: (id: string) => LostFoundItem | undefined
  saveDraft: (draft: ItemDraft, existingId?: string) => SaveResult
  submitForApproval: (draft: ItemDraft, existingId?: string) => SaveResult
  approveItem: (id: string) => void
  returnToDraft: (id: string) => void
  updateStatus: (id: string, status: OperationalStatus) => void
  markExcelReady: (id: string) => void
  markExcelExported: (ids: string[]) => void
  closeItem: (id: string) => void
}

interface SaveResult {
  ok: boolean
  errors: FieldErrors
  item?: LostFoundItem
}

const ItemStoreContext = createContext<ItemStoreValue | null>(null)

function nowIso(): string {
  return new Date().toISOString()
}

function fromDraft(
  draft: ItemDraft,
  existing: LostFoundItem | undefined,
  recordState: RecordState,
): LostFoundItem {
  const timestamp = nowIso()
  const matchDate = draft.matchDate.trim() ? draft.matchDate.trim() : null
  const base: LostFoundItem = {
    id: existing?.id ?? createId(),
    itemId: normalizeItemId(draft.itemId),
    description: draft.description.trim(),
    foundDate: draft.foundDate,
    matchDate,
    recordState,
    operationalStatus: draft.operationalStatus,
    workflowDates: {
      verify: null,
      donate: null,
      lastChance: null,
      sevenDayNotice: null,
      expiresOn: null,
    },
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    submittedAt:
      recordState === 'pending_approval' || recordState === 'approved'
        ? (existing?.submittedAt ?? timestamp)
        : existing?.submittedAt ?? null,
    approvedAt: existing?.approvedAt ?? null,
    excelReady: existing?.excelReady ?? false,
    excelExportedAt: existing?.excelExportedAt ?? null,
  }
  return applyWorkflowDates(base)
}

export function ItemStoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<LostFoundItem[]>(() => loadItems())

  const persist = useCallback((next: LostFoundItem[]) => {
    setItems(next)
    saveItems(next)
  }, [])

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  )

  const upsert = useCallback(
    (draft: ItemDraft, existingId: string | undefined, recordState: RecordState): SaveResult => {
      const errors = validateItemDraft(draft, items, { currentItemId: existingId })
      if (hasFieldErrors(errors)) return { ok: false, errors }
      const existing = existingId ? items.find((item) => item.id === existingId) : undefined
      const saved = fromDraft(draft, existing, recordState)
      const next = existing
        ? items.map((item) => (item.id === existing.id ? saved : item))
        : [saved, ...items]
      persist(next)
      return { ok: true, errors: {}, item: saved }
    },
    [items, persist],
  )

  const saveDraft = useCallback(
    (draft: ItemDraft, existingId?: string) => upsert(draft, existingId, 'draft'),
    [upsert],
  )

  const submitForApproval = useCallback(
    (draft: ItemDraft, existingId?: string) => upsert(draft, existingId, 'pending_approval'),
    [upsert],
  )

  const approveItem = useCallback(
    (id: string) => {
      persist(
        items.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            recordState: 'approved',
            approvedAt: nowIso(),
            updatedAt: nowIso(),
            excelReady: false,
          }
        }),
      )
    },
    [items, persist],
  )

  const returnToDraft = useCallback(
    (id: string) => {
      persist(
        items.map((item) => {
          if (item.id !== id) return item
          return {
            ...item,
            recordState: 'draft',
            submittedAt: null,
            approvedAt: null,
            excelReady: false,
            updatedAt: nowIso(),
          }
        }),
      )
    },
    [items, persist],
  )

  const updateStatus = useCallback(
    (id: string, status: OperationalStatus) => {
      persist(
        items.map((item) => {
          if (item.id !== id) return item
          const recordState =
            status === 'closed' ||
            status === 'picked_up' ||
            status === 'donated' ||
            status === 'donated_by_owner'
              ? 'closed'
              : item.recordState
          return applyWorkflowDates({
            ...item,
            operationalStatus: status,
            recordState,
            updatedAt: nowIso(),
          })
        }),
      )
    },
    [items, persist],
  )

  const markExcelReady = useCallback(
    (id: string) => {
      persist(
        items.map((item) =>
          item.id === id
            ? { ...item, excelReady: true, updatedAt: nowIso() }
            : item,
        ),
      )
    },
    [items, persist],
  )

  const markExcelExported = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      const timestamp = nowIso()
      persist(
        items.map((item) =>
          idSet.has(item.id)
            ? { ...item, excelExportedAt: timestamp, updatedAt: timestamp }
            : item,
        ),
      )
    },
    [items, persist],
  )

  const closeItem = useCallback(
    (id: string) => {
      persist(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                recordState: 'closed',
                operationalStatus: item.operationalStatus === 'open' ? 'closed' : item.operationalStatus,
                updatedAt: nowIso(),
              }
            : item,
        ),
      )
    },
    [items, persist],
  )

  const value = useMemo<ItemStoreValue>(
    () => ({
      items,
      getItem,
      saveDraft,
      submitForApproval,
      approveItem,
      returnToDraft,
      updateStatus,
      markExcelReady,
      markExcelExported,
      closeItem,
    }),
    [
      items,
      getItem,
      saveDraft,
      submitForApproval,
      approveItem,
      returnToDraft,
      updateStatus,
      markExcelReady,
      markExcelExported,
      closeItem,
    ],
  )

  return <ItemStoreContext.Provider value={value}>{children}</ItemStoreContext.Provider>
}

export function useItemStore(): ItemStoreValue {
  const value = useContext(ItemStoreContext)
  if (!value) {
    throw new Error('useItemStore must be used within ItemStoreProvider')
  }
  return value
}

export function itemToDraft(item: LostFoundItem): ItemDraft {
  return {
    itemId: item.itemId,
    description: item.description,
    foundDate: item.foundDate,
    matchDate: item.matchDate ?? '',
    operationalStatus: item.operationalStatus,
  }
}
