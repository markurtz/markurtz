"use client";

import YetAnotherLightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Download from "yet-another-react-lightbox/plugins/download";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import type { GalleryImage } from "@/lib/media";

/**
 * The shared lightbox. Arrow keys move between photos and Escape closes it.
 * Loaded on demand by `PhotoGrid`, so pages that never open it ship no
 * lightbox code. The download button appears only for images that allow it.
 */
export default function Lightbox({
  images,
  index,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
}) {
  const canDownload = images.some((image) => image.downloadUrl);

  return (
    <YetAnotherLightbox
      open
      index={index}
      close={onClose}
      plugins={canDownload ? [Captions, Download] : [Captions]}
      captions={{ descriptionTextAlign: "center" }}
      controller={{ closeOnBackdropClick: true }}
      // Downloads go to the server route, which re-checks access and redirects
      // to a short-lived URL. Navigating avoids a cross-origin fetch.
      download={{
        download: ({ slide }) => {
          const url = typeof slide.download === "string" ? slide.download : undefined;
          if (url) window.location.assign(url);
        },
      }}
      slides={images.map((image) => ({
        src: image.fullSrc ?? image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
        description: image.caption,
        download: image.downloadUrl,
      }))}
    />
  );
}
