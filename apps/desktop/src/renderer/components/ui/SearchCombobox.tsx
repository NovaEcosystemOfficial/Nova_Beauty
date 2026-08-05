import { ChevronDown, Plus, Search, X } from "lucide-react";
import clsx from "clsx";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent
} from "react";

export type ComboboxItem = {
  id: string;
  label: string;
  meta?: string;
};

type SearchComboboxProps = {
  items: ComboboxItem[];
  valueId: string | null;
  placeholder: string;
  createLabel: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onClear?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

export default function SearchCombobox({
  items,
  valueId,
  placeholder,
  createLabel,
  onSelect,
  onCreate,
  onClear,
  disabled,
  autoFocus
}: SearchComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);

  const selected = useMemo(
    () => (valueId ? items.find((i) => i.id === valueId) : undefined),
    [items, valueId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        (i.meta ? i.meta.toLowerCase().includes(q) : false)
    );
  }, [items, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  const showCreate = true;
  const optionCount = filtered.length + (showCreate ? 1 : 0);

  const pick = (id: string) => {
    onSelect(id);
    setOpen(false);
    setQuery("");
  };

  const create = () => {
    setOpen(false);
    setQuery("");
    onCreate();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % Math.max(optionCount, 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + optionCount) % Math.max(optionCount, 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlight < filtered.length) {
        pick(filtered[highlight].id);
      } else {
        create();
      }
    }
  };

  const display = open ? query : selected ? selected.label : "";

  return (
    <div
      ref={rootRef}
      className={clsx("nb-combo", open && "isOpen", disabled && "isDisabled")}
    >
      <div className="nb-comboControl">
        <Search className="nb-comboSearchIcon" aria-hidden={true} />
        <input
          ref={inputRef}
          className="nb-comboInput"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={display}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (valueId && onClear) onClear();
          }}
          onFocus={() => {
            setOpen(true);
            if (selected && !query) setQuery(selected.label);
          }}
          onKeyDown={onKeyDown}
        />
        {selected && !open ? (
          <button
            type="button"
            className="nb-comboClear"
            aria-label="Deseleziona"
            onClick={() => {
              onClear?.();
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            <X className="nb-comboClearIcon" aria-hidden={true} />
          </button>
        ) : (
          <ChevronDown className="nb-comboChevron" aria-hidden={true} />
        )}
      </div>

      {open ? (
        <div className="nb-comboMenu" id={listId} role="listbox">
          {filtered.length === 0 ? (
            <div className="nb-comboEmpty">Nessun risultato</div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={valueId === item.id}
                className={clsx(
                  "nb-comboOption",
                  idx === highlight && "isHighlight",
                  valueId === item.id && "isSelected"
                )}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => pick(item.id)}
              >
                <span className="nb-comboOptionLabel">{item.label}</span>
                {item.meta ? <span className="nb-comboOptionMeta">{item.meta}</span> : null}
              </button>
            ))
          )}

          <button
            type="button"
            className={clsx(
              "nb-comboCreate",
              highlight === filtered.length && "isHighlight"
            )}
            onMouseEnter={() => setHighlight(filtered.length)}
            onClick={create}
          >
            <Plus className="nb-comboCreateIcon" aria-hidden={true} />
            {createLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
