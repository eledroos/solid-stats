import html2canvas from 'html2canvas';

export async function captureAndShare(
  element: HTMLElement,
  filename: string = 'MySolidStats.png'
): Promise<void> {
  // Wait for fonts to be loaded
  await document.fonts.ready;

  // Small delay to ensure rendering is complete
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    const canvas = await html2canvas(element, {
      scale: 3,                    // High quality
      useCORS: true,               // Handle external resources
      allowTaint: false,
      backgroundColor: '#F8FAFC',
      logging: false,
      // Use the element's actual dimensions
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
      onclone: (clonedDoc) => {
        // Fix any transform issues in the cloned document
        const clonedElement = clonedDoc.body.querySelector('[data-share-card]');
        if (clonedElement instanceof HTMLElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.overflow = 'visible';
        }
      }
    });

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });

    if (!blob) {
      throw new Error('Failed to create image');
    }

    // Try native share first
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'My SolidStats',
          text: 'Check out my Solidcore stats! #SolidStats'
        });
        return;
      } catch (error) {
        // If user cancelled, don't fall through to download
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Otherwise, fall through to download
      }
    }

    // Fallback to download
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Error capturing image:', error);
    throw new Error('Could not generate image. Please try screenshotting manually!');
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
