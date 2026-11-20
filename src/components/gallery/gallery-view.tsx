"use client";

import { Download, FolderPlus, Loader2 } from "lucide-react";
import { useCallback, useRef, useState, useTransition } from "react";

import { PhotoGrid } from "@/components/gallery/photo-grid";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { GalleryImage } from "@/lib/media";
import {
  addToCollection,
  getDownloadUrls,
  loadMorePhotos,
  toggleFavorite,
} from "@/server/actions/collections";

/** What the viewer is looking at, which the server uses to re-check access. */
type Scope = { kind: "gallery"; slug: string } | { kind: "collection"; token: string };

const NEW_COLLECTION = "__new__";

/** Download URLs are signed this many photos at a time, just before they are fetched. */
const ZIP_BATCH = 10;
/** Larger selections are streamed straight to disk instead of being held in memory. */
const IN_MEMORY_ZIP_MAX = 40;

type ZipResult =
  { status: "saved"; count: number } | { status: "too-large" | "cancelled" | "empty" };

interface SaveFilePicker {
  (options: {
    suggestedName: string;
    types: { description: string; accept: Record<string, string[]> }[];
  }): Promise<{ createWritable(): Promise<WritableStream<Uint8Array>> }>;
}

/**
 * Saves the selected photos as one zip.
 *
 * URLs are requested in small batches while the archive is being written, so
 * a long download never outlives its short-lived links. A small selection is
 * assembled in memory. A large one is streamed to a file the visitor picks,
 * where the browser supports that, so memory stays flat; elsewhere the caller
 * is told the selection is too large.
 */
async function saveZip(
  ids: string[],
  signBatch: (batch: string[]) => Promise<{ name: string; url: string }[]>,
  filename: string,
): Promise<ZipResult> {
  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker;
  const streamToDisk = ids.length > IN_MEMORY_ZIP_MAX;
  if (streamToDisk && !picker) return { status: "too-large" };

  // Sign the first batch up front: an empty answer means downloads are off.
  const firstBatch = await signBatch(ids.slice(0, ZIP_BATCH));
  if (firstBatch.length === 0) return { status: "empty" };

  let count = 0;
  async function* files() {
    for (let start = 0; start < ids.length; start += ZIP_BATCH) {
      const batch = start === 0 ? firstBatch : await signBatch(ids.slice(start, start + ZIP_BATCH));
      for (const item of batch) {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`Could not download ${item.name}`);
        count += 1;
        yield { name: item.name, input: response };
      }
    }
  }

  const { downloadZip } = await import("client-zip");
  if (streamToDisk && picker) {
    let writable: WritableStream<Uint8Array>;
    try {
      const handle = await picker({
        suggestedName: filename,
        types: [{ description: "Zip archive", accept: { "application/zip": [".zip"] } }],
      });
      writable = await handle.createWritable();
    } catch {
      // The visitor closed the save dialog.
      return { status: "cancelled" };
    }
    const body = downloadZip(files()).body;
    if (!body) throw new Error("Could not create the archive");
    await body.pipeTo(writable);
    return { status: "saved", count };
  }

  const blob = await downloadZip(files()).blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return { status: "saved", count };
}

/**
 * The interactive photo view for a client gallery or a shared collection:
 * the grid and lightbox, plus (when allowed) selection, favorites, adding to
 * collections, paging and zip downloads. Every server call re-checks access.
 */
export function GalleryView({
  scope,
  initialImages,
  total,
  canDownload,
  canManageCollections = false,
  initialFavoriteIds = [],
  collections = [],
  archiveUrl,
  zipName,
}: {
  scope: Scope;
  initialImages: GalleryImage[];
  total: number;
  canDownload: boolean;
  canManageCollections?: boolean;
  initialFavoriteIds?: string[];
  collections?: { id: string; title: string }[];
  /** Link to the prebuilt archive of the whole gallery, when one exists. */
  archiveUrl?: string;
  zipName: string;
}) {
  const [images, setImages] = useState(initialImages);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set(initialFavoriteIds));
  const [knownCollections, setKnownCollections] = useState(collections);
  const [target, setTarget] = useState(collections[0]?.id ?? NEW_COLLECTION);
  const [status, setStatus] = useState("");
  const [busy, startTransition] = useTransition();
  const lastSelected = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const selectable = canManageCollections || canDownload;

  const toggleSelected = useCallback(
    (id: string, range: boolean) => {
      setSelected((current) => {
        const next = new Set(current);
        const anchor = lastSelected.current;
        if (range && anchor) {
          const from = images.findIndex((image) => image.id === anchor);
          const to = images.findIndex((image) => image.id === id);
          if (from !== -1 && to !== -1) {
            for (const image of images.slice(Math.min(from, to), Math.max(from, to) + 1))
              next.add(image.id);
            return next;
          }
        }
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      lastSelected.current = id;
    },
    [images],
  );

  const run = (work: () => Promise<void>) =>
    startTransition(async () => {
      try {
        await work();
      } catch {
        setStatus("Something went wrong. Reload the page and try again.");
      }
    });

  const onFavorite = (id: string) => {
    if (scope.kind !== "gallery") return;
    run(async () => {
      const { favorite } = await toggleFavorite(scope.slug, id);
      setFavorites((current) => {
        const next = new Set(current);
        if (favorite) next.add(id);
        else next.delete(id);
        return next;
      });
      setStatus(favorite ? "Added to Favorites." : "Removed from Favorites.");
    });
  };

  const onLoadMore = () => {
    if (scope.kind !== "gallery") return;
    run(async () => {
      const more = await loadMorePhotos(scope.slug, images.length);
      setImages((current) => [...current, ...more]);
    });
  };

  const onDownload = (ids: string[] = images.map((image) => image.id)) =>
    run(async () => {
      setStatus("Preparing your download…");
      const result = await saveZip(ids, (batch) => getDownloadUrls(scope, batch), zipName);
      if (result.status === "saved") {
        setStatus(`Downloaded ${result.count} ${result.count === 1 ? "photo" : "photos"}.`);
      } else if (result.status === "too-large") {
        setStatus(
          archiveUrl
            ? `This browser can save up to ${IN_MEMORY_ZIP_MAX} photos at once. Use "Download all" for the full set, or select fewer photos.`
            : `This browser can save up to ${IN_MEMORY_ZIP_MAX} photos at once. Select fewer photos, or use Chrome or Edge on a computer for larger downloads.`,
        );
      } else if (result.status === "cancelled") {
        setStatus("Download cancelled.");
      } else {
        setStatus("Downloads are not available.");
      }
    });

  const onAddToCollection = (formData: FormData) => {
    if (scope.kind !== "gallery") return;
    const title = String(formData.get("title") ?? "");
    const createdByName = String(formData.get("createdByName") ?? "");
    run(async () => {
      const result = await addToCollection(
        scope.slug,
        target === NEW_COLLECTION ? { title, createdByName } : { collectionId: target },
        [...selected],
      );
      if (!knownCollections.some((collection) => collection.id === result.collectionId)) {
        setKnownCollections((current) => [
          ...current,
          { id: result.collectionId, title: result.title },
        ]);
        setTarget(result.collectionId);
      }
      setStatus(
        `Added ${selected.size} ${selected.size === 1 ? "photo" : "photos"} to ${result.title}.`,
      );
      setSelected(new Set());
      dialogRef.current?.close();
    });
  };

  return (
    <div>
      {selectable ? (
        <div className="bg-background/90 sticky top-16 z-30 mb-4 flex flex-wrap items-center gap-2 border-b py-3 backdrop-blur">
          <p className="mr-auto text-sm font-medium" data-testid="selection-count">
            {selected.size} selected
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelected(new Set(images.map((image) => image.id)))}
          >
            Select all
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={selected.size === 0}
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
          {canManageCollections && scope.kind === "gallery" ? (
            <Button
              size="sm"
              disabled={selected.size === 0 || busy}
              onClick={() => dialogRef.current?.showModal()}
            >
              <FolderPlus aria-hidden />
              Add to collection
            </Button>
          ) : null}
          {canDownload ? (
            <Button
              variant="outline"
              size="sm"
              disabled={selected.size === 0 || busy}
              onClick={() => onDownload([...selected])}
            >
              <Download aria-hidden />
              Download selected
            </Button>
          ) : null}
          {canDownload && scope.kind === "collection" ? (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => onDownload()}>
              <Download aria-hidden />
              Download all
            </Button>
          ) : null}
          {canDownload && archiveUrl ? (
            <a
              href={archiveUrl}
              className="hover:bg-muted inline-flex h-8 items-center gap-2 rounded-md border px-3 text-sm font-medium"
            >
              <Download className="size-4" aria-hidden />
              Download all
            </a>
          ) : null}
        </div>
      ) : null}

      <p
        aria-live="polite"
        className="text-muted-foreground mb-3 flex min-h-5 items-center gap-2 text-sm"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {status}
      </p>

      <PhotoGrid
        images={images}
        selection={selectable ? { selected, onToggle: toggleSelected } : undefined}
        favorites={
          canManageCollections && scope.kind === "gallery"
            ? { ids: favorites, onToggle: onFavorite }
            : undefined
        }
      />

      {scope.kind === "gallery" && images.length < total ? (
        <div className="mt-8 text-center">
          <Button variant="outline" disabled={busy} onClick={onLoadMore}>
            Load more ({total - images.length} remaining)
          </Button>
        </div>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-labelledby="add-to-collection-title"
        className="bg-card text-foreground m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border p-6 shadow-xl backdrop:bg-black/50"
      >
        <form action={onAddToCollection} className="space-y-4">
          <h2 id="add-to-collection-title" className="text-lg font-semibold">
            Add {selected.size} {selected.size === 1 ? "photo" : "photos"} to a collection
          </h2>
          <div>
            <Label htmlFor="collection-target">Collection</Label>
            <Select
              id="collection-target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {knownCollections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title}
                </option>
              ))}
              <option value={NEW_COLLECTION}>New collection…</option>
            </Select>
          </div>
          {target === NEW_COLLECTION ? (
            <>
              <div>
                <Label htmlFor="collection-title">Name of the new collection</Label>
                <Input id="collection-title" name="title" maxLength={120} required />
              </div>
              <div>
                <Label htmlFor="collection-author">Your name (optional)</Label>
                <Input
                  id="collection-author"
                  name="createdByName"
                  maxLength={80}
                  autoComplete="name"
                />
              </div>
            </>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => dialogRef.current?.close()}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Add
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
